import os
import io
import re
import json
import base64
import html
import xml.etree.ElementTree as ET
from typing import Optional, List, Dict, Any, Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import spacy
from pdfminer.high_level import extract_text_to_fp, extract_text, extract_pages
from pdfminer.layout import LAParams, LTTextBox, LTTextLine, LTChar

app = FastAPI(title="IntelliHire NLP & CV Extraction Service")

# Load Custom Trained Resume NER model or fallback to base model
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "resume_ner_model")
if os.path.exists(MODEL_DIR) and os.path.exists(os.path.join(MODEL_DIR, "config.cfg")):
    try:
        nlp = spacy.load(MODEL_DIR)
        print(f"[IntelliHire NLP] Successfully loaded custom trained Resume NER model from '{MODEL_DIR}'")
    except Exception as e:
        print(f"[IntelliHire NLP] Warning loading custom NER model: {e}. Falling back to en_core_web_sm.")
        nlp = spacy.load("en_core_web_sm")
else:
    print("[IntelliHire NLP] Custom Resume NER model not found. Using en_core_web_sm.")
    nlp = spacy.load("en_core_web_sm")

class CVText(BaseModel):
    text: Optional[str] = None
    json_data: Optional[Any] = None
    xml: Optional[str] = None
    pdf_base64: Optional[str] = None
    filename: Optional[str] = None

class PDFPayload(BaseModel):
    pdf_base64: str
    filename: Optional[str] = None

class JSONPayload(BaseModel):
    json_data: Optional[Any] = Field(default=None, alias="json")
    data: Optional[Any] = None
    filename: Optional[str] = None
    model_config = {"populate_by_name": True}

class XMLPayload(BaseModel):
    xml: str
    filename: Optional[str] = None

COMMON_SKILLS = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "c/c++", "ruby", "php",
    "swift", "kotlin", "dart", "golang", "go", "rust", "scala", "bash", "shell", "powershell",
    "r", "matlab", "perl", "solidity", "elixir", "lua", "haskell", "assembly", "html", "css",
    "html5", "css3",

    # Frontend Technologies & Frameworks
    "react", "react.js", "reactjs", "next.js", "nextjs", "vue", "vue.js", "vuejs", "nuxt.js", "nuxtjs",
    "angular", "angularjs", "svelte", "sveltekit", "redux", "redux toolkit", "mobx", "zustand", "recoil",
    "sass", "scss", "less", "tailwind", "tailwind css", "tailwindcss", "bootstrap", "material ui", "mui",
    "chakra ui", "ant design", "shadcn", "shadcn ui", "webpack", "vite", "rollup", "turbopack", "babel",
    "jquery", "three.js", "d3.js", "webflow",

    # Mobile Development
    "flutter", "react native", "android", "ios", "swiftui", "ionic", "expo",

    # Backend & Web Frameworks
    "node.js", "nodejs", "express", "express.js", "nestjs", "fastify", "koa", "django", "flask",
    "fastapi", "spring", "spring boot", "ruby on rails", "rails", "asp.net", "asp.net core",
    ".net", ".net core", "laravel", "symfony", "codeigniter", "gin", "fiber", "echo",
    "graphql", "rest api", "restful api", "microservices", "serverless", "grpc", "websockets", "socket.io",
    "kafka", "apache kafka", "rabbitmq", "celery",

    # Databases, Caching & ORMs
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite", "mssql", "ms sql",
    "microsoft sql server", "mariadb", "oracle", "cassandra", "dynamodb", "couchdb", "neo4j",
    "firebase", "firestore", "supabase", "elasticsearch", "opensearch", "prisma", "typeorm",
    "sequelize", "mongoose", "hibernate", "sqlalchemy", "drizzle", "snowflake", "databricks", "bigquery",

    # Cloud, DevOps & Infrastructure
    "aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud", "google cloud platform",
    "docker", "kubernetes", "k8s", "helm", "terraform", "ansible", "pulumi", "cloudformation",
    "ci/cd", "jenkins", "github actions", "gitlab ci", "gitlab ci/cd", "circleci", "argocd",
    "git", "github", "gitlab", "bitbucket", "linux", "ubuntu", "debian", "centos", "rhel",
    "nginx", "apache", "caddy", "cloudflare", "vercel", "netlify", "heroku",
    "prometheus", "grafana", "elk stack", "datadog", "new relic", "splunk",

    # Data Science, AI & Machine Learning
    "machine learning", "deep learning", "data science", "nlp", "computer vision",
    "artificial intelligence", "ai", "generative ai", "genai", "llm", "llms", "rag",
    "langchain", "llamaindex", "openai", "openai api", "hugging face", "transformers",
    "pandas", "numpy", "scipy", "scikit-learn", "tensorflow", "pytorch", "keras",
    "opencv", "power bi", "tableau", "cuda", "pyspark", "spark", "apache spark", "hadoop",
    "airflow", "apache airflow",

    # Testing & QA
    "jest", "cypress", "playwright", "selenium", "puppeteer", "vitest", "mocha", "chai",
    "junit", "pytest", "postman", "jmeter",

    # Methodologies, Architecture & Tools
    "jira", "confluence", "trello", "asana", "notion", "figma", "adobe xd",
    "agile", "scrum", "kanban", "tdd", "oop", "system design"
]

CANONICAL_MAP = {
    # Languages
    "python": "Python", "java": "Java", "javascript": "JavaScript", "typescript": "TypeScript",
    "c++": "C++", "c#": "C#", "c/c++": "C/C++", "ruby": "Ruby", "php": "PHP",
    "swift": "Swift", "kotlin": "Kotlin", "dart": "Dart", "golang": "Go", "go": "Go",
    "rust": "Rust", "scala": "Scala", "bash": "Bash", "shell": "Shell", "powershell": "PowerShell",
    "r": "R", "matlab": "MATLAB", "perl": "Perl", "solidity": "Solidity", "elixir": "Elixir",
    "lua": "Lua", "haskell": "Haskell", "assembly": "Assembly",
    "html": "HTML5", "html5": "HTML5", "css": "CSS3", "css3": "CSS3",

    # Frontend
    "react": "React", "react.js": "React", "reactjs": "React",
    "next.js": "Next.js", "nextjs": "Next.js", "next": "Next.js",
    "vue": "Vue.js", "vue.js": "Vue.js", "vuejs": "Vue.js",
    "nuxt.js": "Nuxt.js", "nuxtjs": "Nuxt.js", "nuxt": "Nuxt.js",
    "angular": "Angular", "angularjs": "AngularJS",
    "svelte": "Svelte", "sveltekit": "SvelteKit",
    "redux": "Redux", "redux toolkit": "Redux Toolkit", "mobx": "MobX",
    "zustand": "Zustand", "recoil": "Recoil",
    "sass": "Sass", "scss": "SCSS", "less": "LESS",
    "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS", "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap", "material ui": "Material-UI", "mui": "Material-UI",
    "chakra ui": "Chakra UI", "ant design": "Ant Design", "shadcn": "Shadcn UI", "shadcn ui": "Shadcn UI",
    "webpack": "Webpack", "vite": "Vite", "rollup": "Rollup", "turbopack": "Turbopack", "babel": "Babel",
    "jquery": "jQuery", "three.js": "Three.js", "d3.js": "D3.js", "webflow": "Webflow",

    # Mobile
    "flutter": "Flutter", "react native": "React Native", "android": "Android",
    "ios": "iOS", "swiftui": "SwiftUI", "ionic": "Ionic", "expo": "Expo",

    # Backend & Web Frameworks
    "node.js": "Node.js", "nodejs": "Node.js", "node": "Node.js",
    "express": "Express.js", "express.js": "Express.js", "expressjs": "Express.js",
    "nestjs": "NestJS", "nest.js": "NestJS", "fastify": "Fastify", "koa": "Koa",
    "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
    "spring": "Spring", "spring boot": "Spring Boot", "springboot": "Spring Boot",
    "ruby on rails": "Ruby on Rails", "rails": "Ruby on Rails",
    "asp.net": "ASP.NET", ".net": ".NET", "asp.net core": "ASP.NET Core", ".net core": ".NET Core",
    "laravel": "Laravel", "symfony": "Symfony", "codeigniter": "CodeIgniter",
    "gin": "Gin", "fiber": "Fiber", "echo": "Echo",
    "graphql": "GraphQL", "rest api": "REST API", "restful api": "REST API", "rest apis": "REST API",
    "microservices": "Microservices", "serverless": "Serverless",
    "grpc": "gRPC", "websockets": "WebSockets", "socket.io": "Socket.io",
    "kafka": "Apache Kafka", "apache kafka": "Apache Kafka", "rabbitmq": "RabbitMQ", "celery": "Celery",

    # Databases, Storage & ORMs
    "sql": "SQL", "mysql": "MySQL", "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "sqlite": "SQLite", "mssql": "MS SQL", "ms sql": "MS SQL", "microsoft sql server": "MS SQL Server",
    "mariadb": "MariaDB", "oracle": "Oracle", "mongodb": "MongoDB", "mongo": "MongoDB", "redis": "Redis",
    "cassandra": "Cassandra", "dynamodb": "DynamoDB", "couchdb": "CouchDB", "neo4j": "Neo4j",
    "firebase": "Firebase", "firestore": "Firestore", "supabase": "Supabase",
    "elasticsearch": "Elasticsearch", "opensearch": "OpenSearch",
    "prisma": "Prisma", "typeorm": "TypeORM", "sequelize": "Sequelize",
    "mongoose": "Mongoose", "hibernate": "Hibernate", "sqlalchemy": "SQLAlchemy", "drizzle": "Drizzle",
    "snowflake": "Snowflake", "databricks": "Databricks", "bigquery": "BigQuery",

    # Cloud, DevOps & CI/CD
    "aws": "AWS", "amazon web services": "AWS",
    "azure": "Azure", "microsoft azure": "Azure",
    "gcp": "GCP", "google cloud": "GCP", "google cloud platform": "GCP",
    "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes", "helm": "Helm",
    "terraform": "Terraform", "ansible": "Ansible", "pulumi": "Pulumi",
    "cloudformation": "CloudFormation",
    "ci/cd": "CI/CD", "jenkins": "Jenkins", "github actions": "GitHub Actions",
    "gitlab ci": "GitLab CI", "gitlab ci/cd": "GitLab CI/CD", "circleci": "CircleCI", "argocd": "ArgoCD",
    "git": "Git", "github": "GitHub", "gitlab": "GitLab", "bitbucket": "Bitbucket",
    "linux": "Linux", "ubuntu": "Ubuntu", "debian": "Debian", "centos": "CentOS", "rhel": "RHEL",
    "nginx": "Nginx", "apache": "Apache", "caddy": "Caddy", "cloudflare": "Cloudflare",
    "vercel": "Vercel", "netlify": "Netlify", "heroku": "Heroku",
    "prometheus": "Prometheus", "grafana": "Grafana", "elk stack": "ELK Stack",
    "datadog": "Datadog", "new relic": "New Relic", "splunk": "Splunk",

    # AI, Data Science & ML
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "data science": "Data Science", "nlp": "NLP", "natural language processing": "NLP",
    "computer vision": "Computer Vision", "artificial intelligence": "AI", "ai": "AI",
    "generative ai": "Generative AI", "genai": "Generative AI",
    "llm": "LLMs", "llms": "LLMs", "large language models": "LLMs",
    "rag": "RAG", "langchain": "LangChain", "llamaindex": "LlamaIndex",
    "openai": "OpenAI API", "openai api": "OpenAI API",
    "pandas": "Pandas", "numpy": "NumPy", "scipy": "SciPy", "scikit-learn": "Scikit-Learn",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch", "keras": "Keras",
    "opencv": "OpenCV", "power bi": "Power BI", "tableau": "Tableau",
    "hugging face": "Hugging Face", "transformers": "Transformers", "cuda": "CUDA",
    "pyspark": "PySpark", "spark": "Apache Spark", "apache spark": "Apache Spark",
    "hadoop": "Hadoop", "airflow": "Apache Airflow", "apache airflow": "Apache Airflow",

    # Testing & Methodologies
    "jest": "Jest", "cypress": "Cypress", "playwright": "Playwright", "selenium": "Selenium",
    "puppeteer": "Puppeteer", "vitest": "Vitest", "mocha": "Mocha", "chai": "Chai",
    "junit": "JUnit", "pytest": "PyTest", "postman": "Postman", "jmeter": "JMeter",
    "jira": "Jira", "confluence": "Confluence", "trello": "Trello", "asana": "Asana", "notion": "Notion",
    "figma": "Figma", "adobe xd": "Adobe XD",
    "agile": "Agile", "scrum": "Scrum", "kanban": "Kanban", "tdd": "TDD",
    "oop": "OOP", "object-oriented programming": "OOP", "system design": "System Design"
}

SKILL_BLACKLIST = {
    "verify", "coursera", "udemy", "linkedin", "specialization", "intermediate", "advanced",
    "intro", "introduction", "foundation", "foundations", "degree", "diploma", "qualification",
    "qualifications", "gce", "al", "ol", "gpa", "school", "university", "faculty", "achievements",
    "certificates", "certifications", "licenses", "learning", "volunteering", "co-curriculars",
    "references", "referees", "application", "application.", "applications", "project", "projects",
    "responsible", "developed", "managed", "skills", "technical skills", "core skills", "proficiencies",
    "technologies", "tools", "platforms", "languages", "programming", "databases", "cloud", "devops",
    "frameworks", "libraries", "operating systems", "other", "ci", "cd", "etc", "none", "n/a", "na",
    "experience", "years", "months", "working", "knowledge", "proficient", "familiar", "strong", "good",
    "level", "intermediate level", "advanced level", "beginner", "basic"
}

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

