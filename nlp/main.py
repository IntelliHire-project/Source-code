import io
import re
import base64
import xml.etree.ElementTree as ET
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import spacy
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams

app = FastAPI(title="IntelliHire NLP & CV Extraction Service")
nlp = spacy.load("en_core_web_sm")

class CVText(BaseModel):
    text: Optional[str] = None
    xml: Optional[str] = None
    pdf_base64: Optional[str] = None

class PDFPayload(BaseModel):
    pdf_base64: str

class XMLPayload(BaseModel):
    xml: str

COMMON_SKILLS = [
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "ruby", "php",
    "swift", "kotlin", "dart", "go", "rust", "scala", "r", "bash", "shell", "html", "css",
    # Frontend
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "nuxt.js", "angular",
    "svelte", "redux", "redux toolkit", "mobx", "sass", "scss", "tailwind", "tailwind css",
    "tailwindcss", "bootstrap", "material ui", "chakra ui", "webpack", "vite",
    # Backend & Frameworks
    "node.js", "nodejs", "express", "express.js", "nestjs", "django", "flask",
    "fastapi", "spring", "spring boot", "ruby on rails", "rails", "asp.net",
    ".net", "laravel", "graphql", "rest api", "microservices",
    # Databases & Storage
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
    "oracle", "cassandra", "dynamodb", "firebase", "supabase", "prisma", "typeorm",
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker",
    "kubernetes", "k8s", "terraform", "ansible", "ci/cd", "jenkins", "github actions",
    "git", "github", "gitlab", "bitbucket", "linux", "nginx", "apache",
    # Data Science & AI
    "machine learning", "deep learning", "data science", "nlp", "computer vision",
    "artificial intelligence", "pandas", "numpy", "scikit-learn", "tensorflow",
    "pytorch", "keras", "opencv", "power bi", "tableau",
    # Tools & Management
    "jira", "confluence", "figma", "postman", "agile", "scrum"
]

def pdf_to_xml(pdf_bytes: bytes) -> str:
    """
    Converts a PDF binary into a structured XML representation preserving
    pages, textboxes, textlines, and character layout bounding boxes.
    """
    output_fp = io.BytesIO()
    laparams = LAParams(
        line_overlap=0.5,
        char_margin=2.0,
        line_margin=0.5,
        word_margin=0.1,
        boxes_flow=0.5,
        detect_vertical=False
    )
    extract_text_to_fp(io.BytesIO(pdf_bytes), output_fp, output_type='xml', laparams=laparams)
    xml_str = output_fp.getvalue().decode('utf-8', errors='ignore')
    return xml_str

def extract_text_from_xml(xml_content: str) -> str:
    """
    Extracts text from PDF-XML structure (pdfminer XML tags or generic XML tags)
    while preserving page structure and line ordering.
    """
    if not xml_content or not xml_content.strip():
        return ""

    try:
        root = ET.fromstring(xml_content.strip())
    except Exception:
        try:
            root = ET.fromstring(xml_content.strip().encode('utf-8'))
        except Exception:
            # Fallback for slightly malformed XML: strip tags
            return re.sub(r'<[^>]+>', ' ', xml_content).strip()

    # Search for pages in pdfminer XML structure (<pages><page><textbox>...)
    pages = root.findall('.//page')
    if pages:
        page_chunks = []
        for page in pages:
            textboxes = page.findall('.//textbox')
            if textboxes:
                for tb in textboxes:
                    lines = []
                    for line in tb.findall('.//textline'):
                        chars = [t.text or '' for t in line.findall('text')]
                        clean_line = ''.join(chars).strip()
                        if clean_line:
                            lines.append(clean_line)
                    if lines:
                        page_chunks.append("\n".join(lines))
            else:
                for line in page.findall('.//textline'):
                    chars = [t.text or '' for t in line.findall('text')]
                    clean_line = ''.join(chars).strip()
                    if clean_line:
                        page_chunks.append(clean_line)
        return "\n\n".join(page_chunks)

    # Generic XML tag extraction
    all_text = "".join(root.itertext())
    return all_text.strip()

