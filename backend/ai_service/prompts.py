"""
Prompt templates for all AI operations in SkillBridge.
"""


def resume_analysis_prompt(resume_text):
    return f"""You are a senior hiring manager and strict ATS (Applicant Tracking System) auditing engine.
Analyze the following resume text with rigorous, objective, granular scoring. Do NOT default to generic scores. Every score must accurately reflect the specific candidate's actual qualifications, metrics, and document structure.

RESUME TEXT:
---
{resume_text}
---

SCORING CRITERIA (0 to 100):
1. content_score (0-100):
   - 90-100: Senior/Lead level. 5+ years or multiple complex full-scale production projects, modern tech stack, relevant accredited degree/certifications.
   - 75-89: Mid-level. 2-4 years or 3 solid projects with clear technologies and domain expertise.
   - 50-74: Junior/Entry-level. 0-2 years, basic internships, university projects, foundational skills.
   - 25-49: Incomplete resume. Very few skills, no project details, or missing work/education history.
   - 0-24: Not a valid resume (e.g. random article, receipt, assignment, or gibberish).

2. format_score (0-100):
   - 90-100: Perfect ATS layout: Clear standard sections (Summary, Technical Skills, Experience, Projects, Education), bullet points, readable contact info.
   - 75-89: Good structure, distinct headings, logical chronology.
   - 50-74: Cluttered structure, missing standard headings, poor section flow.
   - 0-49: Unstructured text blob, missing core sections, or non-resume content.

3. impact_score (0-100):
   - 90-100: Highly impactful. Strong power verbs (Architected, Engineered, Optimized, Scaled) with 4+ specific quantified achievements (e.g. "reduced latency by 45%", "managed $2M budget", "handled 1M daily requests").
   - 70-89: Strong action verbs with 1-3 quantified metrics.
   - 45-69: Task-oriented descriptions ("Responsible for developing...", "Worked on bug fixes") with ZERO quantified numbers or percentages.
   - 0-44: Passive, vague phrases with no measurable accomplishments.

4. overall_score (0-100):
   - Calculate accurately as: round((content_score * 0.40) + (format_score * 0.30) + (impact_score * 0.30))

Respond with ONLY valid JSON (no markdown fences, no explanatory text) matching this schema:
{{
    "extracted_skills": ["Skill1", "Skill2"],
    "experience_summary": "Precise summary of work history and roles found",
    "education_summary": "Precise summary of academic background and degrees",
    "content_score": 0,
    "format_score": 0,
    "impact_score": 0,
    "overall_score": 0,
    "strengths": ["Specific strength with reference to candidate details 1", "Specific strength 2", "Specific strength 3"],
    "improvements": ["Actionable improvement 1", "Actionable improvement 2", "Actionable improvement 3"]
}}"""


def skill_gap_prompt(user_skills, role_title, role_description, role_requirements):
    skills_str = ", ".join(user_skills) if user_skills else "No skills identified yet"
    reqs_str = ", ".join(role_requirements) if role_requirements else "General requirements"
    
    return f"""You are an expert career advisor. Compare the user's skills against the target job role requirements and provide a skill gap analysis.

VALIDATION CHECK:
First, inspect the TARGET ROLE: "{role_title}".
If "{role_title}" is random letters, keyboard smash, gibberish, nonsensical, or NOT a recognizable professional job title/career path (e.g. "lkcns;cklsdj...", "asdfghjk", "xyzabc", etc.), you MUST return ONLY this JSON:
{{
    "is_valid_role": false,
    "error_message": "The entered target role '{role_title}' is not recognized as a legitimate profession or career title. Please specify a valid job title (e.g., 'Full Stack Developer', 'Cloud Architect')."
}}

If the role is valid, proceed with the gap analysis:
USER'S CURRENT SKILLS: {skills_str}
TARGET ROLE: {role_title}
ROLE DESCRIPTION: {role_description}
REQUIRED SKILLS: {reqs_str}

Respond with ONLY valid JSON (no markdown, no explanation) in this exact format:
{{
    "is_valid_role": true,
    "matched_skills": [
        {{"name": "skill_name", "proficiency": "intermediate", "relevance": "high"}}
    ],
    "missing_skills": [
        {{"name": "skill_name", "importance": "critical", "difficulty_to_learn": "medium", "estimated_weeks": 4}}
    ],
    "match_percentage": 65,
    "recommendations": [
        "Specific recommendation 1",
        "Specific recommendation 2"
    ]
}}

Be thorough. Include ALL relevant matched and missing skills. Match percentage should be realistic (0-100). Provide 3-5 actionable recommendations."""