def clean_xml_control_chars(text: str) -> str:
    """Removes invalid XML 1.0 characters that cause parse errors."""
    if not text:
        return ""
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)

def extract_pdf_annotations(pdf_bytes: bytes) -> List[str]:
    """Extracts all hyperlinked URIs from PDF annotation objects and raw streams."""
    if not pdf_bytes:
        return []
    uris = []
    # 1. /URI (http...)
    matches = re.findall(rb'/URI\s*\(([^)]+)\)', pdf_bytes)
    for m in matches:
        try:
            u = m.decode('utf-8', errors='ignore').strip()
            if u:
                uris.append(u)
        except Exception:
            pass
    # 2. Raw uncompressed string search for linkedin and github URLs in PDF bytes
    try:
        raw_str = pdf_bytes.decode('latin1', errors='ignore')
        li_raw = re.findall(r'(https?://(?:www\.)?linkedin\.com/(?:in/|profile/|pub/)?[a-zA-Z0-9_.-]+)', raw_str, re.IGNORECASE)
        uris.extend(li_raw)
        gh_raw = re.findall(r'(https?://(?:www\.)?github\.com/[a-zA-Z0-9_.-]+)', raw_str, re.IGNORECASE)
        uris.extend(gh_raw)
    except Exception:
        pass
    return list(set(uris))