NAME_BLACKLIST = {
    "curriculum", "vitae", "resume", "cv", "profile", "summary", "contact",
    "contacts", "about", "me", "experience", "education", "skills", "skill",
    "projects", "project", "references", "reference", "personal", "portfolio",
    "developer", "engineer", "designer", "manager", "architect", "analyst",
    "intern", "associate", "specialist", "consultant", "director", "lead",
    "senior", "junior", "student", "undergraduate", "graduate", "page",
    "information", "details", "work", "history", "employment", "academic",
    "background", "objective", "career", "phone", "email", "address",
    "tel", "mobile", "linkedin", "github", "website", "university", "college",
    "institute", "school", "faculty", "department", "degree", "bachelor",
    "master", "phd", "diploma", "qualification", "qualifications", "interests"
}

def is_valid_name(candidate: str) -> bool:
    """
    Checks if a string looks like a legitimate human name and is not
    a resume title, role, or contact label.
    """
    if not candidate or len(candidate.strip()) < 3:
        return False
    candidate = candidate.strip()
    # Strip common titles / prefixes
    cleaned = re.sub(r'^(mr\.|mrs\.|ms\.|dr\.|prof\.|miss)\s*', '', candidate, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r'["\'\(\)\[\]]', '', cleaned).strip()
    words = cleaned.split()
    if not (1 < len(words) <= 4):
        return False
    # No digits, emails, URLs, or symbols
    if re.search(r'[\d@/:;|#\$%&*+=<>{}\\]', cleaned):
        return False
    # Check each word against blacklist
    for w in words:
        clean_word = w.lower().strip(".,")
        if clean_word in NAME_BLACKLIST:
            return False
        # Must only contain letters and hyphens
        if not re.match(r'^[a-zA-Z\.\-]+$', clean_word):
            return False
        if len(clean_word) == 1 and not w.endswith('.'):
            return False
    return True

def extract_name_from_xml(xml_content: str) -> Optional[str]:
    """
    Finds the candidate's name on Page 1 by locating the text with the
    largest font size (resume headings) that matches human name criteria.
    """
    if not xml_content:
        return None
    try:
        root = ET.fromstring(xml_content.strip())
    except Exception:
        try:
            root = ET.fromstring(xml_content.strip().encode('utf-8'))
        except Exception:
            return None

    first_page = root.find('.//page')
    if first_page is None:
        return None

    candidates = []
    for tb in first_page.findall('.//textbox'):
        for tl in tb.findall('.//textline'):
            chars = tl.findall('text')
            line_str = ''.join([c.text or '' for c in chars]).strip()
            line_str = re.sub(r'\s+', ' ', line_str)
            if not is_valid_name(line_str):
                continue

            sizes = []
            for c in chars:
                try:
                    s = float(c.attrib.get('size', 0))
                    if s > 0:
                        sizes.append(s)
                except (ValueError, TypeError):
                    pass
            max_size = max(sizes) if sizes else 0.0

            y_pos = 0.0
            bbox_str = tl.attrib.get('bbox', '')
            if bbox_str:
                parts = bbox_str.split(',')
                if len(parts) >= 2:
                    try:
                        y_pos = float(parts[1])
                    except ValueError:
                        pass

            candidates.append((max_size, y_pos, line_str))

    if not candidates:
        return None

    # Largest font size wins, then higher vertical position on page
    candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return candidates[0][2].strip().title()

def identify_section(line: str) -> Optional[str]:
    """
    Identifies if a line represents a resume section header,
    handling colons, bullets, numbering, and common variants.
    """
    if not line:
        return None
    cleaned = line.strip().lower()
    # Strip bullets, numbers, dashes at start: "1. Experience", "• Education"
    cleaned = re.sub(r'^[\d\.\-\*•–\s]+', '', cleaned)
    # Strip colons, dashes at end: "Experience:", "Education -"
    cleaned = re.sub(r'[:|\-–\s]+$', '', cleaned).strip()

    if not cleaned or len(cleaned) > 45:
        return None

    # Education
    if re.search(r'^(education|educational\s*qualifications?|educational\s*background|academic\s*qualifications?|academic\s*background|academics|qualifications?|degrees?)\b', cleaned):
        return "education"
    # Experience
    if re.search(r'^(work\s*experience|professional\s*experience|employment|work\s*history|experience|career\s*history|internships?|practical\s*experience)\b', cleaned):
        return "experience"
    # Skills
    if re.search(r'^(technical\s*skills|core\s*skills|key\s*skills|skills|technologies|competencies|tools\s*&\s*technologies|expertise|technical\s*proficiencies)\b', cleaned):
        return "skills"
    # Summary / Bio
    if re.search(r'^(professional\s*summary|profile|about\s*me|summary|career\s*objective|executive\s*summary|objective|about|bio)\b', cleaned):
        return "bio"
    # Languages
    if re.search(r'^(languages?|language\s*proficiency|spoken\s*languages?)\b', cleaned):
        return "language"
    # Projects / Certifications (used as section boundaries)
    if re.search(r'^(projects?|personal\s*projects?|certifications?|certificates?|interests?|awards?|references?)\b', cleaned):
        return "other"

    return None

