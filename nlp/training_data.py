"""
IntelliHire NLP - Resume NER Training Dataset
Loads and cleans external annotated CV datasets (e.g. Kaggle / DataTurks)
for training a custom spaCy NER model with labels:
NAME, DESIGNATION, COMPANY, DEGREE, COLLEGE, SKILLS, EXPERIENCE
"""

import os
import json
import re
from typing import List, Tuple, Dict, Any

LABEL_MAP = {
    "Name": "NAME",
    "Designation": "DESIGNATION",
    "Companies worked at": "COMPANY",
    "Degree": "DEGREE",
    "College Name": "COLLEGE",
    "Skills": "SKILLS",
    "Years of Experience": "EXPERIENCE",
}

def load_external_dataset_file(file_path: str) -> List[Tuple[str, Dict[str, Any]]]:
    """
    Loads, realigns, and cleans external annotated resume datasets (e.g. DataTurks / Kaggle JSONL format).
    Corrects offset drift, extracts sub-skills, strips punctuation, and ensures non-overlapping spans.
    """
    records = []
    if not os.path.isfile(file_path):
        return records

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line_str = line.strip()
                if not line_str:
                    continue
                try:
                    item = json.loads(line_str)
                except Exception:
                    continue

                content = item.get("content", "")
                if not content or not content.strip():
                    continue

                entities = []
                for ann in item.get("annotation", []):
                    labels = ann.get("label", [])
                    if not labels:
                        continue
                    lbl = labels[0]
                    if lbl not in LABEL_MAP:
                        continue
                    mapped_label = LABEL_MAP[lbl]

                    for pt in ann.get("points", []):
                        raw_text = pt.get("text", "")
                        hint_start = pt.get("start", 0)

                        # If multi-skill string with commas or newlines, split into clean individual skills
                        if mapped_label == "SKILLS" and ("\n" in raw_text or "," in raw_text):
                            sub_terms = [s.strip() for s in re.split(r"[\n,•·\t]+", raw_text) if s.strip()]
                        else:
                            sub_terms = [raw_text.strip()]

                        for term in sub_terms:
                            # Strip leading/trailing non-alphanumeric punctuation
                            clean_term = re.sub(r"^[^\w]+|[^\w]+$", "", term)
                            if not clean_term or len(clean_term) < 2 or len(clean_term) > 60:
                                continue
                            if "\n" in clean_term or "\r" in clean_term:
                                continue

                            # Search within window of hint_start first to mitigate offset drift
                            search_min = max(0, hint_start - 80)
                            search_max = min(len(content), hint_start + 80 + len(clean_term))
                            idx = content.find(clean_term, search_min, search_max)
                            if idx == -1:
                                # Fallback to search within entire document
                                idx = content.find(clean_term)

                            if idx != -1:
                                entities.append((idx, idx + len(clean_term), mapped_label))

                # Remove duplicates and overlaps: sort by start ascending, then length descending
                entities.sort(key=lambda x: (x[0], -(x[1] - x[0])))
                non_overlapping = []
                last_end = -1
                for s, e, lbl in entities:
                    if s >= last_end:
                        non_overlapping.append((s, e, lbl))
                        last_end = e

                if non_overlapping:
                    records.append((content, {"entities": non_overlapping}))
    except Exception as e:
        print(f"[IntelliHire NLP] Error loading external dataset from '{file_path}': {e}")

    return records

def load_all_external_datasets() -> List[Tuple[str, Dict[str, Any]]]:
    """
    Finds and loads all JSON/JSONL datasets in nlp/data directory.
    """
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    if not os.path.isdir(data_dir):
        return []

    combined = []
    for fname in sorted(os.listdir(data_dir)):
        if fname.lower().endswith((".json", ".jsonl")):
            fpath = os.path.join(data_dir, fname)
            parsed = load_external_dataset_file(fpath)
            if parsed:
                print(f"[IntelliHire NLP] Loaded {len(parsed)} CV profiles from external dataset: {fname}")
                combined.extend(parsed)

    return combined

def get_training_data() -> List[Tuple[str, Dict[str, Any]]]:
    """
    Loads all annotated CV training samples exclusively from external datasets in nlp/data/.
    """
    dataset = load_all_external_datasets()
    print(f"[IntelliHire NLP] Total external training profiles ready: {len(dataset)}.")
    return dataset
