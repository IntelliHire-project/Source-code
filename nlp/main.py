import spacy
import re
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

class CVText(BaseModel):
    text: str

COMMON_SKILLS = [
    "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift",
    "go", "rust", "typescript", "react", "angular", "vue", "node.js",
    "express", "django", "flask", "spring", "sql", "mysql", "postgresql",
    "mongodb", "redis", "aws", "azure", "gcp", "docker", "kubernetes",
    "git", "html", "css", "machine learning", "data science", "nlp"
]

@app.post("/extract")
def extract_cv(cv: CVText):
    text = cv.text
    doc = nlp(text)
    
    # Extract email
    email = None
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    if email_match:
        email = email_match.group(0)
        
    # Extract name (using first PERSON entity found)
    name = None
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break
            
    # Extract skills
    skills = []
    text_lower = text.lower()
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            skills.append(skill.title() if skill.lower() != "node.js" else "Node.js")
            
    # Basic heuristics for education/experience 
    education = []
    experience = []
    
    lines = text.split('\n')
    current_section = None
    
    for line in lines:
        line_clean = line.strip().lower()
        if not line_clean:
            continue
            
        if line_clean in ["education", "academic", "university", "education background"]:
            current_section = "education"
            continue
        elif line_clean in ["experience", "employment", "work history", "work experience"]:
            current_section = "experience"
            continue
        elif line_clean in ["about me", "summary", "profile", "professional summary", "about"]:
            current_section = "bio"
            continue
        elif line_clean in ["languages", "language"]:
            current_section = "language"
            continue
            
        if current_section == "education":
            if len(line) > 5 and len(education) < 3:
                education.append({
                    "title": "Degree/Program",
                    "school": line.strip(),
                    "period": "Unknown"
                })
        elif current_section == "experience":
            if len(line) > 5 and len(experience) < 5:
                experience.append({
                    "title": "Professional Role",
                    "company": "Company",
                    "period": "Unknown",
                    "description": line.strip()
                })
        elif current_section == "bio":
            if len(line) > 10:
                if "bio" not in locals(): bio = ""
                bio += line.strip() + " "
        elif current_section == "language":
            if len(line) > 2 and len(line) < 30:
                if "language" not in locals() or type(language) != list: language = []
                language.append(line.strip())

    # Extract Phone
    phone = None
    phone_match = re.search(r'\+?\d[\d -]{8,15}\d', text)
    if phone_match:
        phone = phone_match.group(0).strip()
        
    # Extract Location
    location = None
    for ent in doc.ents:
        if ent.label_ == "GPE":
            location = ent.text
            break

    # Extract Headline
    headline = None
    # Very basic heuristic: if experience exists, use first title, else guess from name line context
    if experience and len(experience) > 0 and experience[0].get("title") != "Professional Role":
        headline = experience[0].get("title")
    else:
        for line in lines[:10]:
            if "engineer" in line.lower() or "developer" in line.lower() or "manager" in line.lower():
                headline = line.strip()
                break
                
    if 'bio' in locals() and type(bio) == str:
        bio = bio.strip()
    else:
        bio = None
        
    if 'language' in locals() and type(language) == list and len(language) > 0:
        language = ", ".join(language)
    else:
        language = "English"

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "headline": headline,
        "bio": bio,
        "language": language,
        "skills": skills,
        "education": education,
        "experience": experience
    }