def pdf_to_json(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Converts a PDF binary into a structured JSON representation preserving
    pages, text blocks, lines, character layout, bounding boxes, font sizes,
    and hyperlinked annotations.
    Employs multi-tier fallbacks so conversion never fails.
    """
    if not pdf_bytes or len(pdf_bytes) < 10:
        return {"pages": [], "annotations": [], "metadata": {"total_pages": 0}}

    annots = extract_pdf_annotations(pdf_bytes)

    def extract_from_layout(laparams_obj):
        pages_list = []
        for page_idx, page_layout in enumerate(extract_pages(io.BytesIO(pdf_bytes), laparams=laparams_obj)):
            blocks = []
            for element in page_layout:
                if isinstance(element, LTTextBox):
                    lines = []
                    for text_line in element:
                        if isinstance(text_line, LTTextLine):
                            line_text = text_line.get_text().strip()
                            sizes = [c.size for c in text_line if isinstance(c, LTChar)]
                            max_size = max(sizes) if sizes else 0.0
                            if line_text:
                                lines.append({
                                    "text": line_text,
                                    "bbox": [round(float(x), 2) for x in text_line.bbox],
                                    "x0": round(float(text_line.bbox[0]), 2),
                                    "y0": round(float(text_line.bbox[1]), 2),
                                    "x1": round(float(text_line.bbox[2]), 2),
                                    "y1": round(float(text_line.bbox[3]), 2),
                                    "max_font_size": round(float(max_size), 2)
                                })
                    box_text = element.get_text().strip()
                    if box_text:
                        blocks.append({
                            "bbox": [round(float(x), 2) for x in element.bbox],
                            "x0": round(float(element.bbox[0]), 2),
                            "y0": round(float(element.bbox[1]), 2),
                            "x1": round(float(element.bbox[2]), 2),
                            "y1": round(float(element.bbox[3]), 2),
                            "lines": lines,
                            "text": box_text
                        })
            pages_list.append({
                "page_number": getattr(page_layout, "pageid", page_idx + 1),
                "bbox": [round(float(x), 2) for x in page_layout.bbox],
                "width": round(float(page_layout.width), 2),
                "height": round(float(page_layout.height), 2),
                "text_blocks": blocks
            })
        return pages_list

    # Tier 1: Custom layout analysis parameters
    try:
        laparams = LAParams(
            line_overlap=0.5,
            char_margin=2.0,
            line_margin=0.5,
            word_margin=0.1,
            boxes_flow=0.5,
            detect_vertical=False
        )
        pages = extract_from_layout(laparams)
        if pages and any(p.get("text_blocks") for p in pages):
            return {
                "pages": pages,
                "annotations": annots,
                "metadata": {"total_pages": len(pages)}
            }
    except Exception:
        pass

    # Tier 2: Default LAParams
    try:
        pages = extract_from_layout(LAParams())
        if pages and any(p.get("text_blocks") for p in pages):
            return {
                "pages": pages,
                "annotations": annots,
                "metadata": {"total_pages": len(pages)}
            }
    except Exception:
        pass

    # Tier 3: No LAParams
    try:
        pages = extract_from_layout(None)
        if pages and any(p.get("text_blocks") for p in pages):
            return {
                "pages": pages,
                "annotations": annots,
                "metadata": {"total_pages": len(pages)}
            }
    except Exception:
        pass

    # Tier 4: Fallback from raw text extraction to build well-formed JSON
    try:
        raw_text = extract_text(io.BytesIO(pdf_bytes))
    except Exception:
        raw_text = ""

    clean_text = raw_text.strip() if raw_text else ""
    raw_lines = [l.strip() for l in clean_text.splitlines() if l.strip()]
    fallback_lines = [{
        "text": l,
        "bbox": [0.0, 0.0, 612.0, 792.0],
        "x0": 0.0, "y0": 0.0, "x1": 612.0, "y1": 792.0,
        "max_font_size": 12.0
    } for l in raw_lines]

    fallback_blocks = [{
        "bbox": [0.0, 0.0, 612.0, 792.0],
        "x0": 0.0, "y0": 0.0, "x1": 612.0, "y1": 792.0,
        "lines": fallback_lines,
        "text": clean_text
    }] if clean_text else []

    return {
        "pages": [{
            "page_number": 1,
            "bbox": [0.0, 0.0, 612.0, 792.0],
            "width": 612.0,
            "height": 792.0,
            "text_blocks": fallback_blocks
        }],
        "annotations": annots,
        "metadata": {"total_pages": 1}
    }

def extract_text_from_json(json_data: Any) -> str:
    """
    Extracts text from PDF-JSON structure with layout and column awareness.
    Groups text blocks into columns to prevent column interleaving.
    """
    if not json_data:
        return ""

    if isinstance(json_data, str):
        try:
            json_data = json.loads(json_data)
        except Exception:
            return json_data.strip()

    if not isinstance(json_data, dict):
        return ""

    pages = json_data.get("pages", [])
    if not pages:
        return ""

    page_chunks = []
    for page in pages:
        parsed_boxes = page.get("text_blocks", [])
        if not parsed_boxes:
            continue

        page_width = float(page.get("width", 612.0))
        mid_x = page_width / 2.0

        left_boxes = [b for b in parsed_boxes if b.get("x1", b.get("bbox", [0, 0, 0, 0])[2]) <= mid_x + 35]
        right_boxes = [b for b in parsed_boxes if b.get("x0", b.get("bbox", [0, 0, 0, 0])[0]) >= mid_x - 35]

        # Multi-column layout detection
        if len(left_boxes) >= 2 and len(right_boxes) >= 2 and (len(left_boxes) + len(right_boxes) >= len(parsed_boxes) * 0.7):
            left_boxes.sort(key=lambda b: b.get("y1", b.get("bbox", [0, 0, 0, 0])[3]), reverse=True)
            right_boxes.sort(key=lambda b: b.get("y1", b.get("bbox", [0, 0, 0, 0])[3]), reverse=True)
            spanning_boxes = [b for b in parsed_boxes if b not in left_boxes and b not in right_boxes]
            spanning_boxes.sort(key=lambda b: b.get("y1", b.get("bbox", [0, 0, 0, 0])[3]), reverse=True)

            header_boxes = [b for b in spanning_boxes if b.get("y0", b.get("bbox", [0, 0, 0, 0])[1]) > 620]
            footer_boxes = [b for b in spanning_boxes if b.get("y0", b.get("bbox", [0, 0, 0, 0])[1]) <= 620]

            ordered_texts = (
                [b.get("text", "") for b in header_boxes] +
                [b.get("text", "") for b in left_boxes] +
                [b.get("text", "") for b in right_boxes] +
                [b.get("text", "") for b in footer_boxes]
            )
            page_chunks.append("\n\n".join([t for t in ordered_texts if t.strip()]))
        else:
            sorted_boxes = sorted(parsed_boxes, key=lambda b: b.get("y1", b.get("bbox", [0, 0, 0, 0])[3]), reverse=True)
            page_chunks.append("\n\n".join([b.get("text", "") for b in sorted_boxes if b.get("text", "").strip()]))

    return "\n\n".join(page_chunks).strip()

def pdf_to_xml(pdf_bytes: bytes) -> str:
    """
    Converts a PDF binary into a structured XML representation preserving
    pages, textboxes, textlines, character layout, and hyperlinked annotations.
    Employs multi-tier fallbacks so conversion never fails.
    """
    if not pdf_bytes or len(pdf_bytes) < 10:
        return '<?xml version="1.0" encoding="utf-8"?><pages></pages>'

    annots = extract_pdf_annotations(pdf_bytes)
    annot_xml = ""
    if annots:
        annot_tags = "".join([f'<uri href="{html.escape(u)}"/>' for u in annots])
        annot_xml = f'<annots>{annot_tags}</annots>'

    # Tier 1: Layout analysis parameters
    try:
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
        if xml_str and "<pages>" in xml_str:
            if annot_xml and "</pages>" in xml_str:
                xml_str = xml_str.replace('</pages>', f'{annot_xml}</pages>')
            return clean_xml_control_chars(xml_str)
    except Exception:
        pass

    # Tier 2: Default LAParams
    try:
        output_fp = io.BytesIO()
        extract_text_to_fp(io.BytesIO(pdf_bytes), output_fp, output_type='xml', laparams=LAParams())
        xml_str = output_fp.getvalue().decode('utf-8', errors='ignore')
        if xml_str and "<pages>" in xml_str:
            if annot_xml and "</pages>" in xml_str:
                xml_str = xml_str.replace('</pages>', f'{annot_xml}</pages>')
            return clean_xml_control_chars(xml_str)
    except Exception:
        pass

    # Tier 3: No LAParams
    try:
        output_fp = io.BytesIO()
        extract_text_to_fp(io.BytesIO(pdf_bytes), output_fp, output_type='xml', laparams=None)
        xml_str = output_fp.getvalue().decode('utf-8', errors='ignore')
        if xml_str and "<pages>" in xml_str:
            if annot_xml and "</pages>" in xml_str:
                xml_str = xml_str.replace('</pages>', f'{annot_xml}</pages>')
            return clean_xml_control_chars(xml_str)
    except Exception:
        pass

    # Tier 4: Fallback from raw text extraction to build well-formed XML
    try:
        raw_text = extract_text(io.BytesIO(pdf_bytes))
    except Exception:
        raw_text = ""

    escaped = html.escape(raw_text or "")
    xml_str = f'<?xml version="1.0" encoding="utf-8"?><pages><page id="1" bbox="0,0,612,792"><textbox id="0"><textline><text>{escaped}</text></textline></textbox></page>{annot_xml}</pages>'
    return clean_xml_control_chars(xml_str)

def extract_text_from_xml(xml_content: str) -> str:
    """
    Extracts text from PDF-XML structure with layout and column awareness.
    Groups textboxes into columns to prevent column interleaving.
    """
    if not xml_content or not xml_content.strip():
        return ""

    cleaned_xml = clean_xml_control_chars(xml_content.strip())

    try:
        root = ET.fromstring(cleaned_xml)
    except Exception:
        try:
            root = ET.fromstring(cleaned_xml.encode('utf-8'))
        except Exception:
            raw_stripped = re.sub(r'<[^>]+>', ' ', cleaned_xml)
            return html.unescape(raw_stripped).strip()

    pages = root.findall('.//page')
    if pages:
        page_chunks = []
        for page in pages:
            textboxes = page.findall('.//textbox')
            if textboxes:
                parsed_boxes = []
                for tb in textboxes:
                    bbox_str = tb.attrib.get('bbox', '')
                    x0, y0, x1, y1 = 0.0, 0.0, 0.0, 0.0
                    if bbox_str:
                        parts = bbox_str.split(',')
                        if len(parts) == 4:
                            try:
                                x0, y0, x1, y1 = float(parts[0]), float(parts[1]), float(parts[2]), float(parts[3])
                            except ValueError:
                                pass

                    lines = []
                    for line in tb.findall('.//textline'):
                        chars = [t.text or '' for t in line.findall('text')]
                        clean_line = ''.join(chars).strip()
                        if clean_line:
                            lines.append(clean_line)

                    if lines:
                        parsed_boxes.append({
                            'x0': x0, 'y0': y0, 'x1': x1, 'y1': y1,
                            'text': "\n".join(lines)
                        })

                if parsed_boxes:
                    page_bbox = page.attrib.get('bbox', '0,0,612,792').split(',')
                    page_width = float(page_bbox[2]) if len(page_bbox) >= 3 else 612.0
                    mid_x = page_width / 2.0

                    left_boxes = [b for b in parsed_boxes if b['x1'] <= mid_x + 35]
                    right_boxes = [b for b in parsed_boxes if b['x0'] >= mid_x - 35]

                    # Multi-column layout detection
                    if len(left_boxes) >= 2 and len(right_boxes) >= 2 and (len(left_boxes) + len(right_boxes) >= len(parsed_boxes) * 0.7):
                        left_boxes.sort(key=lambda b: b['y1'], reverse=True)
                        right_boxes.sort(key=lambda b: b['y1'], reverse=True)
                        spanning_boxes = [b for b in parsed_boxes if b not in left_boxes and b not in right_boxes]
                        spanning_boxes.sort(key=lambda b: b['y1'], reverse=True)

                        header_boxes = [b for b in spanning_boxes if b['y0'] > 620]
                        footer_boxes = [b for b in spanning_boxes if b['y0'] <= 620]

                        ordered_texts = (
                            [b['text'] for b in header_boxes] +
                            [b['text'] for b in left_boxes] +
                            [b['text'] for b in right_boxes] +
                            [b['text'] for b in footer_boxes]
                        )
                        page_chunks.append("\n\n".join(ordered_texts))
                    else:
                        parsed_boxes.sort(key=lambda b: b['y1'], reverse=True)
                        page_chunks.append("\n\n".join([b['text'] for b in parsed_boxes]))
            else:
                lines = []
                for line in page.findall('.//textline'):
                    chars = [t.text or '' for t in line.findall('text')]
                    clean_line = ''.join(chars).strip()
                    if clean_line:
                        lines.append(clean_line)
                if lines:
                    page_chunks.append("\n".join(lines))
        return "\n\n".join(page_chunks)

    all_text = "".join(root.itertext())
    return all_text.strip()

def is_valid_name(candidate: str) -> bool:
    """Checks if a string looks like a legitimate human name."""
    if not candidate or len(candidate.strip()) < 3:
        return False
    cleaned = candidate.strip()
    cleaned = re.sub(r'^(mr\.|mrs\.|ms\.|dr\.|prof\.|miss)\s*', '', cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r'["\'\(\)\[\]]', '', cleaned).strip()
    cleaned = re.sub(r',?\s*(?:ph\.?d\.?|m\.?d\.?|msc|bsc|mba|pmp|cpa)$', '', cleaned, flags=re.IGNORECASE).strip()
    words = cleaned.split()
    if not (1 < len(words) <= 4):
        return False
    if re.search(r'[\d@/:;|#\$%&*+=<>{}\\]', cleaned):
        return False
    for w in words:
        clean_word = w.lower().strip(".,")
        if clean_word in NAME_BLACKLIST:
            return False
        if not re.match(r'^[a-zA-Z\.\-]+$', clean_word):
            return False
        if len(clean_word) == 1 and not w.endswith('.'):
            return False
    return True

def extract_name_from_xml(xml_content: str) -> Optional[str]:
    """Finds the candidate's name on Page 1 by locating the largest heading font."""
    if not xml_content:
        return None
    try:
        cleaned_xml = clean_xml_control_chars(xml_content.strip())
        root = ET.fromstring(cleaned_xml)
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

    candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
    best_candidate = candidates[0][2].strip()
    best_candidate = re.sub(r',?\s*(?:ph\.?d\.?|m\.?d\.?|msc|bsc|mba|pmp)$', '', best_candidate, flags=re.IGNORECASE).strip()
    return best_candidate.title()

def extract_name_from_json(json_data: Any) -> Optional[str]:
    """Finds the candidate's name on Page 1 by locating the largest heading font in the JSON layout."""
    if not json_data:
        return None
    if isinstance(json_data, str):
        try:
            json_data = json.loads(json_data)
        except Exception:
            return None

    if not isinstance(json_data, dict):
        return None

    pages = json_data.get("pages", [])
    if not pages:
        return None

    first_page = pages[0]
    candidates = []
    for tb in first_page.get("text_blocks", []):
        for tl in tb.get("lines", []):
            line_str = tl.get("text", "").strip()
            line_str = re.sub(r'\s+', ' ', line_str)
            if not is_valid_name(line_str):
                continue

            max_size = float(tl.get("max_font_size", 0.0))
            y_pos = float(tl.get("y0", tl.get("bbox", [0, 0, 0, 0])[1]))

            candidates.append((max_size, y_pos, line_str))

    if not candidates:
        return None

    candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
    best_candidate = candidates[0][2].strip()
    best_candidate = re.sub(r',?\s*(?:ph\.?d\.?|m\.?d\.?|msc|bsc|mba|pmp)$', '', best_candidate, flags=re.IGNORECASE).strip()
    return best_candidate.title()

def identify_section(line: str) -> Optional[str]:
    """Identifies if a line represents a resume section header."""
    if not line:
        return None
    cleaned = line.strip().lower()
    # Strip markdown headers, numbering, bullets, roman numerals, brackets
    cleaned = re.sub(r'^[#*_\-•–—~|\[\]\(\)\s]+', '', cleaned)
    cleaned = re.sub(r'^(?:section\s*\d+|part\s*\d+|[ivx]+\b|\d+)[\.\):\s-]*', '', cleaned, flags=re.IGNORECASE)

    # An itemized project entry (e.g. "Project 1:", "Project - XYZ", "Project Name:") is not a section header
    if re.match(r'^project\s*(?:[:#\-\d]|name\b|title\b|description\b|details\b|role\b)', cleaned, re.IGNORECASE):
        return None

    # Check prefix before colon if line begins with a section label (e.g. "Skills: Python, Docker")
    prefix = cleaned.split(':')[0].strip() if ':' in cleaned else cleaned
    prefix = re.sub(r'[:|\-–—~#*_\s]+$', '', prefix).strip()
    target = prefix if len(prefix) <= 45 else cleaned
    target = re.sub(r'[:|\-–—~#*_\s]+$', '', target).strip()

    if not target or (len(target) > 60 and len(prefix) > 45):
        return None

    # Education
    if re.search(r'^(education|educational\s*qualifications?|educational\s*background|academic\s*qualifications?|academic\s*background|academics|qualifications?|degrees?|schooling)\b', target):
        return "education"
    # Experience (Expanded with international and regional industry headings)
    if re.search(
        r'^(?:'
        r'work\s*experience|professional\s*experience|employment\s*history|'
        r'employment\s*record|employment\s*background|work\s*history|'
        r'working\s*experience|experience|career\s*history|career\s*experience|'
        r'career\s*background|professional\s*background|internships?|'
        r'internship\s*experience|practical\s*experience|industry\s*experience|'
        r'relevant\s*(?:work\s*|professional\s*)?experience|employment|'
        r'previous\s*employment|past\s*experience|technical\s*experience|'
        r'engineering\s*experience|job\s*history|work\s*summary|'
        r'career\s*summary|positions?\s*held|professional\s*appointments?|'
        r'work\s*record|freelance\s*experience|consulting\s*experience'
        r')\b',
        target
    ):
        return "experience"
    # Skills
    if re.search(r'^(technical\s*skills|core\s*skills|key\s*skills|skills|technologies|competencies|core\s*competencies|tools\s*&\s*technologies|expertise|technical\s*proficiencies|areas\s*of\s*expertise|programming\s*skills|tech\s*stack|skill\s*set)\b', target):
        return "skills"
    # Summary / Bio
    if re.search(r'^(professional\s*summary|profile|about\s*me|summary|career\s*objective|executive\s*summary|objective|about|bio|overview|personal\s*statement)\b', target):
        return "bio"
    # Languages
    if re.search(r'^(languages?|language\s*proficiency|spoken\s*languages?|language\s*skills?)\b', target):
        return "language"
    # Certifications / Courses / Licenses
    if re.search(
        r'^(?:'
        r'(?:professional|industry|technical|online|key|relevant|verified|it)?\s*(?:certifications?|certificates?|licenses?(?:\s*&\s*certifications?)?|credentials|courses|trainings?|accreditations?)|'
        r'licenses?\s*(?:and|&)\s*certifications?|certifications?\s*(?:and|&)\s*(?:courses|licenses?|trainings?)|'
        r'courses\s*(?:and|&)\s*certifications?'
        r')\b',
        target
    ):
        return "certifications"
    # Projects (Academic, Personal, Coursework, Capstone, Independent, Portfolio, etc.)
    if re.search(
        r'^(?:'
        r'projects?|personal\s*projects?|academic\s*projects?|key\s*projects?|'
        r'major\s*projects?|mini\s*projects?|capstone(?:\s*projects?)?|coursework(?:\s*projects?)?|'
        r'selected\s*projects?|notable\s*projects?|independent\s*projects?|'
        r'technical\s*projects?|software\s*projects?|engineering\s*projects?|'
        r'portfolio|client\s*projects?|experience\s*(?:and|&)\s*projects|projects\s*(?:and|&)\s*experience'
        r')\b',
        target
    ):
        return "projects"
    # Publications / Research
    if re.search(r'^(publications?|research|papers?)\b', target):
        return "publications"
    # Achievements / Awards
    if re.search(r'^(achievements?|awards?|honors?|key\s*achievements?)\b', target):
        return "awards"
    # Volunteering / Activities
    if re.search(r'^(volunteering|volunteer\s*experience|leadership|extracurricular(?:\s*activities)?|co-curriculars?)\b', target):
        return "volunteering"
    # References
    if re.search(r'^(references?|referees?)\b', target):
        return "references"

    return None

# ==============================================================================
# Enhanced Experience Extraction Engine
# ==============================================================================

ROLE_KEYWORDS_PATTERN = re.compile(
    r'\b('
    # Engineering & Development
    r'software\s+engineer(?:ing)?|software\s+developer|web\s+developer|mobile\s+developer|'
    r'full\s*stack\s*(?:developer|engineer)?|frontend\s*(?:developer|engineer)?|front-end\s*(?:developer|engineer)?|'
    r'backend\s*(?:developer|engineer)?|back-end\s*(?:developer|engineer)?|'
    r'devops\s*(?:engineer|specialist)?|devsecops|sre|site\s+reliability\s+engineer|'
    r'cloud\s*(?:engineer|architect|specialist|consultant)?|platform\s*engineer|infrastructure\s*engineer|'
    r'systems?\s*(?:engineer|administrator|analyst|architect)?|network\s*(?:engineer|administrator|specialist)?|'
    r'database\s*(?:administrator|engineer|developer|architect)?|dba|'
    r'embedded\s*(?:systems?\s*)?(?:engineer|developer)?|firmware\s*engineer|hardware\s*engineer|'
    r'qa\s*(?:engineer|lead|analyst|tester|specialist)?|quality\s+assurance\s*(?:engineer|analyst|tester|specialist)?|'
    r'test\s*(?:engineer|analyst|lead|automation\s*engineer)?|automation\s*engineer|sdet|'
    r'security\s*(?:engineer|analyst|consultant|specialist|officer)?|cyber\s*security\s*(?:specialist|engineer|analyst)?|'
    r'infosec\s*(?:engineer|analyst)?|penetration\s*tester|ethical\s*hacker|'
    r'blockchain\s*(?:developer|engineer)?|smart\s*contract\s*developer|solutions?\s*architect|'
    r'enterprise\s*architect|software\s*architect|technical\s*architect|'
    r'engineer|developer|architect|programmer|technician|coder|webmaster|'
    # Data & AI / ML
    r'data\s*scientist|data\s*engineer|data\s*analyst|data\s*architect|'
    r'machine\s*learning\s*(?:engineer|scientist|specialist)?|ml\s*(?:engineer|scientist)?|'
    r'deep\s*learning\s*(?:engineer|specialist)?|ai\s*(?:engineer|scientist|researcher|specialist)?|'
    r'artificial\s+intelligence\s*(?:engineer|specialist)?|nlp\s*(?:engineer|specialist)?|'
    r'computer\s+vision\s*engineer|prompt\s*engineer|bi\s*(?:developer|analyst|consultant)?|'
    r'business\s*intelligence\s*(?:developer|analyst)?|quantitative\s*analyst|statistician|'
    # Design & Creative
    r'ui\s*/?\s*ux\s*(?:designer|engineer|developer|lead)?|ux\s*(?:designer|researcher|lead)?|'
    r'ui\s*(?:designer|lead)?|user\s*experience\s*designer|user\s*interface\s*designer|'
    r'product\s*designer|interaction\s*designer|visual\s*designer|graphic\s*designer|'
    r'creative\s*director|art\s*director|design\s*system\s*lead|motion\s*designer|'
    r'designer|illustrator|animator|3d\s*artist|'
    # Management, Leadership & Agile
    r'technical\s*lead|tech\s*lead|team\s*lead|engineering\s*manager|'
    r'director\s*of\s*engineering|vp\s*of\s*engineering|head\s*of\s*engineering|'
    r'head\s*of\s*technology|head\s*of\s*product|product\s*manager|'
    r'technical\s*product\s*manager|product\s*owner|project\s*manager|'
    r'project\s*coordinator|program\s*manager|scrum\s*master|agile\s*coach|'
    r'delivery\s*manager|operations\s*manager|general\s*manager|managing\s*director|'
    r'chief\s*technology\s*officer|cto|chief\s*executive\s*officer|ceo|'
    r'chief\s*operating\s*officer|coo|chief\s*information\s*officer|cio|'
    r'chief\s*financial\s*officer|cfo|chief\s*product\s*officer|cpo|'
    r'chief\s*information\s*security\s*officer|ciso|'
    r'founder|co-founder|partner|president|vice\s+president|vp|director|manager|supervisor|'
    # Analysis & Strategy
    r'business\s*analyst|systems?\s*analyst|operations\s*analyst|financial\s*analyst|'
    r'research\s*analyst|strategist|auditor|consultant|specialist|advisor|administrator|'
    # IT Support, Operations & Services
    r'it\s*support\s*(?:engineer|specialist|officer)?|technical\s*support\s*(?:engineer|specialist)?|'
    r'helpdesk\s*(?:specialist|technician|engineer)?|system\s*administrator|sysadmin|'
    r'service\s*desk\s*analyst|it\s*officer|network\s*administrator|'
    # Academic & Research
    r'research\s*assistant|research\s*fellow|researcher|scientist|'
    r'postdoctoral\s*(?:researcher|fellow)?|fellow|lecturer|assistant\s*lecturer|'
    r'senior\s*lecturer|instructor|teaching\s*assistant|tutor|professor|'
    # Trainees & Interns
    r'intern|internship|trainee|apprentice|fellowship|undergraduate\s*trainee|graduate\s*trainee|'
    r'associate|member\s*of\s*technical\s*staff|'
    # Tech Relations, Marketing & Writing
    r'developer\s*advocate|developer\s*relations|devrel|solutions?\s*engineer|'
    r'sales\s*engineer|technical\s*writer|writer|account\s*manager|'
    r'customer\s*success\s*manager|growth\s*specialist|marketing\s*specialist|seo\s*specialist|'
    r'executive|coordinator|officer'
    r')\b',
    re.IGNORECASE
)

ROLE_QUALIFIERS_PATTERN = re.compile(
    r'\b('
    r'senior|sr\.?|junior|jr\.?|lead|team\s+lead|tech\s+lead|principal|staff|distinguished|'
    r'chief|associate|assistant|deputy|graduate|trainee|intern|internship|entry\s+level|'
    r'mid\s+level|intermediate|experienced|head\s+of|director\s+of|vp\s+of|vice\s+president\s+of|'
    r'acting|interim|co-?founder\s*(?:&|and)?|founder\s*(?:&|and)?|freelance|consultant|contract|'
    r'part-?time|full-?time'
    r')\b',
    re.IGNORECASE
)

COMPANY_KEYWORDS_PATTERN = re.compile(
    r'\b('
    r'inc\.?|incorporated|llc|ltd\.?|limited|\(pvt\)\s*ltd\.?|pvt\.?\s*ltd\.?|private\s+limited|'
    r'pvt|plc|gmbh|corp\.?|corporation|co\.?|company|'
    r'technologies|technology|tech|solutions|systems|system|labs?|laboratories|software|'
    r'innovations?|studios?|agency|digital|ventures?|consultancy|consulting|analytics|'
    r'networks?|media|partners?|capital|holdings?|services?|group|enterprises?|'
    r'international|global|interactive|security|cloud|data|platform|industries|'
    r'fintech|healthtech|edtech|logistics|telecom|communications?|infotech|works|'
    r'bank|banking|financial|insurance'
    r')\b',
    re.IGNORECASE
)

KNOWN_COMPANIES = {
    # Tech Giants & Cloud
    "google", "microsoft", "apple", "amazon", "aws", "amazon web services", "meta", "facebook",
    "netflix", "uber", "airbnb", "twitter", "x corp", "linkedin", "stripe", "spotify", "salesforce",
    "oracle", "ibm", "cisco", "intel", "amd", "nvidia", "samsung", "qualcomm", "vmware", "sap",
    "sony", "paypal", "intuit", "atlassian", "cloudflare", "datadog", "mongodb", "hashicorp",
    "snowflake", "twilio", "palantir", "square", "block", "shopify", "snap", "snapchat", "dropbox",
    "box", "zoom", "slack", "pinterest", "github", "gitlab", "docker", "red hat", "redhat",
    "canonical", "openai", "anthropic", "bytedance", "tiktok", "tesla", "spacex", "epic games",
    "unity", "unity technologies", "crowdstrike", "palo alto networks", "target", "walmart",
    "siemens", "philips", "bosch", "ebay",
    # Global IT & Consulting
    "accenture", "cognizant", "infosys", "tcs", "tata consultancy services", "wipro", "capgemini",
    "dxc", "dxc technology", "deloitte", "pwc", "pricewaterhousecoopers", "ey", "ernst & young",
    "kpmg", "mckinsey", "boston consulting", "bcg", "bain", "bain & company", "epam", "thoughtworks",
    "nagarro", "hcl", "hcl technologies", "tech mahindra", "mindtree", "lti", "cgi", "ntt data",
    # Sri Lankan & Regional Tech Powerhouses
    "virtusa", "wso2", "sysco labs", "sysco", "ifs", "axiata", "dialog", "dialog axiata",
    "millenniumit", "millennium it esp", "creative software", "codegen", "99x", "pearson",
    "zone24x7", "mitra", "mitra innovation", "octave", "lseg", "london stock exchange group",
    "calcey", "calcey technologies", "rootcode", "rootcode labs", "surge global", "enadoc",
    "geveo", "geveo australasia", "fortude", "tiqri", "ascentic", "simcentric", "directfn",
    "gapstars", "bhasha", "pickme", "daraz", "roar global", "omobio", "arimac", "cambio software",
    "wiley", "ironone technologies", "boardpac", "aeturnum", "ideahub", "hsenid", "hsenid mobile",
    "hsenid software", "brandix", "mas holdings", "mas", "john keells", "john keells holdings", "jkh",
    "commercial bank", "hatton national bank", "hnb", "sampath bank", "nations trust bank", "ntb",
    "lolc", "softlogic", "hemas", "hayleys"
}

EXP_DATE_PATTERN = re.compile(
    r'('
    # Optional prefix like "from", "dates:", "duration:", "period:", "since"
    r'(?:(?:from|dates?|duration|period|since)\s*[:|\-–—]?\s*)?'
    # Start date: Month/Year or Month Year or MM/YYYY or YYYY-MM or YYYY
    r'(?:'
    r'(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?,?\s*)?'
    r'(?:20\d{2}|19\d{2}|\d{1,2}[\./\-]\d{2,4})'
    r'(?:[\./\-]\d{1,2})?'
    r')'
    # Separator
    r'(?:\s*(?:[-–—~]|to|till|until|/)\s*'
    # End date: Month/Year or Year or Present / Current / Ongoing / Till date
    r'(?:'
    r'(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?,?\s*)?'
    r'(?:20\d{2}|19\d{2}|\d{1,2}[\./\-]\d{2,4}|present|current|now|till\s*date|to\s*date|ongoing|current\s*date)'
    r'(?:[\./\-]\d{1,2})?'
    r')'
    r')?'
    # Optional duration trailer like (1 yr 6 mos) or (2 years)
    r'(?:\s*\(\s*\d+\s*(?:yrs?|years?|mos?|months?)[^)]*\))?'
    r')',
    re.IGNORECASE
)

ACTION_VERB_PATTERN = re.compile(
    r'^(?:'
    r'developed|engineered|implemented|built|designed|led|architected|created|'
    r'maintained|collaborated|managed|automated|optimized|resolved|contributed|'
    r'responsible\s+for|assisted|conducted|facilitated|spearheaded|delivered|'
    r'configured|deployed|integrated|researched|analyzed|tested|documented|'
    r'reported|mentored|supervised|trained|performed|monitored|established|'
    r'improved|executed|prepared|provided|participated|supported|coordinated|'
    r'handled|worked|guided|oversaw|ensured|drove|partnered|authored|formulated|'
    r'reviewed|streamlined|achieved|utilized|used|accelerated|administered|'
    r'advised|allocated|championed|coached|compiled|constructed|consulted|'
    r'debugged|devised|diagnosed|directed|drafted|enabled|enhanced|evaluated|'
    r'expanded|expedited|fostered|founded|generated|headed|identified|increased|'
    r'initiated|inspected|installed|instituted|interviewed|introduced|investigated|'
    r'launched|maximized|migrated|minimized|modeled|motivated|negotiated|operated|'
    r'orchestrated|organized|overhauled|pioneered|planned|presented|prioritized|'
    r'processed|produced|programmed|promoted|proposed|published|re-architected|'
    r'rebuilt|recruited|redesigned|reduced|refactored|reformed|reorganized|repaired|'
    r'replaced|restructured|revamped|revised|revitalized|scaled|scheduled|secured|'
    r'simplified|standardized|strengthened|structured|synthesized|targeted|tracked|'
    r'transformed|translated|troubleshot|unified|updated|upgraded|validated|verified|'
    r'wrote'
    r')\b',
    re.IGNORECASE
)

BULLET_PREFIX_PATTERN = re.compile(r'^(?:[•\-\*–—\>·◦\u2022\u25cf\u25cb\u25aa\u25ab]+|\d{1,2}[\.\)]\s+)\s*')

def is_role_line(text: str) -> bool:
    if not text:
        return False
    t = text.strip()
    if len(t) > 85 or len(t.split()) > 9:
        return False
    if '@' in t or re.search(r'https?://|www\.|linkedin|github|\.com\b|\.net\b|\.org\b', t, re.IGNORECASE):
        return False
    if t.endswith('.') and not re.search(r'\b(sr|jr)\.$', t, re.IGNORECASE):
        return False
    if ACTION_VERB_PATTERN.search(t):
        return False
    if re.search(r'\b(reported\s+to|responsible\s+for|working\s+with|worked\s+on)\b', t, re.IGNORECASE):
        return False
    if re.search(r'\b(personal\s+projects?|academic\s+projects?|college\s+projects?|final\s+year\s+project|fyp|capstone)\b', t, re.IGNORECASE):
        return False
    if re.search(r'\b(certified|certifications?|certificates?|credentials?|licenses?|licence|coursera|udemy|edx|udacity|accredited)\b', t, re.IGNORECASE):
        return False
    return bool(ROLE_KEYWORDS_PATTERN.search(t))

def is_company_line(text: str) -> bool:
    if not text:
        return False
    t = text.strip()
    if len(t) < 2 or len(t) > 85 or len(t.split()) > 9:
        return False
    if '@' in t or re.search(r'https?://|www\.|linkedin|github|\.com\b|\.net\b|\.org\b', t, re.IGNORECASE):
        return False
    if t.endswith('.') and not re.search(r'\b(inc|ltd|corp|co)\.$', t, re.IGNORECASE):
        return False
    if ACTION_VERB_PATTERN.search(t):
        return False
    if re.search(r'\b(reported\s+to|responsible\s+for|working\s+with|worked\s+on)\b', t, re.IGNORECASE):
        return False
    if CERT_ISSUER_OR_PLATFORM_PATTERN.search(t):
        return False
    if COMPANY_KEYWORDS_PATTERN.search(t):
        return True
    t_lower = t.lower().strip(".,()")
    if t_lower in KNOWN_COMPANIES:
        return True
    for kc in KNOWN_COMPANIES:
        if re.search(r'\b' + re.escape(kc) + r'\b', t_lower):
            return True
    return False

def clean_period(period_str: str) -> str:
    if not period_str:
        return "Unknown"
    p = re.sub(r'^(?:from|dates?|duration|period|since)\s*[:|\-–—]?\s*', '', period_str.strip(), flags=re.IGNORECASE).strip()
    p = p.strip('()[]{}., \t')
    return p if p else "Unknown"

def clean_title(title_str: str) -> str:
    if not title_str:
        return "Professional Role"
    t = title_str.strip(' ,|-–—\t:;')
    t = re.sub(r'^(?:role|position|title)\s*[:|\-–—]?\s*', '', t, flags=re.IGNORECASE).strip()
    return t if t else "Professional Role"

def clean_company(comp_str: str) -> str:
    if not comp_str:
        return "Company"
    c = comp_str.strip(' ,|-–—\t:;')
    c = re.sub(r'^(?:at|@|company|organization|employer)\s*[:|\-–—]?\s*', '', c, flags=re.IGNORECASE).strip()
    if '|' in c:
        parts = [p.strip() for p in c.split('|') if p.strip()]
        if len(parts) >= 2 and (is_company_line(parts[0]) or not is_company_line(parts[1])):
            c = parts[0]
    return c if c else "Company"

def extract_dates(line: str):
    matches = list(EXP_DATE_PATTERN.finditer(line))
    best_date = None
    best_match = None
    for m in matches:
        cand = m.group(1).strip()
        if re.search(r'\d{2,4}', cand):
            if not best_date or len(cand) > len(best_date):
                best_date = cand
                best_match = m

    line_no_date = line
    if best_match:
        start = best_match.start(1)
        end = best_match.end(1)
        if start > 0 and line[start-1] == '(' and end < len(line) and line[end] == ')':
            line_no_date = line[:start-1] + ' ' + line[end+1:]
        else:
            line_no_date = line[:start] + ' ' + line[end:]
        line_no_date = re.sub(r'\s+', ' ', line_no_date).strip(' ()[]|-–—,\t')

    return line_no_date, best_date

def parse_single_line_job(line: str):
    line_clean = line.strip()
    if ACTION_VERB_PATTERN.search(line_clean) or len(line_clean) > 130:
        return None
    if '@' in line_clean and re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', line_clean):
        return None

    line_no_date, date_found = extract_dates(line_clean)
    parts = [p.strip() for p in re.split(r'\s*(?:[-–—|•·]|(?:\bat\b)|@)\s*', line_no_date, flags=re.IGNORECASE) if p.strip()]

    # If not split yet, check if separated by comma
    if len(parts) < 2 and ',' in line_no_date:
        comma_parts = [p.strip() for p in line_no_date.split(',', 1) if p.strip()]
        if len(comma_parts) == 2 and (is_role_line(comma_parts[0]) or is_company_line(comma_parts[1]) or is_role_line(comma_parts[1]) or is_company_line(comma_parts[0])):
            parts = comma_parts

    if len(parts) >= 2:
        r0 = is_role_line(parts[0])
        r1 = is_role_line(parts[1])
        c0 = is_company_line(parts[0])
        c1 = is_company_line(parts[1])

        title = None
        company = None

        if r0 and not r1:
            title = parts[0]
            company = parts[1]
        elif r1 and not r0:
            title = parts[1]
            company = parts[0]
        elif r0 and c1:
            title = parts[0]
            company = parts[1]
        elif c0 and r1:
            title = parts[1]
            company = parts[0]
        elif r0:
            title = parts[0]
            company = parts[1]
        elif r1:
            title = parts[1]
            company = parts[0]

        if title and company:
            return {
                "title": clean_title(title),
                "company": clean_company(company),
                "period": clean_period(date_found) if date_found else "Unknown",
                "description": ""
            }

    return None

PROJECT_DISQUALIFIER_PATTERN = re.compile(
    r'\b(?:'
    r'projects?|personal\s+projects?|academic\s+projects?|college\s+projects?|'
    r'final\s+year\s+projects?|fyp|capstone(?:\s+projects?)?|coursework(?:\s+projects?)?|'
    r'mini\s+projects?|major\s+projects?|independent\s+projects?|self\s*[- ]projects?|'
    r'hobby\s+projects?|side\s+projects?|portfolio\s+projects?|class\s+projects?|'
    r'school\s+projects?|student\s+projects?|open\s+source\s+projects?|'
    r'group\s+projects?|team\s+projects?|research\s+projects?'
    r')\b',
    re.IGNORECASE
)

def is_project_entry(title: str, company: str, description: str = "") -> bool:
    """
    Returns True if an entry represents an academic, personal, or standalone project
    rather than genuine working experience employed at a company.
    """
    t_clean = (title or "").strip().lower()
    c_clean = (company or "").strip().lower()

    # Company is empty or default placeholder
    if c_clean in ["company", "none", "n/a", "unknown", ""]:
        return True

    # Company name clearly denotes a project or portfolio
    if c_clean in [
        "project", "projects", "personal project", "academic project", "college project",
        "personal", "portfolio", "self", "independent", "github", "capstone", "fyp",
        "freelance project", "university project", "coursework", "independent project",
        "project work", "project details", "projects undertaken"
    ]:
        return True

    if PROJECT_DISQUALIFIER_PATTERN.search(c_clean):
        # Allow only if it is a real registered company name (e.g. "Project Syndicate Inc")
        if not re.search(r'\b(inc|corp|corporation|ltd|limited|llc|technologies|solutions|systems|software)\b', c_clean):
            return True

    # Title explicitly denotes a project
    if t_clean.startswith("project:") or t_clean.startswith("project name:") or t_clean.startswith("projects:") or t_clean.startswith("project -"):
        return True

    if re.match(r'^(?:academic|personal|college|university|final\s+year|capstone|coursework|mini|major|independent|side|hobby|school)\s+projects?\b', t_clean):
        return True

    if re.match(r'^project\s*(?:[:#\-\d]|name\b)', t_clean):
        return True

    if re.match(r'^projects?(?:\s*(?:work|undertaken|details|experience|portfolio|contributions))?$', t_clean):
        return True

    # Disqualify if description references academic/final-year project and company is not a verified business
    if re.search(r'\b(?:academic\s+project|final\s+year\s+project|coursework\s+project|capstone\s+project)\b', description or "", re.IGNORECASE):
        if not is_company_line(company):
            return True

    return False

CERTIFICATION_DISQUALIFIER_PATTERN = re.compile(
    r'\b(?:'
    r'certifications?|certificates?|certified|licences?|licenses?|credentials?|'
    r'accreditations?|accredited|courses?|trainings?|coursework|exam|badge|'
    r'aws\s+certified|azure\s+certified|gcp\s+certified|google\s+cloud\s+certified|'
    r'aws\s+(?:solutions?\s*architect|developer\s*associate|sysops|cloud\s*practitioner|devops\s*engineer|security\s*specialty)|'
    r'azure\s+(?:fundamentals|administrator|developer|solutions?\s*architect|devops\s*engineer)|'
    r'gcp\s+(?:cloud\s*digital\s*leader|associate\s*cloud\s*engineer|professional\s*cloud\s*architect|data\s*engineer)|'
    r'cisco\s+certified|ccna|ccnp|ccie|comptia(?:\s+[a-z0-9+]+)?|'
    r'certified\s+scrum\s*(?:master|developer|product\s*owner)|csm|psm|cspo|'
    r'pmp\b|project\s+management\s+professional|prince2|itil(?:\s+foundation)?|'
    r'certified\s+kubernetes(?:\s+administrator|\s+application\s+developer)?|cka\b|ckad\b|cks\b|'
    r'certified\s+ethical\s+hacker|ceh\b|cissp\b|cism\b|cisa\b|crisc\b|'
    r'oracle\s+certified|red\s+hat\s+certified|rhcsa|rhce|'
    r'salesforce\s+certified|hashicorp\s+certified|istqb(?:\s+certified)?|'
    r'diploma\s+in|advanced\s+diploma|post\s+graduate\s+diploma|pg\s+diploma|pgdac|'
    r'bootcamp|specialization|nanodegree|professional\s+certificate'
    r')\b',
    re.IGNORECASE
)

CERT_ISSUER_OR_PLATFORM_PATTERN = re.compile(
    r'\b(?:'
    r'coursera|udemy|edx|udacity|linkedin\s+learning|datacamp|codecademy|'
    r'freecodecamp|scrum\s+alliance|scrum\.org|pmi\b|project\s+management\s+institute|'
    r'comptia|linux\s+foundation|cloud\s+native\s+computing\s+foundation|cncf|'
    r'istqb|hackerrank|leetcode|credly|badgr|simplilearn|great\s+learning|'
    r'upgrad|scaler|alison|futurelearn|skillshare|kaggle|pluralsight|'
    r'amazon\s+web\s+services\s+training|aws\s+training|cisco\s+networking\s+academy|'
    r'microsoft\s+learn|google\s+cloud\s+skills\s+boost|qwiklabs'
    r')\b',
    re.IGNORECASE
)

def is_project_line(text: str) -> bool:
    if not text:
        return False
    t_clean = text.strip().lower()
    if re.match(r'^(?:projects?|key\s*projects?|academic\s*projects?|personal\s*projects?|project\s*work|client\s*projects?|notable\s*projects?|selected\s*projects?|major\s*projects?|mini\s*projects?)\s*[:|\-–—]?$', t_clean):
        return True
    if re.match(r'^(?:project\s*[:#\-\d]|academic\s+project|personal\s+project|final\s+year\s+project|capstone)\b', t_clean):
        return True
    if t_clean.startswith("project:") or t_clean.startswith("project name:") or t_clean.startswith("projects:"):
        return True
    return False

def is_certification_line(text: str) -> bool:
    if not text:
        return False
    t_clean = text.strip().lower()
    if re.match(r'^(?:certifications?|certificates?|licenses?(?:\s*&\s*certifications?)?|credentials|courses|trainings?|accreditations?)\s*[:|\-–—]?$', t_clean):
        return True
    if re.search(r'\b(?:credential\s*id|license\s*(?:no|number|#)|certificate\s*(?:no|number|id|#)|issued\s+[a-z]{3,9}\s+\d{4}|expires\s+[a-z]{3,9}\s+\d{4}|credential\s*url)\b', t_clean):
        return True
    if CERTIFICATION_DISQUALIFIER_PATTERN.search(t_clean):
        return True
    if re.match(r'^(?:certificate|certification|certified|license|licence|credential|course|training|accredited)\b', t_clean):
        return True
    if CERT_ISSUER_OR_PLATFORM_PATTERN.search(t_clean):
        return True
    return False

def is_certification_entry(title: str, company: str, description: str = "") -> bool:
    """
    Returns True if an entry represents a certification, license, course, or credential
    rather than genuine working experience employed at a company.
    """
    t_clean = (title or "").strip().lower()
    c_clean = (company or "").strip().lower()
    d_clean = (description or "").strip().lower()

    if is_certification_line(t_clean) or is_certification_line(c_clean) or is_certification_line(d_clean):
        return True

    # If title is placeholder/empty and company or description has certification keywords
    if t_clean in ["professional role", "", "none"] and (CERTIFICATION_DISQUALIFIER_PATTERN.search(c_clean) or CERTIFICATION_DISQUALIFIER_PATTERN.search(d_clean)):
        return True

    return False

def parse_experience_section(exp_lines: List[str]) -> List[Dict[str, str]]:
    """
    Extracts structured job entries (title, company, period, description).
    Handles Company-first, Role-first, inline dates, single-line entries,
    and bullet/bulletless job descriptions with high accuracy.
    Strictly extracts ONLY company working experience; completely excludes
    certifications, credentials, courses, and projects.
    """
    if not exp_lines:
        return []

    jobs = []
    current_job = None
    pending_date = None
    in_cert_block = False
    in_project_block = False

    for raw_line in exp_lines:
        line_clean = raw_line.strip()
        if not line_clean:
            continue

        # Skip section horizontal dividers
        if re.match(r'^[-=*_•~]{3,}$', line_clean):
            if current_job and (current_job["title"] != "Professional Role" and current_job["company"] != "Company"):
                jobs.append(current_job)
                current_job = None
            in_cert_block = False
            in_project_block = False
            continue

        # Project subsection headers or standalone project entries
        if is_project_line(line_clean):
            if current_job and current_job["title"] != "Professional Role" and current_job["company"] != "Company":
                jobs.append(current_job)
                current_job = None
            pending_date = None
            in_project_block = True
            in_cert_block = False
            continue

        # Certification subsection headers or standalone certification entries
        if is_certification_line(line_clean):
            if current_job and current_job["title"] != "Professional Role" and current_job["company"] != "Company":
                jobs.append(current_job)
                current_job = None
            pending_date = None
            in_cert_block = True
            in_project_block = False
            continue

        # Check for combined single-line job entry (e.g. "Software Engineer at Google | 2021 - Present")
        single_res = parse_single_line_job(line_clean)
        if single_res and not is_certification_entry(single_res["title"], single_res["company"]) and not is_project_entry(single_res["title"], single_res["company"]):
            in_cert_block = False
            in_project_block = False
            if current_job and (current_job["title"] != "Professional Role" and current_job["company"] != "Company"):
                jobs.append(current_job)
                current_job = None
            if pending_date and single_res["period"] == "Unknown":
                single_res["period"] = clean_period(pending_date)
                pending_date = None
            current_job = single_res
            continue

        line_no_date, extracted_date = extract_dates(line_clean)
        target_content = line_no_date if line_no_date else line_clean
        has_role = is_role_line(target_content) and not is_certification_entry(target_content, "")
        has_comp = is_company_line(target_content) and not is_certification_entry("", target_content)

        # If we are currently inside a certification or project block, check if a genuine job role breaks out
        if in_cert_block or in_project_block:
            if has_role:
                in_cert_block = False
                in_project_block = False
            else:
                # Still inside certification or project content; skip to avoid polluting experience
                continue

        is_bullet = bool(BULLET_PREFIX_PATTERN.match(line_clean))
        clean_text = BULLET_PREFIX_PATTERN.sub('', line_clean).strip()
        is_action_verb = bool(ACTION_VERB_PATTERN.search(clean_text))

        # 1. Bullet points belong to current job's description
        if is_bullet and current_job:
            if current_job["description"]:
                current_job["description"] += "\n" + clean_text
            else:
                current_job["description"] = clean_text
            continue

        # 2. Date-only line (e.g. "Jan 2021 - Present" on its own line)
        if extracted_date and not line_no_date:
            if current_job and current_job["period"] == "Unknown":
                current_job["period"] = clean_period(extracted_date)
            else:
                pending_date = extracted_date
            continue

        # 3. Long descriptive lines or action-verb lines belong to description
        if current_job and (is_action_verb or len(line_clean) > 85 or (line_clean.endswith('.') and not has_role and not has_comp)):
            if current_job["description"]:
                current_job["description"] += "\n" + clean_text
            else:
                current_job["description"] = clean_text
            continue

        # 4. Check if this line starts a NEW job entry
        is_new_job = False
        if current_job:
            has_title_filled = current_job["title"] != "Professional Role"
            has_comp_filled = current_job["company"] != "Company"
            has_desc = bool(current_job["description"])

            if has_role and has_title_filled and (has_comp_filled or has_desc):
                is_new_job = True
            elif has_comp and has_comp_filled and (has_title_filled or has_desc):
                is_new_job = True

        if is_new_job:
            if current_job["title"] != "Professional Role" and current_job["company"] != "Company":
                jobs.append(current_job)
            current_job = None

        if not current_job:
            current_job = {
                "title": "Professional Role",
                "company": "Company",
                "period": clean_period(pending_date) if pending_date else "Unknown",
                "description": ""
            }
            pending_date = None

        if extracted_date and current_job["period"] == "Unknown":
            current_job["period"] = clean_period(extracted_date)

        # Assign role vs company
        if has_role and not has_comp:
            if current_job["title"] == "Professional Role":
                current_job["title"] = clean_title(target_content)
            elif current_job["company"] == "Company" and not current_job["description"]:
                current_job["company"] = clean_company(current_job["title"])
                current_job["title"] = clean_title(target_content)
            else:
                current_job["title"] = clean_title(target_content)
        elif has_comp and not has_role:
            if current_job["company"] == "Company":
                current_job["company"] = clean_company(target_content)
            elif current_job["title"] == "Professional Role":
                current_job["company"] = clean_company(target_content)
        elif current_job["title"] == "Professional Role" and len(line_clean) < 65 and not extracted_date:
            # Only assign if not a certification line
            if not is_certification_entry(target_content, ""):
                current_job["title"] = clean_title(target_content)
        elif current_job["company"] == "Company" and current_job["title"] != "Professional Role" and not current_job["description"] and len(line_clean) < 65:
            if not is_certification_entry("", target_content):
                current_job["company"] = clean_company(target_content)
        else:
            # Descriptive text
            if current_job["description"]:
                current_job["description"] += "\n" + clean_text
            else:
                current_job["description"] = clean_text

    if current_job and (current_job["title"] != "Professional Role" and current_job["company"] != "Company"):
        jobs.append(current_job)

    # Post-process: strictly require genuine company working experience
    clean_jobs = []
    for j in jobs:
        t = clean_title(j["title"])
        c = clean_company(j["company"])
        p = clean_period(j["period"])
        d = j["description"].strip()

        # Check if company accidentally landed in title
        if c == "Company" and is_company_line(t):
            c = t
            t = "Professional Role"

        # Check if title accidentally has comma company e.g. "Software Engineer, Google"
        if c == "Company" and ',' in t:
            sub = [s.strip() for s in t.split(',', 1)]
            if is_role_line(sub[0]) and (is_company_line(sub[1]) or len(sub[1]) < 40):
                t = sub[0]
                c = sub[1]

        has_real_title = t != "Professional Role"
        has_real_comp = c != "Company" and not is_project_entry(t, c, d) and not is_certification_entry(t, c, d)

        # Disqualify projects and certifications: only genuine working experience in a company is accepted
        if is_project_entry(t, c, d) or is_certification_entry(t, c, d):
            continue

        # Genuine company working experience requires BOTH a real role/title and a real company
        if not (has_real_title and has_real_comp):
            continue

        clean_jobs.append({
            "title": t,
            "company": c,
            "period": p,
            "description": d
        })

    return clean_jobs[:10]

# ==============================================================================
# Enhanced Education Extraction Engine
# ==============================================================================

EDU_DEGREE_PATTERN = re.compile(
    r'\b('
    r'bachelor(?:[\'’]s)?(?:\s+of\s+[a-zA-Z\s&]+)?|'
    r'master(?:[\'’]s)?(?:\s+of\s+[a-zA-Z\s&]+)?|'
    r'doctor(?:[\'’]s)?(?:\s+of\s+[a-zA-Z\s&]+)?|'
    r'b\.?sc\.?|bsc|b\.?eng\.?|beng|b\.?tech\.?|btech|b\.?a\.?|ba|b\.?s\.?|bs|'
    r'b\.?b\.?a\.?|bba|b\.?c\.?a\.?|bca|b\.?i\.?c\.?t\.?|bict|b\.?des\.?|bdes|'
    r'm\.?sc\.?|msc|m\.?eng\.?|meng|m\.?tech\.?|mtech|m\.?a\.?|ma|m\.?s\.?|ms|'
    r'm\.?b\.?a\.?|mba|m\.?c\.?a\.?|mca|'
    r'ph\.?d\.?|phd|doctorate|postdoctoral|postdoc|'
    r'higher\s+national\s+diploma|hnd|hnc|national\s+diploma|ndt|hndit|'
    r'advanced\s+diploma|postgraduate\s+diploma|pg\s+diploma|pgd|diploma|'
    r'foundation(?:\s+certificate)?|certificate|'
    r'g\.?c\.?e\.?\s*(?:\(?[ao]/l\)?|advanced\s*level|ordinary\s*level)|'
    r'gce\s*(?:a/l|o/l|advanced\s*level|ordinary\s*level)|'
    r'a/l|o/l|advanced\s*level|ordinary\s*level|'
    r'high\s*school(?:\s*diploma)?|secondary\s*school(?:\s*certificate)?|'
    r'matriculation|ib\s*diploma|international\s*baccalaureate|aissce|cbse'
    r')\b',
    re.IGNORECASE
)

EDU_SCHOOL_EXAM_PATTERN = re.compile(
    r'\b(g\.?c\.?e|a/?l|o/?l|advanced\s*level|ordinary\s*level|high\s*school|matriculation|secondary|cbse|aissce|ib\s*diploma)\b',
    re.IGNORECASE
)

EDU_SCHOOL_KEYWORD_PATTERN = re.compile(
    r'\b('
    r'university|institute|college|school|campus|academy|polytechnic|faculty|'
    r'department|conservatory|seminary|lyceum|vidyalaya|maha\s+vidyalaya'
    r')\b',
    re.IGNORECASE
)

EDU_KNOWN_INSTITUTES = {
    "mit", "stanford", "harvard", "oxford", "cambridge", "caltech", "berkeley",
    "ucla", "cmu", "columbia", "cornell", "princeton", "yale", "sliit", "nsbm",
    "nibm", "iit", "icbt", "esoft", "pearson btec", "pearson", "btec", "edexcel",
    "bits pilani", "iisc", "carnegie mellon", "monash", "melbourne", "toronto",
    "university of colombo", "university of moratuwa", "university of peradeniya",
    "university of kelaniya", "university of sri jayewardenepura", "university of ruhuna",
    "university of jaffna", "open university of sri lanka", "cinec", "horizon campus",
    "iit campus", "informatics institute of technology", "national institute of business management",
    "singapore national university", "nus", "ntu", "imperial college", "ucl", "kcl"
}

EDU_MAJOR_PATTERN = re.compile(
    r'^(?:major(?:\s+in)?|specialising\s+in|specializing\s+in|specialisation\s+in|specialization\s+in|special\s+in|in\s+|stream\s*[:|-])',
    re.IGNORECASE
)

EDU_IGNORE_LINE_PATTERN = re.compile(
    r'^(?:'
    r'gpa|cgpa|grade|score|marks|percentage|dean[\'’]s|merit|distinction|'
    r'first\s+class|second\s+class|upper\s+division|lower\s+division|honours|honors|passed|credit\s+passes|'
    r'\d+\s+[A-Za-z]\s*(?:passes|grades?|as?|bs?|cs?)|'
    r'relevant\s+(?:coursework|courses|modules)|coursework|courses\s+taken|'
    r'teaching\s+assistant|master[\'’]s\s+thesis|thesis|dissertation|final\s+year\s+project|fyp|'
    r'activities|societies|clubs|leadership|z-score|district\s+rank|island\s+rank'
    r')\b',
    re.IGNORECASE
)

EDU_DATE_PATTERN = re.compile(
    r'('
    r'(?:(?:expected(?:\s+graduation)?|graduating|class\s+of)\s*[:|\-–]?\s*)?'
    r'(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?'
    r'(?:20\d{2}|19\d{2})'
    r'(?:\s*(?:[-–to/]+\s*)'
    r'(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*)?'
    r'(?:20\d{2}|19\d{2}|present|current|expected))?'
    r')',
    re.IGNORECASE
)

def is_edu_institution_name(text: str) -> bool:
    if not text:
        return False
    t_clean = text.strip()
    if len(t_clean) < 2 or len(t_clean) > 90:
        return False
    if EDU_SCHOOL_KEYWORD_PATTERN.search(t_clean):
        return True
    t_lower = t_clean.lower().strip(".,()")
    if t_lower in EDU_KNOWN_INSTITUTES:
        return True
    for ki in EDU_KNOWN_INSTITUTES:
        if re.search(r'\b' + re.escape(ki) + r'\b', t_lower):
            return True
    return False

def clean_edu_period(period_str: str) -> str:
    if not period_str:
        return "Unknown"
    p = re.sub(r'^(?:graduation|graduated|expected\s+graduation|expected)\s*[:|\-–]\s*', '', period_str.strip(), flags=re.IGNORECASE).strip()
    p = p.strip('()[]{}., \t')
    return p if p else "Unknown"

def clean_edu_title(title_str: str) -> str:
    if not title_str:
        return "Degree/Program"
    t = title_str.strip(' ,|-–\t:;')
    if t.startswith('(') and t.endswith(')') and t.count('(') == 1 and t.count(')'):
        t = t[1:-1].strip(' ,|-–\t:;')
    if t.startswith('[') and t.endswith(']') and t.count('[') == 1 and t.count(']'):
        t = t[1:-1].strip(' ,|-–\t:;')
    while t.count('(') > t.count(')'):
        t = t + ')'
    while t.count(')') > t.count('(') and t.endswith(')'):
        t = t[:-1].strip(' ,|-–\t:;')
    return t if t else "Degree/Program"

def clean_edu_school(school_str: str) -> str:
    if not school_str:
        return "Institution"
    s = school_str.strip(' ,|-–\t:;')
    if s.startswith('(') and s.endswith(')') and s.count('(') == 1 and s.count(')'):
        s = s[1:-1].strip(' ,|-–\t:;')
    if s.startswith('[') and s.endswith(']') and s.count('[') == 1 and s.count(']'):
        s = s[1:-1].strip(' ,|-–\t:;')
    while s.count('(') > s.count(')'):
        s = s + ')'
    while s.count(')') > s.count('(') and s.endswith(')'):
        s = s[:-1].strip(' ,|-–\t:;')
    return s if s else "Institution"

def extract_edu_dates_from_line(line: str):
    matches = list(EDU_DATE_PATTERN.finditer(line))
    best_date = None
    for m in matches:
        cand = m.group(1).strip()
        if re.search(r'\d{4}', cand):
            if not best_date or len(cand) > len(best_date):
                best_date = cand

    line_no_date = line
    if best_date:
        line_no_date = line.replace(best_date, ' ')
        line_no_date = re.sub(r'\s+', ' ', line_no_date).strip(' ()[]|-–,\t')

    return line_no_date, best_date

def parse_single_line_edu(line: str):
    line_clean = line.strip()
    if EDU_IGNORE_LINE_PATTERN.search(line_clean):
        return None

    line_no_date, date_found = extract_edu_dates_from_line(line_clean)

    # Only split on explicit delimiters: | or  -  or at or from or @
    parts = [p.strip() for p in re.split(r'\s*(?:[|•]|\s[-–]\s|(?:\bat\b)|(?:\bfrom\b)|@)\s*', line_no_date, flags=re.IGNORECASE) if p.strip()]

    # If comma is present, only consider it if one side has degree and the other has institution
    if len(parts) < 2 and ',' in line_no_date:
        comma_parts = [p.strip() for p in line_no_date.split(',') if p.strip()]
        if len(comma_parts) >= 2:
            c0, c1 = comma_parts[0], comma_parts[1]
            if (EDU_DEGREE_PATTERN.search(c0) and is_edu_institution_name(c1)) or (EDU_DEGREE_PATTERN.search(c1) and is_edu_institution_name(c0)):
                parts = [c0, c1]

    if len(parts) >= 2:
        deg_idx = -1
        sch_idx = -1

        for i, p in enumerate(parts):
            if deg_idx == -1 and EDU_DEGREE_PATTERN.search(p):
                deg_idx = i
            elif sch_idx == -1 and is_edu_institution_name(p):
                sch_idx = i

        # MUST have BOTH degree and school to qualify as a valid single-line education entry
        if deg_idx != -1 and sch_idx != -1:
            return {
                "title": clean_edu_title(parts[deg_idx]),
                "school": clean_edu_school(parts[sch_idx]),
                "period": clean_edu_period(date_found) if date_found else "Unknown"
            }

    return None

def parse_education_section(edu_lines: List[str]) -> List[Dict[str, str]]:
    """
    Extracts structured education entries (title, school, period) with high precision:
    - Recognizes degree titles, honours, specialisations and majors.
    - Accurately identifies universities, colleges, schools, faculties and known institutes.
    - Formats clean date ranges and handles single-line or multi-line formats.
    - Inherits schools for multi-degree blocks (e.g. A/L + O/L under same school).
    """
    if not edu_lines:
        return []

    entries = []
    current_entry = None

    for raw_line in edu_lines:
        line_clean = raw_line.strip()
        if not line_clean:
            continue

        # Skip divider lines
        if re.match(r'^[-=*_•~]{3,}$', line_clean):
            if current_entry and (current_entry["title"] != "Degree/Program" or current_entry["school"] != "Institution"):
                entries.append(current_entry)
                current_entry = None
            continue

        # Check if line is purely an ignore/detail line (GPA, Coursework, Thesis, Exam passes)
        if EDU_IGNORE_LINE_PATTERN.search(line_clean):
            continue

        # Try parsing as a combined single-line entry (e.g., "Degree - School | Date")
        single_res = parse_single_line_edu(line_clean)
        if single_res:
            if current_entry and (current_entry["title"] != "Degree/Program" or current_entry["school"] != "Institution"):
                entries.append(current_entry)
                current_entry = None
            entries.append(single_res)
            continue

        line_no_date, extracted_date = extract_edu_dates_from_line(line_clean)
        has_deg = bool(EDU_DEGREE_PATTERN.search(line_clean))
        has_sch = is_edu_institution_name(line_clean)
        is_major = bool(EDU_MAJOR_PATTERN.search(line_clean))

        # Check for date-only line
        if extracted_date and not line_no_date:
            if current_entry and current_entry["period"] == "Unknown":
                current_entry["period"] = clean_edu_period(extracted_date)
            continue

        # Check if this line starts a NEW education entry
        is_new_entry = False
        if current_entry:
            has_title_filled = current_entry["title"] != "Degree/Program"
            has_school_filled = current_entry["school"] != "Institution"
            has_period_filled = current_entry["period"] != "Unknown"

            if has_deg and has_title_filled:
                is_new_entry = True
            elif has_sch and has_school_filled and not has_deg:
                if has_title_filled or has_period_filled:
                    is_new_entry = True

        if is_new_entry:
            entries.append(current_entry)
            current_entry = None

        if not current_entry:
            current_entry = {
                "title": "Degree/Program",
                "school": "Institution",
                "period": "Unknown"
            }

        if extracted_date and current_entry["period"] == "Unknown":
            current_entry["period"] = clean_edu_period(extracted_date)

        # Process line
        if is_major and current_entry["title"] != "Degree/Program":
            major_clean = re.sub(r'^(?:major(?:\s+in)?|specialising\s+in|specializing\s+in|specialisation\s+in|specialization\s+in|special\s+in|in\s+|stream\s*[:|\-])\s*', '', line_no_date, flags=re.IGNORECASE).strip()
            if major_clean:
                current_entry["title"] = f"{current_entry['title']} in {major_clean}"
        elif has_deg and not has_sch:
            current_entry["title"] = clean_edu_title(line_no_date if line_no_date else line_clean)
        elif has_sch and not has_deg:
            current_entry["school"] = clean_edu_school(line_no_date if line_no_date else line_clean)
        elif is_major:
            major_clean = re.sub(r'^(?:major(?:\s+in)?|specialising\s+in|specializing\s+in|specialisation\s+in|specialization\s+in|special\s+in|in\s+|stream\s*[:|\-])\s*', '', line_no_date, flags=re.IGNORECASE).strip()
            current_entry["title"] = clean_edu_title(f"Bachelor in {major_clean}")
        elif current_entry["school"] == "Institution" and is_edu_institution_name(line_clean):
            current_entry["school"] = clean_edu_school(line_clean)
        elif current_entry["title"] == "Degree/Program" and len(line_clean) < 80 and not extracted_date:
            current_entry["title"] = clean_edu_title(line_clean)

    if current_entry and (current_entry["title"] != "Degree/Program" or current_entry["school"] != "Institution"):
        entries.append(current_entry)

    # Post-process: clean up defaults, inherit school when omitted, and format fields
    clean_entries = []
    prev_valid_entry = None
    for e in entries:
        t = clean_edu_title(e["title"])
        s = clean_edu_school(e["school"])
        p = clean_edu_period(e["period"])

        # Intelligent school inheritance for multi-degree blocks (e.g. BS + MS, or A/L + O/L under same school)
        if s == "Institution" and prev_valid_entry:
            prev_s = prev_valid_entry["school"]
            prev_t = prev_valid_entry["title"]
            is_curr_exam = bool(EDU_SCHOOL_EXAM_PATTERN.search(t))
            is_prev_exam = bool(EDU_SCHOOL_EXAM_PATTERN.search(prev_t))
            prev_has_school_kw = bool(re.search(r'\b(college|school|vidyalaya|lyceum|academy)\b', prev_s, re.IGNORECASE))

            if is_curr_exam and (is_prev_exam or prev_has_school_kw):
                s = prev_s
            elif not is_curr_exam and not is_prev_exam:
                s = prev_s

        if t != "Degree/Program" or s != "Institution":
            res_entry = {
                "title": t,
                "school": s,
                "period": p
            }
            clean_entries.append(res_entry)
            if s != "Institution":
                prev_valid_entry = res_entry

    return clean_entries[:6]

def parse_cv_text(text: str, json_data: Optional[Union[Dict[str, Any], str]] = None, xml_content: Optional[str] = None, filename: Optional[str] = None, pdf_bytes: Optional[bytes] = None) -> Dict[str, Any]:
    """
    Extracts all candidate profile fields from structured text using SpaCy NER and layout heuristics.
    Guaranteed to return complete dictionary and never raise.
    """
    if not text or not text.strip():
        # Scanned or image PDF fallback
        derived_name = None
        if filename:
            clean_file = re.sub(r'\.pdf$', '', filename, flags=re.IGNORECASE)
            clean_file = re.sub(r'[-_](?:cv|resume|devops|intern|fullstack|se|backend|frontend).*$', '', clean_file, flags=re.IGNORECASE)
            file_tokens = [t for t in re.split(r'[-_\s]+', clean_file) if t and not t.isdigit() and t.lower() not in NAME_BLACKLIST]
            if 1 < len(file_tokens) <= 4:
                derived_name = " ".join(file_tokens).title()

        return {
            "name": derived_name,
            "email": None,
            "phone": None,
            "location": None,
            "linkedin": None,
            "github": None,
            "headline": "Candidate" if derived_name else None,
            "bio": None,
            "language": "English",
            "skills": [],
            "education": [],
            "experience": []
        }

    try:
        doc = nlp(text)
    except Exception:
        doc = None

    # 1. Extract email
    email = None
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    if email_match:
        email = email_match.group(0)
    else:
        email_match = re.search(r'[a-zA-Z0-9_.+-]+\s*@\s*[a-zA-Z0-9-]+\s*\.\s*[a-zA-Z0-9-.]+', text)
        if email_match:
            email = email_match.group(0).replace(" ", "")

    # 2. Extract Name
    name = None

    # Tier 1: Font-size hierarchy from structured JSON (or legacy XML)
    if json_data:
        name = extract_name_from_json(json_data)
    elif xml_content:
        name = extract_name_from_xml(xml_content)

    # Tier 2: Email username cross-verification
    lines = text.splitlines()
    non_empty_lines = [l.strip() for l in lines if l.strip()]

    if not name and email:
        username = email.split('@')[0]
        user_tokens = [t.lower() for t in re.split(r'[\._\-0-9]+', username) if len(t) >= 3]
        if user_tokens:
            for line in non_empty_lines[:10]:
                if is_valid_name(line):
                    line_lower = line.lower()
                    if any(tok in line_lower for tok in user_tokens):
                        cleaned_n = re.sub(r',?\s*(?:ph\.?d\.?|m\.?d\.?|msc|bsc|mba|pmp)$', '', line, flags=re.IGNORECASE).strip()
                        name = cleaned_n.title()
                        break

    # Tier 3: SpaCy NAME / PERSON entity in the top document header
    if not name and doc:
        header_text = text[:600]
        try:
            header_doc = nlp(header_text)
            for ent in header_doc.ents:
                if ent.label_ in ("NAME", "PERSON") and is_valid_name(ent.text):
                    cleaned_n = re.sub(r',?\s*(?:ph\.?d\.?|m\.?d\.?|msc|bsc|mba|pmp)$', '', ent.text, flags=re.IGNORECASE).strip()
                    name = cleaned_n.title()
                    break
        except Exception:
            pass

    # Tier 4: First valid human name in top 6 non-empty lines
    if not name:
        for line in non_empty_lines[:6]:
            if is_valid_name(line):
                cleaned_n = re.sub(r',?\s*(?:ph\.?d\.?|m\.?d\.?|msc|bsc|mba|pmp)$', '', line, flags=re.IGNORECASE).strip()
                name = cleaned_n.title()
                break

    # Tier 5: Filename fallback
    if not name and filename:
        clean_file = re.sub(r'\.pdf$', '', filename, flags=re.IGNORECASE)
        clean_file = re.sub(r'[-_](?:cv|resume|devops|intern|fullstack|se|backend|frontend).*$', '', clean_file, flags=re.IGNORECASE)
        file_tokens = [t for t in re.split(r'[-_\s]+', clean_file) if t and not t.isdigit() and t.lower() not in NAME_BLACKLIST]
        if 1 < len(file_tokens) <= 4:
            name = " ".join(file_tokens).title()

    # 3. Categorize document lines into sections
    section_lines = {
        "education": [],
        "experience": [],
        "skills": [],
        "bio": [],
        "language": [],
        "certifications": [],
        "projects": [],
        "other": []
    }

    current_section = None
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        detected_sec = identify_section(line_clean)
        if detected_sec:
            current_section = detected_sec
            if ':' in line_clean:
                after_colon = line_clean.split(':', 1)[1].strip()
                if after_colon and current_section in section_lines:
                    section_lines[current_section].append(after_colon)
            continue

        if current_section and current_section in section_lines:
            section_lines[current_section].append(line_clean)

    # 4. Extract Skills
    skills_set = set()
    canonical_skills = {k.lower(): v for k, v in CANONICAL_MAP.items()}

    text_lower = text.lower()
    for skill_kw in COMMON_SKILLS:
        kw_lower = skill_kw.lower()
        pattern = r'(?:\b|(?<=\s))' + re.escape(kw_lower) + r'(?:\b|(?=\s))'
        if re.search(pattern, text_lower):
            display_name = canonical_skills.get(kw_lower, skill_kw.title())
            skills_set.add(display_name)

    for s_line in section_lines["skills"]:
        s_line_clean = s_line.strip()
        if not s_line_clean:
            continue

        s_line_clean = re.sub(
            r'^(?:programming\s*languages?|languages?|frameworks?(?:\s*&\s*libraries)?|technologies|tools(?:\s*&\s*platforms)?|tools|platforms|databases?|cloud(?:\s*&\s*devops)?|devops|operating\s*systems?|other|methodologies|web\s*technologies)\s*[:|\-–]\s*',
            '',
            s_line_clean,
            flags=re.IGNORECASE
        )

        s_parts = re.split(r'[,|•/;\t]+', s_line_clean)
        for p in s_parts:
            clean_p = p.strip().strip('.').strip()
            if not clean_p or len(clean_p) < 2 or len(clean_p) > 35:
                continue
            if re.search(r'[\d@:/\\]', clean_p):
                continue
            clean_p_lower = clean_p.lower()
            if clean_p_lower in SKILL_BLACKLIST:
                continue
            if any(clean_p_lower.startswith(b + " ") for b in ["verify", "coursera", "intro to", "getting started", "advanced", "intermediate"]):
                continue

            if clean_p_lower in canonical_skills:
                skills_set.add(canonical_skills[clean_p_lower])
            else:
                formatted = " ".join([w.capitalize() if w.lower() not in ["and", "or", "of", "in"] else w.lower() for w in clean_p.split()])
                skills_set.add(formatted)

    # ML / Trained spaCy NER Skill Extraction
    if doc:
        for ent in doc.ents:
            if ent.label_ == "SKILLS":
                clean_ent = ent.text.strip().strip('.').strip()
                if clean_ent and len(clean_ent) >= 2 and clean_ent.lower() not in SKILL_BLACKLIST:
                    display_name = canonical_skills.get(clean_ent.lower(), clean_ent)
                    skills_set.add(display_name)

    skills = sorted(list(skills_set))

    # 5. Parse Work Experience and Education (Only genuine company working experience, never projects)
    experience = parse_experience_section(section_lines["experience"])

    # Global document fallback for experience if headers weren't identified
    if not experience:
        fallback_candidates = []
        in_excluded_sec = False
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            sec = identify_section(line_str)
            if sec:
                if sec in ["education", "skills", "language", "bio", "references", "awards", "publications", "volunteering", "projects", "certifications"]:
                    in_excluded_sec = True
                    continue
                else:
                    in_excluded_sec = False
            if in_excluded_sec:
                continue
            # Skip contact/header info lines: email, phone, links, candidate name
            if '@' in line_str or re.search(r'https?://|www\.|linkedin|github|\.com\b|\.net\b', line_str, re.IGNORECASE):
                continue
            if name and (name.lower() == line_str.lower() or name.lower() in line_str.lower()):
                continue
            if EDU_DEGREE_PATTERN.search(line_str) or EDU_SCHOOL_KEYWORD_PATTERN.search(line_str):
                continue
            fallback_candidates.append(line_str)
        if any(is_role_line(l) or parse_single_line_job(l) for l in fallback_candidates):
            fb_jobs = parse_experience_section(fallback_candidates)
            if fb_jobs:
                experience = fb_jobs

    education = parse_education_section(section_lines["education"])

    # 6. Bio Summary
    bio = None
    if section_lines["bio"]:
        bio = " ".join(section_lines["bio"]).strip()
        bio = re.sub(r'\s+', ' ', bio)
        if len(bio) > 500:
            bio = bio[:497] + '...'

    # 7. Languages
    language = "English"
    if section_lines["language"]:
        languages_found = []
        for l_line in section_lines["language"]:
            for item in re.split(r'[,|•/;]+', l_line):
                cleaned_lang = item.strip().title()
                if 2 < len(cleaned_lang) < 30 and cleaned_lang not in languages_found:
                    languages_found.append(cleaned_lang)
        if languages_found:
            language = ", ".join(languages_found)

    # 8. Extract Phone
    phone = None
    phone_match = re.search(r'(?:(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4})|(?:0\d{2}[\s-]?\d{3}[\s-]?\d{4})', text)
    if phone_match:
        phone = phone_match.group(0).strip()

    # 9. Extract Location
    location = None
    for line in non_empty_lines[:10]:
        if name and (name.lower() in line.lower() or line.lower() in name.lower()):
            continue
        if re.search(r'(@|github|linkedin|http|www|curriculum|resume|summary)', line, re.IGNORECASE):
            continue

        tokens = re.split(r'\s*[|•·]\s*', line)
        for token in tokens:
            t = token.strip()
            if not t or len(t) < 3 or len(t) > 40:
                continue
            if re.search(r'(@|\d{5,}|github|linkedin|http)', t, re.IGNORECASE):
                continue
            m = re.match(r'^([A-Z][a-zA-Z\s.-]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s.-]+(?:,\s*[A-Z]{2,})?))$', t)
            if m:
                cand = m.group(1).strip()
                if not re.search(r'\b(phd|bsc|msc|engineer|developer|scientist|manager|intern|analyst)\b', cand, re.IGNORECASE):
                    location = cand
                    break
        if location:
            break

    if not location and doc:
        gpes = [ent.text.strip() for ent in doc.ents if ent.label_ == "GPE" and len(ent.text.strip()) > 2]
        if gpes:
            location = gpes[0]

    if not location:
        known_locs = [
            "Colombo, Sri Lanka", "Sri Lanka", "San Francisco, CA", "San Francisco",
            "Boston, MA", "Boston", "New York, NY", "New York", "London, UK", "London",
            "Toronto, Canada", "Toronto", "Sydney, Australia", "Sydney", "Singapore",
            "Kandy, Sri Lanka", "Galle, Sri Lanka", "Moratuwa, Sri Lanka", "Kelaniya, Sri Lanka",
            "Malabe, Sri Lanka", "Seattle, WA", "Austin, TX", "Chicago, IL", "California", "USA", "UK"
        ]
        for loc in known_locs:
            if re.search(r'\b' + re.escape(loc) + r'\b', text[:800], re.IGNORECASE):
                location = loc
                break

    # 10. Extract LinkedIn & GitHub
    annot_uris = []
    if pdf_bytes:
        annot_uris.extend(extract_pdf_annotations(pdf_bytes))
    if json_data:
        if isinstance(json_data, str):
            try:
                json_data_obj = json.loads(json_data)
            except Exception:
                json_data_obj = {}
        else:
            json_data_obj = json_data
        if isinstance(json_data_obj, dict):
            annot_uris.extend(json_data_obj.get("annotations", []))
    if xml_content:
        xml_uris = re.findall(r'href=[\'"]([^\'"]+)[\'"]', xml_content, re.IGNORECASE)
        annot_uris.extend(xml_uris)

    combined_annot_text = " \n ".join(annot_uris)
    json_str_search = json.dumps(json_data) if isinstance(json_data, (dict, list)) else (str(json_data) if json_data else "")

    # Normalize spaced domains e.g. 'linkedin . com / in / dinukasam'
    normalized_text = text or ""
    normalized_text = re.sub(r'linkedin\s*\.\s*com\s*(?:/\s*(?:in|profile|pub))?\s*/\s*', 'linkedin.com/in/', normalized_text, flags=re.IGNORECASE)
    normalized_text = re.sub(r'github\s*\.\s*com\s*/\s*', 'github.com/', normalized_text, flags=re.IGNORECASE)

    search_space = combined_annot_text + " \n " + json_str_search + " \n " + (xml_content or '') + " \n " + normalized_text

    # Extract LinkedIn
    linkedin = None
    li_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/(?:in/|profile/|pub/)?([a-zA-Z0-9_.-]+)', search_space, re.IGNORECASE)
    if li_match:
        li_user = li_match.group(1).rstrip('.,/)"\'')
        if li_user.lower() not in ["", "in", "profile", "user", "pub"]:
            linkedin = f"https://linkedin.com/in/{li_user}"

    if not linkedin:
        li_label = re.search(r'\b(?:linkedin|linked-in)\s*(?:profile|account|url)?\s*[:|•\-–/]\s*(?:/in/|in/)?([a-zA-Z0-9_.-]+)', normalized_text, re.IGNORECASE)
        if li_label:
            li_user = li_label.group(1).rstrip('.,/)"\'')
            if li_user.lower() not in ["", "in", "profile", "user", "http", "https", "www"]:
                linkedin = f"https://linkedin.com/in/{li_user}"

    # Extract GitHub
    github = None
    gh_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_.-]+)', search_space, re.IGNORECASE)
    if gh_match:
        gh_user = gh_match.group(1).rstrip('.,/)"\'')
        if gh_user.lower() not in ["", "profile", "user", "in", "about", "repositories", "tab"]:
            github = f"https://github.com/{gh_user}"

    if not github:
        gh_label = re.search(r'\b(?:github|git-hub)\s*(?:profile|account|url)?\s*[:|•\-–/]\s*([a-zA-Z0-9_.-]+)', normalized_text, re.IGNORECASE)
        if gh_label:
            gh_user = gh_label.group(1).rstrip('.,/)"\'')
            if gh_user.lower() not in ["", "profile", "user", "http", "https", "www"]:
                github = f"https://github.com/{gh_user}"

    # 12. Extract Headline
    headline = None
    name_line_idx = -1
    if name:
        for idx, l in enumerate(non_empty_lines[:8]):
            if name.lower() in l.lower() or l.lower() in name.lower():
                name_line_idx = idx
                break

    if name_line_idx >= 0 and name_line_idx + 1 < len(non_empty_lines):
        next_line = non_empty_lines[name_line_idx + 1]
        if re.search(r'\b(engineer|developer|designer|manager|architect|analyst|scientist|lead|specialist|consultant|enthusiast|intern|undergraduate|student|fellow)\b', next_line, re.IGNORECASE):
            if not re.search(r'[@:]|github|linkedin', next_line, re.IGNORECASE) and len(next_line) < 70:
                headline = next_line.strip()

    if not headline and experience and len(experience) > 0 and experience[0].get("title") not in ["Professional Role", "New Experience", ""]:
        headline = experience[0].get("title")

    if not headline:
        for line in non_empty_lines[:10]:
            if re.search(r'\b(engineer|developer|designer|manager|architect|analyst|scientist|lead|specialist|consultant)\b', line, re.IGNORECASE):
                if not re.search(r'[@:]|github|linkedin', line, re.IGNORECASE) and len(line) < 70:
                    headline = line.strip()
                    break

    # ML / Trained NER Designation fallback for headline
    if not headline and doc:
        for ent in doc.ents:
            if ent.label_ == "DESIGNATION":
                desig_val = ent.text.strip()
                if 3 <= len(desig_val) <= 60 and not re.search(r'[@:]|github|linkedin', desig_val, re.IGNORECASE):
                    headline = desig_val
                    break

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