def parse_experience_section(exp_lines: List[str]) -> List[Dict[str, str]]:
    """
    Extracts structured job entries (title, company, period, description)
    from experience section lines.
    """
    if not exp_lines:
        return []

    jobs = []
    current_job = None

    date_pattern = re.compile(
        r'((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(?:20\d{2}|19\d{2})\s*(?:[-–to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?(?:20\d{2}|19\d{2}|present|current)))|(?:20\d{2}\s*[-–to]\s*(?:20\d{2}|present|current))',
        re.IGNORECASE
    )
    role_pattern = re.compile(
        r'\b(engineer|developer|designer|manager|architect|analyst|lead|intern|specialist|consultant|administrator|officer|director|associate|scientist|instructor|programmer|technician|trainee)\b',
        re.IGNORECASE
    )

    for line in exp_lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        has_date = date_pattern.search(line_clean)
        has_role = role_pattern.search(line_clean)

        # Detect new job entry when line contains a date, role keyword, or delimiter
        if (has_date or has_role) and len(line_clean) < 100:
            if current_job:
                jobs.append(current_job)

            extracted_period = has_date.group(0).strip() if has_date else "Unknown"
            line_no_date = date_pattern.sub('', line_clean).strip(' |-–,\t')

            parts = re.split(r'\s+(?:[-–|•]|at|@)\s+', line_no_date, flags=re.IGNORECASE)
            title = "Professional Role"
            company = "Company"

            if len(parts) >= 2:
                p0, p1 = parts[0].strip(), parts[1].strip()
                if role_pattern.search(p0):
                    title = p0
                    company = p1
                elif role_pattern.search(p1):
                    title = p1
                    company = p0
                else:
                    title = p0
                    company = p1
            elif len(parts) == 1 and parts[0]:
                if role_pattern.search(parts[0]):
                    title = parts[0]
                else:
                    company = parts[0]

            current_job = {
                "title": title,
                "company": company,
                "period": extracted_period,
                "description": ""
            }
        elif current_job:
            if current_job["period"] == "Unknown" and has_date:
                current_job["period"] = has_date.group(0).strip()
            else:
                desc_text = line_clean.lstrip('•-*–> ')
                if current_job["description"]:
                    current_job["description"] += "\n" + desc_text
                else:
                    current_job["description"] = desc_text
        else:
            current_job = {
                "title": line_clean[:40],
                "company": "Company",
                "period": "Unknown",
                "description": ""
            }

    if current_job:
        jobs.append(current_job)

    return jobs[:6]

def parse_education_section(edu_lines: List[str]) -> List[Dict[str, str]]:
    """
    Extracts structured education entries (title, school, period)
    combining multi-line degree and university descriptions.
    """
    if not edu_lines:
        return []

    entries = []
    current_edu = None

    date_pattern = re.compile(
        r'((?:20\d{2}|19\d{2})\s*(?:[-–to]+\s*(?:20\d{2}|19\d{2}|present|current|expected))?)|(?:20\d{2})',
        re.IGNORECASE
    )
    degree_pattern = re.compile(
        r'\b(bachelor|bsc|b\.sc|master|msc|m\.sc|phd|doctorate|degree|diploma|associate|b\.tech|btech|b\.eng|beng|g\.c\.e|gce|al|ol|high\s*school)\b',
        re.IGNORECASE
    )
    school_pattern = re.compile(
        r'\b(university|institute|college|school|campus|academy|faculty|polytechnic)\b',
        re.IGNORECASE
    )

    for line in edu_lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        has_degree = degree_pattern.search(line_clean)
        has_school = school_pattern.search(line_clean)
        has_date = date_pattern.search(line_clean)

        if has_degree or has_school:
            if current_edu and (current_edu["title"] != "Degree/Program" or has_degree):
                entries.append(current_edu)
                current_edu = None

            if not current_edu:
                current_edu = {
                    "title": "Degree/Program",
                    "school": "Institution",
                    "period": "Unknown"
                }

            if has_degree:
                current_edu["title"] = line_clean
            if has_school:
                current_edu["school"] = line_clean
            if has_date:
                current_edu["period"] = has_date.group(0).strip()
        elif current_edu:
            if has_date and current_edu["period"] == "Unknown":
                current_edu["period"] = has_date.group(0).strip()
            elif current_edu["school"] == "Institution":
                current_edu["school"] = line_clean
        else:
            current_edu = {
                "title": line_clean,
                "school": "Institution",
                "period": has_date.group(0).strip() if has_date else "Unknown"
            }

    if current_edu:
        entries.append(current_edu)

    return entries[:4]

