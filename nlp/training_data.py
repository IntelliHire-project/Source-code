"""
IntelliHire NLP - Resume NER Training Dataset
Contains rich annotated CV snippets for training a custom spaCy NER model
with labels: NAME, DESIGNATION, COMPANY, DEGREE, COLLEGE, SKILLS, EXPERIENCE
"""

import re
from typing import List, Tuple, Dict, Any

def create_example(text: str, annotations: List[Tuple[str, str]]) -> Tuple[str, Dict[str, Any]]:
    """
    Safely creates a spaCy training example from text and a list of (entity_text, label) tuples.
    Finds exact non-overlapping character boundaries.
    """
    entities = []
    occupied_spans = []

    for entity_text, label in annotations:
        entity_text_clean = entity_text.strip()
        if not entity_text_clean:
            continue

        pattern = re.escape(entity_text_clean)
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            start, end = match.span()
            overlap = any(s < end and e > start for s, e in occupied_spans)
            if not overlap:
                entities.append((start, end, label))
                occupied_spans.append((start, end))
                break

    entities.sort(key=lambda x: x[0])
    return (text, {"entities": entities})

RAW_TRAINING_SAMPLES = [
    # 1. Full Stack Developer Sample
    (
        "Alex Rivera\nSenior Full Stack Engineer\nEmail: alex.rivera@example.com | Phone: +1 555-0192\n"
        "Summary: Innovative software engineer with 8+ years of experience building scalable web applications.\n"
        "Experience:\n"
        "Senior Software Engineer at TechFlow Solutions (Jan 2021 - Present)\n"
        "Built microservices architecture using React, TypeScript, Node.js, and Docker on AWS.\n"
        "Full Stack Developer at CloudSphere Inc. (Mar 2018 - Dec 2020)\n"
        "Education:\n"
        "Master of Computer Science from Stanford University (2016 - 2018)\n"
        "B.S. in Software Engineering from Georgia Institute of Technology (2012 - 2016)\n"
        "Skills: React, TypeScript, Node.js, Next.js, Python, Docker, AWS, GraphQL, PostgreSQL",
        [
            ("Alex Rivera", "NAME"),
            ("Senior Full Stack Engineer", "DESIGNATION"),
            ("8+ years", "EXPERIENCE"),
            ("Senior Software Engineer", "DESIGNATION"),
            ("TechFlow Solutions", "COMPANY"),
            ("React", "SKILLS"),
            ("TypeScript", "SKILLS"),
            ("Node.js", "SKILLS"),
            ("Docker", "SKILLS"),
            ("AWS", "SKILLS"),
            ("Full Stack Developer", "DESIGNATION"),
            ("CloudSphere Inc.", "COMPANY"),
            ("Master of Computer Science", "DEGREE"),
            ("Stanford University", "COLLEGE"),
            ("B.S. in Software Engineering", "DEGREE"),
            ("Georgia Institute of Technology", "COLLEGE"),
            ("Next.js", "SKILLS"),
            ("Python", "SKILLS"),
            ("GraphQL", "SKILLS"),
            ("PostgreSQL", "SKILLS"),
        ]
    ),

    # 2. DevOps & Cloud Sample
    (
        "Kasun Perera\nLead DevOps Engineer\nColombo, Sri Lanka | kasun.p@virtusa.com\n"
        "Work Experience:\n"
        "Lead DevOps Engineer at Virtusa (Feb 2020 - Present)\n"
        "Managed Kubernetes clusters, Terraform scripts, and CI/CD pipelines in GitLab.\n"
        "Senior Systems Engineer at WSO2 (Jun 2017 - Jan 2020)\n"
        "Automated deployment workflows using Ansible and Jenkins.\n"
        "Associate Software Engineer at Sysco LABS (Jan 2016 - May 2017)\n"
        "Education:\n"
        "BSc in Information Technology from University of Moratuwa\n"
        "Skills: Kubernetes, Docker, Terraform, AWS, Jenkins, Linux, Python, Go, Ansible",
        [
            ("Kasun Perera", "NAME"),
            ("Lead DevOps Engineer", "DESIGNATION"),
            ("Virtusa", "COMPANY"),
            ("Kubernetes", "SKILLS"),
            ("Terraform", "SKILLS"),
            ("GitLab", "SKILLS"),
            ("Senior Systems Engineer", "DESIGNATION"),
            ("WSO2", "COMPANY"),
            ("Ansible", "SKILLS"),
            ("Jenkins", "SKILLS"),
            ("Associate Software Engineer", "DESIGNATION"),
            ("Sysco LABS", "COMPANY"),
            ("BSc in Information Technology", "DEGREE"),
            ("University of Moratuwa", "COLLEGE"),
            ("Linux", "SKILLS"),
            ("Python", "SKILLS"),
            ("Go", "SKILLS"),
        ]
    ),

    # 3. Data Science & Machine Learning Sample
    (
        "Dr. Sophia Martinez\nStaff Data Scientist\nSan Francisco, CA\n"
        "Professional Experience:\n"
        "Staff Data Scientist at Google (2021 - Present)\n"
        "Trained large language models and computer vision transformers using PyTorch, TensorFlow, and CUDA.\n"
        "Senior Machine Learning Engineer at Uber (2018 - 2021)\n"
        "Developed ETA prediction models with Scikit-Learn and Apache Spark.\n"
        "Education:\n"
        "Ph.D. in Computer Science from Massachusetts Institute of Technology\n"
        "M.S. in Applied Mathematics from UC Berkeley\n"
        "Skills: Python, PyTorch, TensorFlow, NLP, Scikit-Learn, Spark, Pandas, MLOps, SQL",
        [
            ("Sophia Martinez", "NAME"),
            ("Staff Data Scientist", "DESIGNATION"),
            ("Google", "COMPANY"),
            ("PyTorch", "SKILLS"),
            ("TensorFlow", "SKILLS"),
            ("CUDA", "SKILLS"),
            ("Senior Machine Learning Engineer", "DESIGNATION"),
            ("Uber", "COMPANY"),
            ("Scikit-Learn", "SKILLS"),
            ("Apache Spark", "SKILLS"),
            ("Ph.D. in Computer Science", "DEGREE"),
            ("Massachusetts Institute of Technology", "COLLEGE"),
            ("M.S. in Applied Mathematics", "DEGREE"),
            ("UC Berkeley", "COLLEGE"),
            ("Python", "SKILLS"),
            ("NLP", "SKILLS"),
            ("Pandas", "SKILLS"),
            ("MLOps", "SKILLS"),
            ("SQL", "SKILLS"),
        ]
    ),

    # 4. Frontend & Mobile Developer Sample
    (
        "Emily Zhang\nMobile & UI/UX Specialist\nToronto, Canada\n"
        "Experience:\n"
        "Senior Mobile Application Developer at Shopify (2020 - Present)\n"
        "Architected cross-platform mobile apps in Flutter and React Native with Redux and Firebase.\n"
        "Frontend Developer at Creative Software (2018 - 2020)\n"
        "Education:\n"
        "Bachelor of Science in Computer Science from University of Waterloo\n"
        "Technologies: Flutter, React Native, Dart, Swift, Kotlin, React, Vue.js, Figma, Redux",
        [
            ("Emily Zhang", "NAME"),
            ("Mobile & UI/UX Specialist", "DESIGNATION"),
            ("Senior Mobile Application Developer", "DESIGNATION"),
            ("Shopify", "COMPANY"),
            ("Flutter", "SKILLS"),
            ("React Native", "SKILLS"),
            ("Redux", "SKILLS"),
            ("Firebase", "SKILLS"),
            ("Frontend Developer", "DESIGNATION"),
            ("Creative Software", "COMPANY"),
            ("Bachelor of Science in Computer Science", "DEGREE"),
            ("University of Waterloo", "COLLEGE"),
            ("Dart", "SKILLS"),
            ("Swift", "SKILLS"),
            ("Kotlin", "SKILLS"),
            ("Vue.js", "SKILLS"),
            ("Figma", "SKILLS"),
        ]
    ),

    # 5. Backend & Cloud Engineer Sample
    (
        "Naveen Bandara\nPrincipal Backend Architect\n"
        "Experience:\n"
        "Principal Architect at Dialog Axiata (2022 - Present)\n"
        "Designed high-throughput microservices handling 50k RPS using Go, Kafka, and Redis.\n"
        "Senior Backend Developer at 99x (2017 - 2022)\n"
        "Implemented secure RESTful and gRPC APIs in Java, Spring Boot, and PostgreSQL.\n"
        "Education:\n"
        "BSc in Software Engineering from SLIIT\n"
        "Skills: Go, Java, Spring Boot, Kafka, Redis, PostgreSQL, gRPC, Microservices, Kubernetes",
        [
            ("Naveen Bandara", "NAME"),
            ("Principal Backend Architect", "DESIGNATION"),
            ("Principal Architect", "DESIGNATION"),
            ("Dialog Axiata", "COMPANY"),
            ("Go", "SKILLS"),
            ("Kafka", "SKILLS"),
            ("Redis", "SKILLS"),
            ("Senior Backend Developer", "DESIGNATION"),
            ("99x", "COMPANY"),
            ("Java", "SKILLS"),
            ("Spring Boot", "SKILLS"),
            ("PostgreSQL", "SKILLS"),
            ("BSc in Software Engineering", "DEGREE"),
            ("SLIIT", "COLLEGE"),
            ("gRPC", "SKILLS"),
            ("Microservices", "SKILLS"),
            ("Kubernetes", "SKILLS"),
        ]
    ),

    # 6. QA Automation Engineer Sample
    (
        "Rachel Green\nLead QA Automation Engineer\nLondon, UK\n"
        "Work History:\n"
        "Lead Quality Assurance Engineer at Deloitte (2021 - Present)\n"
        "Spearheaded automated testing strategies with Cypress, Selenium, and Playwright.\n"
        "QA Automation Engineer at MilleniumIT ESP (2018 - 2021)\n"
        "Education:\n"
        "BEng in Computer Engineering from Imperial College London\n"
        "Core Skills: Cypress, Selenium, Playwright, Jest, PyTest, CI/CD, JIRA, Postman",
        [
            ("Rachel Green", "NAME"),
            ("Lead QA Automation Engineer", "DESIGNATION"),
            ("Lead Quality Assurance Engineer", "DESIGNATION"),
            ("Deloitte", "COMPANY"),
            ("Cypress", "SKILLS"),
            ("Selenium", "SKILLS"),
            ("Playwright", "SKILLS"),
            ("QA Automation Engineer", "DESIGNATION"),
            ("MilleniumIT ESP", "COMPANY"),
            ("BEng in Computer Engineering", "DEGREE"),
            ("Imperial College London", "COLLEGE"),
            ("Jest", "SKILLS"),
            ("PyTest", "SKILLS"),
            ("Postman", "SKILLS"),
        ]
    ),

    # 7. Cloud & Cybersecurity Specialist
    (
        "Michael O'Connor\nCloud Security Architect\n"
        "Experience:\n"
        "Senior Security Consultant at Amazon Web Services (2019 - Present)\n"
        "Hardened multi-tenant AWS cloud architectures against zero-day threats.\n"
        "Information Security Analyst at Pearson (2016 - 2019)\n"
        "Education:\n"
        "M.S. in Cybersecurity from Georgia Tech\n"
        "B.S. in Computer Science from University of Colombo\n"
        "Skills: AWS, Azure, GCP, Cloud Security, SIEM, Penetration Testing, Python, Linux",
        [
            ("Michael O'Connor", "NAME"),
            ("Cloud Security Architect", "DESIGNATION"),
            ("Senior Security Consultant", "DESIGNATION"),
            ("Amazon Web Services", "COMPANY"),
            ("AWS", "SKILLS"),
            ("Information Security Analyst", "DESIGNATION"),
            ("Pearson", "COMPANY"),
            ("M.S. in Cybersecurity", "DEGREE"),
            ("Georgia Tech", "COLLEGE"),
            ("B.S. in Computer Science", "DEGREE"),
            ("University of Colombo", "COLLEGE"),
            ("Azure", "SKILLS"),
            ("GCP", "SKILLS"),
            ("Penetration Testing", "SKILLS"),
            ("Python", "SKILLS"),
            ("Linux", "SKILLS"),
        ]
    ),

    # 8. Product Manager & Agile Lead
    (
        "Dinuka Jayasinghe\nTechnical Product Manager\n"
        "Experience:\n"
        "Technical Product Manager at MillenniumIT (2020 - Present)\n"
        "Led product roadmap for financial trading platforms in an Agile Scrum environment.\n"
        "Business Analyst at IFS (2017 - 2020)\n"
        "Education:\n"
        "MBA from Harvard Business School\n"
        "BSc in Computer Science from University of Westminster\n"
        "Expertise: Product Management, Agile, Scrum, JIRA, SQL, Roadmapping, Figma",
        [
            ("Dinuka Jayasinghe", "NAME"),
            ("Technical Product Manager", "DESIGNATION"),
            ("MillenniumIT", "COMPANY"),
            ("Agile", "SKILLS"),
            ("Scrum", "SKILLS"),
            ("Business Analyst", "DESIGNATION"),
            ("IFS", "COMPANY"),
            ("MBA", "DEGREE"),
            ("Harvard Business School", "COLLEGE"),
            ("BSc in Computer Science", "DEGREE"),
            ("University of Westminster", "COLLEGE"),
            ("Product Management", "SKILLS"),
            ("JIRA", "SKILLS"),
            ("SQL", "SKILLS"),
            ("Figma", "SKILLS"),
        ]
    ),

    # 9. Education-focused Sample with University of Moratuwa & SLIIT
    (
        "Harsha Wickramasinghe\nSoftware Engineer\n"
        "Education:\n"
        "B.Sc. in Computer Science & Engineering from University of Moratuwa (2018 - 2022)\n"
        "Higher Diploma in Information Technology from SLIIT (2016 - 2018)\n"
        "Experience:\n"
        "Associate Software Engineer at Virtusa (2022 - Present)\n"
        "Skills: Java, Spring Boot, React, MySQL, Git",
        [
            ("Harsha Wickramasinghe", "NAME"),
            ("Software Engineer", "DESIGNATION"),
            ("B.Sc. in Computer Science & Engineering", "DEGREE"),
            ("University of Moratuwa", "COLLEGE"),
            ("Higher Diploma in Information Technology", "DEGREE"),
            ("SLIIT", "COLLEGE"),
            ("Associate Software Engineer", "DESIGNATION"),
            ("Virtusa", "COMPANY"),
            ("Java", "SKILLS"),
            ("Spring Boot", "SKILLS"),
            ("React", "SKILLS"),
            ("MySQL", "SKILLS"),
            ("Git", "SKILLS"),
        ]
    ),

    # 10. Education-focused Sample with University of Colombo & IIT
    (
        "Anuki Fernando\nData Analyst\n"
        "Education:\n"
        "Bachelor of Science in Statistics from University of Colombo (2019 - 2023)\n"
        "Diploma in Data Science from Informatics Institute of Technology\n"
        "Experience:\n"
        "Junior Data Analyst at London Stock Exchange Group (2023 - Present)\n"
        "Skills: Python, R, Tableau, Power BI, SQL, Excel",
        [
            ("Anuki Fernando", "NAME"),
            ("Data Analyst", "DESIGNATION"),
            ("Bachelor of Science in Statistics", "DEGREE"),
            ("University of Colombo", "COLLEGE"),
            ("Diploma in Data Science", "DEGREE"),
            ("Informatics Institute of Technology", "COLLEGE"),
            ("Junior Data Analyst", "DESIGNATION"),
            ("London Stock Exchange Group", "COMPANY"),
            ("Python", "SKILLS"),
            ("R", "SKILLS"),
            ("Tableau", "SKILLS"),
            ("Power BI", "SKILLS"),
            ("SQL", "SKILLS"),
            ("Excel", "SKILLS"),
        ]
    ),

    # 11. International Graduate Sample (Oxford / Cambridge)
    (
        "Marcus Sterling\nPrincipal AI Researcher\n"
        "Academic Background:\n"
        "Master of Science in Advanced Computing from University of Oxford (2017 - 2019)\n"
        "BA in Mathematics from University of Cambridge (2014 - 2017)\n"
        "Employment History:\n"
        "Research Scientist at DeepMind (2019 - Present)\n"
        "Skills: Deep Learning, PyTorch, JAX, Reinforcement Learning, Python, C++",
        [
            ("Marcus Sterling", "NAME"),
            ("Principal AI Researcher", "DESIGNATION"),
            ("Master of Science in Advanced Computing", "DEGREE"),
            ("University of Oxford", "COLLEGE"),
            ("BA in Mathematics", "DEGREE"),
            ("University of Cambridge", "COLLEGE"),
            ("Research Scientist", "DESIGNATION"),
            ("DeepMind", "COMPANY"),
            ("Deep Learning", "SKILLS"),
            ("PyTorch", "SKILLS"),
            ("JAX", "SKILLS"),
            ("Python", "SKILLS"),
            ("C++", "SKILLS"),
        ]
    ),

    # 12. Full Stack Engineer at Calcey Technologies
    (
        "Tharindu Senanayake\nSenior Web Developer\n"
        "Experience:\n"
        "Senior Web Developer at Calcey Technologies (2021 - Present)\n"
        "Developed enterprise SaaS platforms with Next.js, Node.js, and MongoDB.\n"
        "Web Developer at Rootcode Labs (2019 - 2021)\n"
        "Education:\n"
        "Bachelor of Information Technology from University of Colombo School of Computing\n"
        "Skills: Next.js, React, Node.js, Express, MongoDB, Tailwind CSS, Docker",
        [
            ("Tharindu Senanayake", "NAME"),
            ("Senior Web Developer", "DESIGNATION"),
            ("Calcey Technologies", "COMPANY"),
            ("Next.js", "SKILLS"),
            ("Node.js", "SKILLS"),
            ("MongoDB", "SKILLS"),
            ("Web Developer", "DESIGNATION"),
            ("Rootcode Labs", "COMPANY"),
            ("Bachelor of Information Technology", "DEGREE"),
            ("University of Colombo School of Computing", "COLLEGE"),
            ("React", "SKILLS"),
            ("Express", "SKILLS"),
            ("Tailwind CSS", "SKILLS"),
            ("Docker", "SKILLS"),
        ]
    ),

    # 13. Focused Phrase & Section-Level Training Samples
    ("Sarah Jenkins - Lead Full Stack Architect at Virtusa", [
        ("Sarah Jenkins", "NAME"),
        ("Lead Full Stack Architect", "DESIGNATION"),
        ("Virtusa", "COMPANY"),
    ]),
    ("David Chen, Senior Machine Learning Engineer at Google", [
        ("David Chen", "NAME"),
        ("Senior Machine Learning Engineer", "DESIGNATION"),
        ("Google", "COMPANY"),
    ]),
    ("Kasun Perera - Lead DevOps Engineer at WSO2", [
        ("Kasun Perera", "NAME"),
        ("Lead DevOps Engineer", "DESIGNATION"),
        ("WSO2", "COMPANY"),
    ]),
    ("Harsha Wickramasinghe | Senior Software Engineer at Sysco LABS", [
        ("Harsha Wickramasinghe", "NAME"),
        ("Senior Software Engineer", "DESIGNATION"),
        ("Sysco LABS", "COMPANY"),
    ]),
    ("Tharindu Senanayake - Full Stack Developer at Creative Software", [
        ("Tharindu Senanayake", "NAME"),
        ("Full Stack Developer", "DESIGNATION"),
        ("Creative Software", "COMPANY"),
    ]),
    ("Michael O'Connor, Cloud Security Architect at Amazon Web Services", [
        ("Michael O'Connor", "NAME"),
        ("Cloud Security Architect", "DESIGNATION"),
        ("Amazon Web Services", "COMPANY"),
    ]),
    ("Rachel Green - Lead QA Automation Engineer at Deloitte", [
        ("Rachel Green", "NAME"),
        ("Lead QA Automation Engineer", "DESIGNATION"),
        ("Deloitte", "COMPANY"),
    ]),
    ("Naveen Bandara - Principal Backend Architect at Dialog Axiata", [
        ("Naveen Bandara", "NAME"),
        ("Principal Backend Architect", "DESIGNATION"),
        ("Dialog Axiata", "COMPANY"),
    ]),
    ("Dinuka Jayasinghe - Technical Product Manager at MillenniumIT", [
        ("Dinuka Jayasinghe", "NAME"),
        ("Technical Product Manager", "DESIGNATION"),
        ("MillenniumIT", "COMPANY"),
    ]),
    ("Senior Software Engineer at TechFlow Solutions (2021 - Present)", [
        ("Senior Software Engineer", "DESIGNATION"),
        ("TechFlow Solutions", "COMPANY"),
    ]),
    ("Lead DevOps Engineer at Virtusa (Feb 2020 - Present)", [
        ("Lead DevOps Engineer", "DESIGNATION"),
        ("Virtusa", "COMPANY"),
    ]),
    ("Associate Software Engineer at Sysco LABS (2018 - 2020)", [
        ("Associate Software Engineer", "DESIGNATION"),
        ("Sysco LABS", "COMPANY"),
    ]),
    ("Senior Backend Developer at 99x (2019 - 2022)", [
        ("Senior Backend Developer", "DESIGNATION"),
        ("99x", "COMPANY"),
    ]),
    ("Web Developer at Rootcode Labs (2020 - 2023)", [
        ("Web Developer", "DESIGNATION"),
        ("Rootcode Labs", "COMPANY"),
    ]),
    ("Master of Computer Science from Stanford University", [
        ("Master of Computer Science", "DEGREE"),
        ("Stanford University", "COLLEGE"),
    ]),
    ("B.Sc. in Computer Science & Engineering from University of Moratuwa", [
        ("B.Sc. in Computer Science & Engineering", "DEGREE"),
        ("University of Moratuwa", "COLLEGE"),
    ]),
    ("Bachelor of Science in Information Technology from SLIIT", [
        ("Bachelor of Science in Information Technology", "DEGREE"),
        ("SLIIT", "COLLEGE"),
    ]),
    ("BSc in Software Engineering from University of Colombo", [
        ("BSc in Software Engineering", "DEGREE"),
        ("University of Colombo", "COLLEGE"),
    ]),
    ("Master of Science in Artificial Intelligence from MIT", [
        ("Master of Science in Artificial Intelligence", "DEGREE"),
        ("MIT", "COLLEGE"),
    ]),
    ("BEng in Computer Engineering from Imperial College London", [
        ("BEng in Computer Engineering", "DEGREE"),
        ("Imperial College London", "COLLEGE"),
    ]),
    ("Diploma in Information Technology from Informatics Institute of Technology", [
        ("Diploma in Information Technology", "DEGREE"),
        ("Informatics Institute of Technology", "COLLEGE"),
    ]),
    ("Bachelor of Science in Computer Science from University of Waterloo", [
        ("Bachelor of Science in Computer Science", "DEGREE"),
        ("University of Waterloo", "COLLEGE"),
    ]),
    ("MBA from Harvard Business School", [
        ("MBA", "DEGREE"),
        ("Harvard Business School", "COLLEGE"),
    ]),
    ("Skills: React, TypeScript, Node.js, Python, Docker, AWS, PostgreSQL", [
        ("React", "SKILLS"),
        ("TypeScript", "SKILLS"),
        ("Node.js", "SKILLS"),
        ("Python", "SKILLS"),
        ("Docker", "SKILLS"),
        ("AWS", "SKILLS"),
        ("PostgreSQL", "SKILLS"),
    ]),
    ("Technical Skills: Kubernetes, Terraform, Go, Java, Spring Boot, Kafka, Redis", [
        ("Kubernetes", "SKILLS"),
        ("Terraform", "SKILLS"),
        ("Go", "SKILLS"),
        ("Java", "SKILLS"),
        ("Spring Boot", "SKILLS"),
        ("Kafka", "SKILLS"),
        ("Redis", "SKILLS"),
    ]),
    ("Technologies: Flutter, React Native, Dart, Swift, Kotlin, Figma, GraphQL", [
        ("Flutter", "SKILLS"),
        ("React Native", "SKILLS"),
        ("Dart", "SKILLS"),
        ("Swift", "SKILLS"),
        ("Kotlin", "SKILLS"),
        ("Figma", "SKILLS"),
        ("GraphQL", "SKILLS"),
    ])
]

def get_training_data() -> List[Tuple[str, Dict[str, Any]]]:
    """Compiles all raw training samples into spaCy training format."""
    dataset = []
    for text, annotations in RAW_TRAINING_SAMPLES:
        example = create_example(text, annotations)
        dataset.append(example)
    return dataset