@app.post("/convert-to-json")
def convert_to_json_endpoint(payload: PDFPayload):
    """
    Converts an uploaded CV PDF into structured JSON representation.
    Accepts JSON { "pdf_base64": "..." }.
    Always returns HTTP 200 with JSON content.
    """
    try:
        pdf_bytes = base64.b64decode(payload.pdf_base64)
    except Exception:
        pdf_bytes = b""

    json_data = pdf_to_json(pdf_bytes)
    return {
        "json": json_data,
        "page_count": len(json_data.get("pages", []))
    }

@app.post("/extract-from-json")
def extract_from_json_endpoint(payload: JSONPayload):
    """
    Extracts candidate details directly from a structured JSON document.
    Always returns HTTP 200 with extracted candidate details.
    """
    raw_json = payload.json_data if payload.json_data is not None else payload.data
    try:
        structured_text = extract_text_from_json(raw_json)
        data = parse_cv_text(structured_text, json_data=raw_json, filename=payload.filename)
        return data
    except Exception:
        # Emergency fallback
        return {
            "name": None, "email": None, "phone": None, "location": None,
            "linkedin": None, "github": None, "headline": None, "bio": None,
            "language": "English", "skills": [], "education": [], "experience": []
        }

@app.post("/convert-to-xml")
def convert_to_xml_endpoint(payload: PDFPayload):
    """
    Converts an uploaded CV PDF into structured XML representation (Legacy).
    Accepts JSON { "pdf_base64": "..." }.
    Always returns HTTP 200 with XML content.
    """
    try:
        pdf_bytes = base64.b64decode(payload.pdf_base64)
    except Exception:
        pdf_bytes = b""

    xml_content = pdf_to_xml(pdf_bytes)
    return {
        "xml": xml_content,
        "size": len(xml_content)
    }