def parse_cv_text(text: str, xml_content: Optional[str] = None) -> Dict[str, Any]:
    """
    Extracts candidate profile fields from structured text using SpaCy NER and heuristics.
    """
    doc = nlp(text)

    # Extract email
    email = None
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    if email_match:
        email = email_match.group(0)
    else:
        email_match = re.search(r'[a-zA-Z0-9_.+-]+\s*@\s*[a-zA-Z0-9-]+\s*\.\s*[a-zA-Z0-9-.]+', text)
        if email_match:
            email = email_match.group(0).replace(" ", "")

    # Multi-tiered candidate name extraction
    name = None

    # Tier 1: Extract from XML font-size hierarchy (largest heading font on Page 1)
    if xml_content:
        name = extract_name_from_xml(xml_content)

    # Tier 2: Email username cross-verification
    if not name and email:
        username = email.split('@')[0]
        user_tokens = [t.lower() for t in re.split(r'[\._\-0-9]+', username) if len(t) >= 3]
        if user_tokens:
            for line in text.split('\n')[:12]:
                line_clean = line.strip()
                if is_valid_name(line_clean):
                    line_lower = line_clean.lower()
                    if any(tok in line_lower for tok in user_tokens):
                        name = line_clean.title()
                        break

    # Tier 3: SpaCy PERSON entity in the top document header
    if not name:
        header_text = text[:600]
        header_doc = nlp(header_text)
        for ent in header_doc.ents:
            if ent.label_ == "PERSON" and is_valid_name(ent.text):
                name = ent.text.strip().title()
                break

    # Tier 4: First valid line in the top 8 lines
    if not name:
        for line in text.split('\n')[:8]:
            line_clean = line.strip()
            if is_valid_name(line_clean):
                name = line_clean.title()
                break

    # Categorize document lines into sections
    section_lines = {
        "education": [],
        "experience": [],
        "skills": [],
        "bio": [],
        "language": []
    }

    current_section = None
    lines = text.splitlines()

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        detected_sec = identify_section(line_clean)
        if detected_sec:
            current_section = detected_sec
            continue

        if current_section and current_section in section_lines:
            section_lines[current_section].append(line_clean)

    # Extract Skills: Match COMMON_SKILLS + capture items directly from skills section
    skills_set = set()
    text_lower = text.lower()
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            skills_set.add(skill.title() if skill.lower() != "node.js" else "Node.js")

    # Add custom skills listed in the candidate's skills section
    for s_line in section_lines["skills"]:
        s_parts = re.split(r'[,|•/;\t]+', s_line)
        for p in s_parts:
            clean_p = p.strip()
            if 2 <= len(clean_p) <= 30 and not any(char.isdigit() for char in clean_p):
                skills_set.add(clean_p.title() if clean_p.lower() != "node.js" else "Node.js")

    skills = sorted(list(skills_set))

    # Parse Work Experience and Education
    experience = parse_experience_section(section_lines["experience"])
    education = parse_education_section(section_lines["education"])

    # Bio Summary
    bio = None
    if section_lines["bio"]:
        bio = " ".join(section_lines["bio"]).strip()
        bio = re.sub(r'\s+', ' ', bio)
        if len(bio) > 500:
            bio = bio[:497] + '...'

    # Languages
    language = "English"
    if section_lines["language"]:
        languages_found = []
        for l_line in section_lines["language"]:
            for item in re.split(r'[,|•/;]+', l_line):
                cleaned_lang = item.strip().title()
                if 2 < len(cleaned_lang) < 25 and cleaned_lang not in languages_found:
                    languages_found.append(cleaned_lang)
        if languages_found:
            language = ", ".join(languages_found)

    # Extract Phone
    phone = None
    phone_match = re.search(r'(?:(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4})|(?:0\d{2}[\s-]?\d{3}[\s-]?\d{4})', text)
    if phone_match:
        phone = phone_match.group(0).strip()

    # Extract Location
    location = None
    for ent in doc.ents:
        if ent.label_ == "GPE":
            location = ent.text
            break
    if not location:
        loc_match = re.search(r'(Colombo|Kandy|Galle|Malabe|Moratuwa|Kelaniya|Jaffna|Matara|Nugegoda|Sri Lanka|SriLanka|USA|UK|London|New York)', text, re.IGNORECASE)
        if loc_match:
            location = loc_match.group(0).title()

    # Extract LinkedIn
    linkedin = None
    cleaned_li_text = re.sub(r'linkedin\s*\.\s*com\s*/\s*', 'linkedin.com/', text, flags=re.IGNORECASE)
    cleaned_li_text = re.sub(r'linkedin\.com/(?:in|profile|pub)\s*/\s*', 'linkedin.com/in/', cleaned_li_text, flags=re.IGNORECASE)
    
    li_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/(?:in/|profile/|pub/)?([a-zA-Z0-9_.-]+)', cleaned_li_text, re.IGNORECASE)
    if li_match:
        li_user = li_match.group(1).rstrip('.,/)"\'')
        if li_user.lower() not in ["", "in", "profile", "user"]:
            linkedin = f"https://linkedin.com/in/{li_user}"

    if not linkedin:
        li_label = re.search(r'linkedin\s*(?:profile|link|url)?\s*[:|\-–\t]\s*@?([a-zA-Z0-9_\-]+)', text, re.IGNORECASE)
        if li_label:
            li_user = li_label.group(1).strip()
            if li_user.lower() not in ["http", "https", "link", "profile", "account", "url", "yes", "none", "na", "n/a", "com"]:
                linkedin = f"https://linkedin.com/in/{li_user}"

    # Extract GitHub
    github = None
    cleaned_gh_text = re.sub(r'github\s*\.\s*com\s*/\s*', 'github.com/', text, flags=re.IGNORECASE)
    cleaned_gh_text = re.sub(r'github\.com/\s+', 'github.com/', cleaned_gh_text, flags=re.IGNORECASE)

    gh_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_.-]+)', cleaned_gh_text, re.IGNORECASE)
    if gh_match:
        gh_user = gh_match.group(1).rstrip('.,/)"\'')
        if gh_user.lower() not in ["", "profile", "user", "in", "about", "repositories", "tab"]:
            github = f"https://github.com/{gh_user}"

    if not github:
        gh_label = re.search(r'(?:github|git)\s*(?:profile|link|account|url|id)?\s*[:|\-–\t]\s*@?([a-zA-Z0-9_\-]+)', text, re.IGNORECASE)
        if gh_label:
            gh_user = gh_label.group(1).strip()
            if gh_user.lower() not in ["http", "https", "link", "profile", "account", "url", "yes", "none", "na", "n/a", "com"]:
                github = f"https://github.com/{gh_user}"

    if not github:
        for line in text.splitlines():
            line_clean = line.strip()
            if "github" in line_clean.lower():
                at_match = re.search(r'@([a-zA-Z0-9_\-]+)', line_clean)
                if at_match:
                    github = f"https://github.com/{at_match.group(1)}"
                    break
                parts = [p.strip() for p in re.split(r'[:|\-–\s/]+', line_clean) if p.strip()]
                for idx, p in enumerate(parts):
                    if p.lower() == "github" and idx + 1 < len(parts):
                        next_token = parts[idx + 1].strip('@')
                        if re.match(r'^[a-zA-Z0-9_\-]+$', next_token) and next_token.lower() not in ["com", "profile", "link", "account"]:
                            github = f"https://github.com/{next_token}"
                            break

    # Extract Headline
    headline = None
    # 1. From latest job in experience
    if experience and len(experience) > 0 and experience[0].get("title") not in ["Professional Role", "New Experience", ""]:
        headline = experience[0].get("title")

    # 2. Check header lines right below the candidate's name
    if not headline:
        non_empty = [l.strip() for l in lines if l.strip()]
        for line in non_empty[1:6]:
            if re.search(r'\b(engineer|developer|designer|manager|architect|analyst|lead|intern|specialist|consultant|student|undergraduate)\b', line, re.IGNORECASE):
                if len(line) < 65 and not re.search(r'[@:/\\]', line):
                    headline = line.title()
                    break

    # 3. Fallback regex
    if not headline:
        headline_match = re.search(r'(software\s*engineer|full\s*stack\s*developer|frontend\s*developer|backend\s*developer|web\s*developer|data\s*scientist|cloud\s*engineer|devops\s*engineer|ui/ux\s*designer|mobile\s*developer|ai\s*engineer)', text, re.IGNORECASE)
        if headline_match:
            headline = headline_match.group(0).title()

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin": linkedin,
        "github": github,
        "headline": headline,
        "bio": bio,
        "language": language,
        "skills": skills,
        "education": education,
        "experience": experience
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "IntelliHire NLP"}