def learning_roadmap_prompt(user_skills, role_title, missing_skills):
    skills_str = ", ".join(user_skills) if user_skills else "No skills yet"
    missing_str = ", ".join(missing_skills) if missing_skills else "General upskilling needed"
    
    return f"""You are an expert learning advisor. Create a personalized learning roadmap for someone transitioning to a {role_title} role.

VALIDATION CHECK:
First, inspect the TARGET ROLE: "{role_title}".
If "{role_title}" is random letters, keyboard smash, gibberish, or NOT a recognized profession or career path, you MUST return ONLY this JSON:
{{
    "is_valid_role": false,
    "error_message": "The entered target role '{role_title}' is not recognized as a legitimate career title."
}}

If the role is valid, create a structured learning roadmap with 4-6 milestones, each containing 2-3 learning resources:
CURRENT SKILLS: {skills_str}
SKILLS TO LEARN: {missing_str}

Respond with ONLY valid JSON (no markdown, no explanation) in this exact format:
{{
    "is_valid_role": true,
    "title": "Your Path to {role_title}",
    "description": "Overview of the learning journey",
    "estimated_weeks": 12,
    "milestones": [
        {{
            "title": "Phase 1: Foundation",
            "description": "What this phase covers",
            "estimated_hours": 30,
            "resources": [
                {{
                    "title": "Resource Name",
                    "description": "What you'll learn",
                    "url": "https://example.com",
                    "resource_type": "course",
                    "provider": "Coursera",
                    "skill_name": "Python",
                    "difficulty": "beginner",
                    "estimated_hours": 10,
                    "is_free": true,
                    "rating": 4.5
                }}
            ]
        }}
    ]
}}

Use real, well-known learning resources (Coursera, Udemy, freeCodeCamp, YouTube, official docs, etc.). Resource types: course, book, tutorial, project, video, article, documentation. Difficulties: beginner, intermediate, advanced."""