@app.post("/extract-from-xml")
def extract_from_xml_endpoint(payload: XMLPayload):
    """
    Extracts candidate details directly from an XML document (Legacy).
    Always returns HTTP 200 with extracted candidate details.
    """
    xml_str = payload.xml or ""
    try:
        structured_text = extract_text_from_xml(xml_str)
        data = parse_cv_text(structured_text, xml_content=xml_str, filename=payload.filename)
        return data
    except Exception:
        # Emergency fallback
        return {
            "name": None, "email": None, "phone": None, "location": None,
            "linkedin": None, "github": None, "headline": None, "bio": None,
            "language": "English", "skills": [], "education": [], "experience": []
        }

@app.post("/extract-pdf")
def extract_pdf_endpoint(payload: PDFPayload):
    """
    Complete single-call pipeline:
    1. Converts CV PDF to structured JSON layout.
    2. Extracts candidate data from JSON layout and structured text.
    Returns both the generated JSON and extracted candidate fields.
    Always returns HTTP 200.
    """
    try:
        pdf_bytes = base64.b64decode(payload.pdf_base64)
    except Exception:
        pdf_bytes = b""

    json_data = pdf_to_json(pdf_bytes)
    structured_text = extract_text_from_json(json_data)
    data = parse_cv_text(structured_text, json_data=json_data, filename=payload.filename, pdf_bytes=pdf_bytes)

    return {
        "json": json_data,
        "data": data
    }

