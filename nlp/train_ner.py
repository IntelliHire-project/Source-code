"""
IntelliHire NLP - Resume NER Model Trainer
Trains a custom spaCy Named Entity Recognition (NER) model
for automated CV data extraction.
"""

import os
import random
import spacy
from spacy.training import Example
from spacy.util import minibatch, compounding
from training_data import get_training_data

MODEL_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "models", "resume_ner_model")

def train_model(epochs: int = 35, output_dir: str = MODEL_OUTPUT_DIR):
    print("=" * 65)
    print("🚀 Starting IntelliHire Resume NER Model Training with spaCy...")
    print("=" * 65)

    # 1. Load base pre-trained English model
    print("[1/4] Loading base model 'en_core_web_sm'...")
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception as e:
        print(f"Error loading en_core_web_sm: {e}. Downloading or loading blank...")
        nlp = spacy.blank("en")

    # 2. Get or add 'ner' component
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner", last=True)
    else:
        ner = nlp.get_pipe("ner")

    # 3. Register custom labels
    custom_labels = ["NAME", "DESIGNATION", "COMPANY", "DEGREE", "COLLEGE", "SKILLS", "EXPERIENCE"]
    print(f"[2/4] Registering custom CV entity labels: {', '.join(custom_labels)}")
    for label in custom_labels:
        ner.add_label(label)

    # 4. Prepare training examples
    raw_data = get_training_data()
    print(f"[3/4] Loaded {len(raw_data)} annotated CV training profiles.")

    # Convert to spaCy Example objects with boundary alignment
    train_examples = []
    for text, annotations in raw_data:
        doc = nlp.make_doc(text)
        aligned_ents = []
        for start, end, label in annotations.get("entities", []):
            span = doc.char_span(start, end, label=label, alignment_mode="contract")
            if span is None:
                span = doc.char_span(start, end, label=label, alignment_mode="expand")
            if span is not None:
                aligned_ents.append((span.start_char, span.end_char, span.label_))
        example = Example.from_dict(doc, {"entities": aligned_ents})
        train_examples.append(example)

    # Disable all other pipeline components during training to freeze them
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]
    with nlp.disable_pipes(*other_pipes):
        optimizer = nlp.resume_training()
        print(f"[4/4] Training for {epochs} epochs...")
        
        for epoch in range(1, epochs + 1):
            random.shuffle(train_examples)
            losses = {}
            # Compounding batch size from 4 up to 32
            batches = minibatch(train_examples, size=compounding(4.0, 32.0, 1.001))
            
            for batch in batches:
                nlp.update(batch, drop=0.3, losses=losses, sgd=optimizer)

            if epoch % 5 == 0 or epoch == epochs:
                print(f"   Epoch {epoch:02d}/{epochs:02d} | NER Loss: {losses.get('ner', 0.0):.4f}")

    # 5. Save the trained model
    os.makedirs(output_dir, exist_ok=True)
    nlp.to_disk(output_dir)
    print("=" * 65)
    print(f"✅ Training completed! Model saved successfully to:")
    print(f"   📂 {output_dir}")
    print("=" * 65)

    # 6. Run an inference test on a test CV
    print("\n🔍 Running verification test on unseen CV profile:")
    test_text = (
        "Sarah Jenkins\n"
        "Lead Full Stack Architect\n"
        "Email: s.jenkins@innovate.io | Phone: +1 415-890-1234\n"
        "Experience:\n"
        "Lead Full Stack Architect at Virtusa (2021 - Present)\n"
        "Architected scalable cloud native solutions with React, TypeScript, Docker, and AWS.\n"
        "Senior Software Engineer at WSO2 (2018 - 2021)\n"
        "Education:\n"
        "Master of Science in Software Engineering from University of Moratuwa\n"
        "Bachelor of Science in Computer Science from SLIIT\n"
        "Skills: React, TypeScript, Python, Node.js, Kubernetes, AWS, Docker, PostgreSQL"
    )

    doc = nlp(test_text)
    print("-" * 50)
    print(f"{'ENTITY TEXT':<35} | {'LABEL':<15}")
    print("-" * 50)
    found_entities = False
    for ent in doc.ents:
        if ent.label_ in custom_labels or ent.label_ in ("PERSON", "ORG"):
            found_entities = True
            print(f"{ent.text.strip():<35} | {ent.label_:<15}")
    if not found_entities:
        print("No entities found.")
    print("-" * 50)

    return nlp

if __name__ == "__main__":
    train_model(epochs=35)