def job_recommendations_prompt(user_skills, target_role_title, filters=None):
    filters = filters or {}
    skills_str = ", ".join(user_skills) if user_skills else "Python, JavaScript, React, Node.js, SQL, Git, REST APIs"
    role_str = filters.get('role') or target_role_title or "Full Stack Developer"
    location_str = filters.get('location') or "Kochi, Kerala, India"
    radius_str = filters.get('radius') or "25 km"
    work_mode_str = filters.get('work_mode') or "All"
    exp_str = filters.get('experience_level') or "All Levels"
    salary_str = filters.get('salary_range') or "All"
    
    return f"""You are an elite AI technical recruiter and real-time career intelligence engine.
Search and produce 6 to 8 authentic, highly accurate job openings matching the user's specific role, verified skills, and geographical parameters.

CRITICAL REQUIREMENTS:
1. GEOGRAPHIC ACCURACY: All jobs MUST be located strictly within or around: "{location_str}" (within {radius_str}) or designated as legitimate Remote opportunities if work mode is Remote. DO NOT return jobs from other unrelated countries or unrelated distant states.
2. COMPANY ACCURACY: Use real tech firms, IT enterprises, and digital product agencies with active development centers or offices in "{location_str}" (e.g. for Kochi/Kerala/India: TCS Digital, UST, Zyxware Technologies, IBS Software, Experion Technologies, H&R Block India, Tech Mahindra, Cognizant, Infosys, Wipro, NeoITO, KeyValue Software; for other cities/countries use their respective authentic hiring companies).
3. WORK MODE: Accurately set work_mode as one of: 'On-site', 'Hybrid', 'Remote' matching filter preference ({work_mode_str}).
4. COMPENSATION: Realistic market compensation for this location ({location_str}). For India, format as e.g. "₹6 - ₹10 LPA", "₹8 - ₹14 LPA", "₹12 - ₹18 LPA" in `salary_display`. For US/Europe format as e.g. "$90k - $130k", "$140k - $190k". Provide integer numerical values in `salary_min` and `salary_max`.
5. EXPERIENCE: Provide realistic experience tag in `experience_level` (e.g. '1-3 Yrs Exp', '2-5 Yrs Exp', '3-6 Yrs Exp', '0-1 Yrs Exp', '5+ Yrs Exp').
6. MATCH PERCENTAGE: Calculate mathematically between 75% and 98% based on candidate's verified skills: {skills_str}.
7. SOURCE: Distribute authentically between 'LinkedIn' and 'Indeed'.
8. POSTED TIME: e.g. '1h ago', '2h ago', '3h ago', '5h ago', 'Just now'.

SEARCH PARAMETERS:
- CANDIDATE VERIFIED SKILLS: {skills_str}
- TARGET ROLE / KEYWORDS: {role_str}
- TARGET LOCATION: {location_str} (Radius: {radius_str})
- WORK MODE FILTER: {work_mode_str}
- EXPERIENCE LEVEL: {exp_str}
- SALARY FILTER: {salary_str}

Respond with ONLY valid JSON (no markdown formatting, no code fences, no introductory or trailing text) as an array of 6 to 8 objects:
[
    {{
        "title": "Full Stack Developer",
        "company": "TCS Digital",
        "location": "{location_str}",
        "job_type": "full_time",
        "work_mode": "On-site",
        "experience_level": "2-5 Yrs Exp",
        "salary_display": "₹6 - ₹10 LPA",
        "salary_min": 600000,
        "salary_max": 1000000,
        "source": "LinkedIn",
        "posted_time_text": "2h ago",
        "description": "Design and develop scalable web applications using React, Node.js, and modern databases with high performance.",
        "requirements": ["React", "Node.js", "JavaScript", "MongoDB", "REST APIs", "SQL"],
        "match_score": 95,
        "matching_skills": ["React", "Node.js", "JavaScript", "MongoDB", "REST APIs"],
        "missing_skills": ["Docker", "Redis"],
        "url": "https://www.linkedin.com/jobs/search/?keywords=Full+Stack+Developer+TCS+Digital"
    }}
]"""


def interview_questions_prompt(user_skills, role_title, session_type, num_questions):
    skills_str = ", ".join(user_skills) if user_skills else "General skills"
    role_str = role_title or "Software Developer"
    
    return f"""You are an expert technical interviewer. Generate {num_questions} interview questions for a {role_str} position.

CANDIDATE'S SKILLS: {skills_str}
INTERVIEW TYPE: {session_type}
NUMBER OF QUESTIONS: {num_questions}

Respond with ONLY valid JSON (no markdown, no explanation) as an array:
[
    {{
        "question": "The interview question",
        "type": "{session_type}",
        "difficulty": "medium",
        "topic": "Topic area",
        "hints": ["Hint 1", "Hint 2"],
        "expected_points": ["Key point 1", "Key point 2", "Key point 3"]
    }}
]

For technical interviews, include coding, system design, and problem-solving questions relevant to the candidate's skills.
For behavioral interviews, use STAR method questions.
Difficulties: easy, medium, hard. Mix difficulties appropriately.
Provide 2-3 hints and 3-5 expected key points per question."""


def evaluate_answer_prompt(question_text, expected_points, user_answer):
    points_str = ", ".join(expected_points) if expected_points else "General knowledge"
    
    return f"""You are an expert technical interviewer evaluating a candidate's answer.

QUESTION: {question_text}

EXPECTED KEY POINTS: {points_str}

CANDIDATE'S ANSWER:
---
{user_answer}
---

Evaluate the answer and provide detailed feedback.

Respond with ONLY valid JSON (no markdown, no explanation) in this exact format:
{{
    "feedback": "Detailed constructive feedback paragraph",
    "score": 75,
    "strengths": ["What the candidate did well 1", "What they did well 2"],
    "improvements": ["What could be improved 1", "What could be improved 2"]
}}

Score from 0-100. Be fair and constructive. Provide 2-4 strengths and 2-4 improvements."""