@app.post("/extract")
def extract_cv(cv: CVText):
    """
    Universal extraction endpoint.
    Accepts 'pdf_base64', 'json_data', 'xml', or 'text'.
    Always returns HTTP 200 with candidate details.
    """
    # 1. PDF Base64 -> Convert to JSON & Extract
    if cv.pdf_base64:
        try:
            pdf_bytes = base64.b64decode(cv.pdf_base64)
        except Exception:
            pdf_bytes = b""
        json_data = pdf_to_json(pdf_bytes)
        structured_text = extract_text_from_json(json_data)
        data = parse_cv_text(structured_text, json_data=json_data, filename=cv.filename, pdf_bytes=pdf_bytes)
        data["json"] = json_data
        return data

    # 2. JSON Data
    if cv.json_data:
        structured_text = extract_text_from_json(cv.json_data)
        data = parse_cv_text(structured_text, json_data=cv.json_data, filename=cv.filename)
        return data

    # 3. XML (Legacy support)
    if cv.xml:
        structured_text = extract_text_from_xml(cv.xml)
        data = parse_cv_text(structured_text, xml_content=cv.xml, filename=cv.filename)
        return data

    # 4. Text (or serialized JSON)
    if cv.text:
        trimmed = cv.text.strip()
        if trimmed.startswith("{") and ("pages" in trimmed or "text_blocks" in trimmed):
            try:
                parsed_json = json.loads(trimmed)
                structured_text = extract_text_from_json(parsed_json)
                return parse_cv_text(structured_text, json_data=parsed_json, filename=cv.filename)
            except Exception:
                pass
        if trimmed.startswith("<") and ("<pages>" in trimmed or "<?xml" in trimmed or "<document>" in trimmed):
            structured_text = extract_text_from_xml(trimmed)
            return parse_cv_text(structured_text, xml_content=trimmed, filename=cv.filename)
        return parse_cv_text(cv.text, filename=cv.filename)

    # Empty fallback
    return {
        "name": None, "email": None, "phone": None, "location": None,
        "linkedin": None, "github": None, "headline": None, "bio": None,
        "language": "English", "skills": [], "education": [], "experience": []
    }