@app.post("/convert-to-xml")
async def convert_to_xml_endpoint(payload: Optional[PDFPayload] = None, file: Optional[UploadFile] = File(None)):
    """
    Converts an uploaded CV PDF into structured XML representation.
    Accepts either JSON { "pdf_base64": "..." } or multipart file upload.
    """
    pdf_bytes = None
    if file:
        pdf_bytes = await file.read()
    elif payload and payload.pdf_base64:
        try:
            pdf_bytes = base64.b64decode(payload.pdf_base64)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="No PDF data provided. Provide 'pdf_base64' in body or upload a file.")

    try:
        xml_content = pdf_to_xml(pdf_bytes)
        return {
            "xml": xml_content,
            "size": len(xml_content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF to XML conversion failed: {str(e)}")

@app.post("/extract-from-xml")
def extract_from_xml_endpoint(payload: XMLPayload):
    """
    Extracts candidate details directly from an XML document.
    """
    if not payload.xml or not payload.xml.strip():
        raise HTTPException(status_code=400, detail="XML content cannot be empty.")

    try:
        structured_text = extract_text_from_xml(payload.xml)
        if not structured_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text elements from the provided XML.")
        data = parse_cv_text(structured_text, xml_content=payload.xml)
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction from XML failed: {str(e)}")

@app.post("/extract-pdf")
async def extract_pdf_endpoint(payload: Optional[PDFPayload] = None, file: Optional[UploadFile] = File(None)):
    """
    Complete pipeline: converts CV PDF into XML, then extracts candidate data from the XML.
    """
    pdf_bytes = None
    if file:
        pdf_bytes = await file.read()
    elif payload and payload.pdf_base64:
        try:
            pdf_bytes = base64.b64decode(payload.pdf_base64)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="No PDF data provided.")

    try:
        # Step 1: Convert PDF to XML
        xml_content = pdf_to_xml(pdf_bytes)
        # Step 2: Extract text and candidate data from XML
        structured_text = extract_text_from_xml(xml_content)
        data = parse_cv_text(structured_text, xml_content=xml_content)
        return {
            "xml": xml_content,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CV PDF: {str(e)}")

@app.post("/extract")
def extract_cv(cv: CVText):
    """
    Main extraction endpoint.
    If 'pdf_base64' is provided: converts PDF to XML, then extracts data from the XML.
    If 'xml' is provided: extracts data from the XML.
    If 'text' is provided: extracts data from text (or XML if text contains XML tags).
    """
    # 1. If PDF base64 is provided
    if cv.pdf_base64:
        try:
            pdf_bytes = base64.b64decode(cv.pdf_base64)
            xml_content = pdf_to_xml(pdf_bytes)
            structured_text = extract_text_from_xml(xml_content)
            data = parse_cv_text(structured_text, xml_content=xml_content)
            data["xml"] = xml_content
            return data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

    # 2. If XML is provided directly
    if cv.xml:
        structured_text = extract_text_from_xml(cv.xml)
        return parse_cv_text(structured_text, xml_content=cv.xml)

    # 3. If text is provided
    if cv.text:
        trimmed = cv.text.strip()
        # If the text itself is an XML string (starts with < and contains XML tags)
        if trimmed.startswith("<") and ("<pages>" in trimmed or "<?xml" in trimmed or "<document>" in trimmed):
            structured_text = extract_text_from_xml(trimmed)
            return parse_cv_text(structured_text, xml_content=trimmed)
        return parse_cv_text(cv.text)

    raise HTTPException(status_code=400, detail="Please provide either 'pdf_base64', 'xml', or 'text'.")