class NERPredictRequest(BaseModel):
    text: str

class NERTrainRequest(BaseModel):
    epochs: Optional[int] = 35

@app.get("/ner/status")
def ner_status():
    """Returns the loaded spaCy model status, labels, and pipeline."""
    is_custom = "DESIGNATION" in nlp.pipe_labels.get("ner", []) or "NAME" in nlp.pipe_labels.get("ner", [])
    return {
        "status": "ready",
        "model_type": "custom_trained_resume_ner" if is_custom else "en_core_web_sm_base",
        "custom_labels_loaded": is_custom,
        "labels": nlp.pipe_labels.get("ner", []),
        "pipeline": nlp.pipe_names
    }

@app.post("/ner/predict")
def ner_predict(payload: NERPredictRequest):
    """
    Extracts entities directly using the trained spaCy Resume NER model.
    """
    if not payload.text:
        return {"entities": []}
    
    doc = nlp(payload.text[:20000])
    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text.strip(),
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char
        })
    return {
        "text_length": len(payload.text),
        "entities_count": len(entities),
        "entities": entities
    }

@app.post("/ner/train")
def ner_train_endpoint(payload: Optional[NERTrainRequest] = None):
    """
    Triggers training of the custom Resume NER model using training_data.py.
    """
    epochs = payload.epochs if payload and payload.epochs else 35
    try:
        from train_ner import train_model
        global nlp
        nlp = train_model(epochs=epochs)
        return {
            "status": "success",
            "message": f"Successfully trained Resume NER model for {epochs} epochs.",
            "labels": nlp.pipe_labels.get("ner", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")
