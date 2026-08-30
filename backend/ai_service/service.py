"""
High-level AI service functions for SkillBridge.
Uses Gemini API when available, falls back to realistic mock data for development.
"""

import logging
import os
from .client import call_gemini_json
from .prompts import (
    resume_analysis_prompt, skill_gap_prompt, learning_roadmap_prompt,
    job_recommendations_prompt, interview_questions_prompt, evaluate_answer_prompt
)

logger = logging.getLogger(__name__)


def _extract_text_from_file(resume):
    """Extract text from a PDF or DOCX resume file."""
    file_path = resume.file.path
    text = ""
    
    if resume.file_type == 'pdf':
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise ValueError(f"Failed to read PDF: {e}")
    
    elif resume.file_type == 'docx':
        try:
            from docx import Document
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            raise ValueError(f"Failed to read DOCX: {e}")
    
    if not text.strip():
        raise ValueError("Could not extract any text from the resume file.")
    
    return text.strip()


def analyze_resume(resume):
    """Analyze a resume and return structured analysis data."""
    text = _extract_text_from_file(resume)
    
    prompt = resume_analysis_prompt(text)
    # Always force refresh to guarantee fresh real-time dynamic score computation
    result = call_gemini_json(prompt, force_refresh=True)
    
    if result is None:
        # Return mock data for development fallback
        result = _mock_resume_analysis(text)
    
    content_score = min(100, max(0, int(result.get('content_score', 50))))
    format_score = min(100, max(0, int(result.get('format_score', 50))))
    impact_score = min(100, max(0, int(result.get('impact_score', 50))))
    
    # Calculate weighted overall score dynamically
    calculated_overall = round((content_score * 0.40) + (format_score * 0.30) + (impact_score * 0.30))
    overall_score = min(100, max(0, int(result.get('overall_score', calculated_overall))))
    
    # If the text is extremely short or lacks skills, ensure realistic score dampening
    if len(text.split()) < 30 and overall_score > 30:
        overall_score = min(overall_score, 25)
        content_score = min(content_score, 20)
        impact_score = min(impact_score, 15)

    return {
        'raw_text': text,
        'extracted_skills': result.get('extracted_skills', []),
        'experience_summary': result.get('experience_summary', ''),
        'education_summary': result.get('education_summary', ''),
        'overall_score': overall_score,
        'content_score': content_score,
        'format_score': format_score,
        'impact_score': impact_score,
        'strengths': result.get('strengths', []),
        'improvements': result.get('improvements', []),
    }


from .validators import is_valid_job_role_title


def analyze_skill_gap(user_skills, target_role):
    """Analyze skill gap between user skills and target role."""
    # Validate target role title
    is_valid, validation_msg = is_valid_job_role_title(target_role.title)
    if not is_valid:
        raise ValueError(validation_msg)

    role_requirements = list(
        target_role.requirements.values_list('skill__name', flat=True)
    )
    
    prompt = skill_gap_prompt(
        user_skills, target_role.title,
        target_role.description, role_requirements
    )
    result = call_gemini_json(prompt)
    
    # Check if Gemini flagged the role as invalid gibberish
    if isinstance(result, dict) and result.get('is_valid_role') is False:
        raise ValueError(result.get('error_message', f"'{target_role.title}' is not a recognized professional role."))
    
    if result is None:
        result = _mock_skill_gap(user_skills, target_role)
    
    return {
        'matched_skills': result.get('matched_skills', []),
        'missing_skills': result.get('missing_skills', []),
        'match_percentage': min(100, max(0, result.get('match_percentage', 50))),
        'recommendations': result.get('recommendations', []),
    }


def generate_learning_roadmap(user_skills, target_role):
    """Generate a personalized learning roadmap."""
    is_valid, validation_msg = is_valid_job_role_title(target_role.title)
    if not is_valid:
        raise ValueError(validation_msg)

    # Get missing skills from latest gap analysis
    from skills.models import SkillGapAnalysis
    latest_gap = SkillGapAnalysis.objects.filter(
        target_role=target_role
    ).order_by('-analyzed_at').first()
    
    missing_skills = []
    if latest_gap:
        missing_skills = [
            s.get('name', s) if isinstance(s, dict) else s
            for s in latest_gap.missing_skills
        ]
    
    prompt = learning_roadmap_prompt(user_skills, target_role.title, missing_skills)
    result = call_gemini_json(prompt)
    
    if isinstance(result, dict) and result.get('is_valid_role') is False:
        raise ValueError(result.get('error_message', f"'{target_role.title}' is not a recognized professional role."))
    
    if result is None:
        result = _mock_learning_roadmap(target_role.title, missing_skills)
    
    return result


def generate_job_recommendations(user_skills, target_role=None, filters=None):
    """Generate AI-powered job recommendations matching user skills and filters."""
    role_title = target_role.title if target_role else (filters.get('role') if filters else None)
    
    prompt = job_recommendations_prompt(user_skills, role_title, filters=filters)
    result = call_gemini_json(prompt, force_refresh=True)
    
    if result is None:
        result = _mock_job_recommendations(user_skills, role_title)
    
    return result


def generate_interview_questions(user_skills, target_role, session_type, num_questions):
    """Generate interview questions based on user profile."""
    role_title = target_role.title if target_role else "Software Developer"
    
    prompt = interview_questions_prompt(
        user_skills, role_title, session_type, num_questions
    )
    result = call_gemini_json(prompt)
    
    if result is None:
        result = _mock_interview_questions(session_type, num_questions)
    
    return result


def evaluate_interview_answer(question, user_answer):
    """Evaluate an interview answer and provide feedback."""
    prompt = evaluate_answer_prompt(
        question.question_text, question.expected_points, user_answer
    )
    result = call_gemini_json(prompt)
    
    if result is None:
        result = _mock_answer_evaluation(user_answer)
    
    return result


# ============== Mock Data for Development ==============

def _mock_resume_analysis(text):
    """Return mock resume analysis when API is unavailable."""
    # Simple skill extraction from text
    common_skills = [
        'Python', 'JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'SQL',
        'Git', 'Docker', 'AWS', 'TypeScript', 'Java', 'C++', 'Django',
        'Flask', 'MongoDB', 'PostgreSQL', 'REST API', 'GraphQL', 'Linux',
        'Machine Learning', 'Data Analysis', 'Agile', 'Scrum', 'CI/CD',
    ]
    
    found_skills = [s for s in common_skills if s.lower() in text.lower()]
    if not found_skills:
        found_skills = ['Problem Solving', 'Communication', 'Teamwork']
    
    return {
        'extracted_skills': found_skills,
        'experience_summary': 'Experience details extracted from resume. Configure GEMINI_API_KEY for detailed AI analysis.',
        'education_summary': 'Education details extracted from resume. Configure GEMINI_API_KEY for detailed AI analysis.',
        'overall_score': 72,
        'content_score': 75,
        'format_score': 68,
        'impact_score': 70,
        'strengths': [
            'Clear presentation of technical skills',
            'Good project descriptions',
            'Relevant experience highlighted',
        ],
        'improvements': [
            'Add more quantified achievements (numbers, percentages)',
            'Include a professional summary section',
            'Tailor resume keywords to target role',
            'Add links to portfolio/GitHub projects',
        ],
    }


def _mock_skill_gap(user_skills, target_role):
    """Return mock skill gap analysis."""
    matched = [{'name': s, 'proficiency': 'intermediate', 'relevance': 'high'} for s in user_skills[:5]]
    missing = [
        {'name': 'System Design', 'importance': 'critical', 'difficulty_to_learn': 'hard', 'estimated_weeks': 8},
        {'name': 'Cloud Architecture', 'importance': 'important', 'difficulty_to_learn': 'medium', 'estimated_weeks': 6},
        {'name': 'Leadership', 'importance': 'nice_to_have', 'difficulty_to_learn': 'medium', 'estimated_weeks': 4},
    ]
    
    match_pct = min(85, len(user_skills) * 10) if user_skills else 30
    
    return {
        'matched_skills': matched,
        'missing_skills': missing,
        'match_percentage': match_pct,
        'recommendations': [
            f'Focus on learning the critical skills required for {target_role.title}',
            'Build portfolio projects demonstrating missing skills',
            'Consider online certifications in key areas',
            'Join communities and contribute to open-source projects',
        ],
    }


def _mock_learning_roadmap(role_title, missing_skills):
    """Return mock learning roadmap."""
    return {
        'title': f'Your Path to {role_title}',
        'description': f'A structured learning plan to help you become a {role_title}. Configure GEMINI_API_KEY for personalized AI-generated roadmaps.',
        'estimated_weeks': 12,
        'milestones': [
            {
                'title': 'Phase 1: Core Foundations',
                'description': 'Build a strong foundation in the essential skills.',
                'estimated_hours': 40,
                'resources': [
                    {
                        'title': 'CS50: Introduction to Computer Science',
                        'description': 'Harvard\'s renowned intro CS course covering fundamentals.',
                        'url': 'https://cs50.harvard.edu/',
                        'resource_type': 'course',
                        'provider': 'Harvard/edX',
                        'skill_name': missing_skills[0] if missing_skills else 'Computer Science',
                        'difficulty': 'beginner',
                        'estimated_hours': 20,
                        'is_free': True,
                        'rating': 4.8,
                    },
                    {
                        'title': 'The Odin Project',
                        'description': 'Full-stack web development curriculum with hands-on projects.',
                        'url': 'https://www.theodinproject.com/',
                        'resource_type': 'tutorial',
                        'provider': 'The Odin Project',
                        'skill_name': 'Web Development',
                        'difficulty': 'beginner',
                        'estimated_hours': 20,
                        'is_free': True,
                        'rating': 4.7,
                    },
                ],
            },
            {
                'title': 'Phase 2: Intermediate Skills',
                'description': 'Deepen your knowledge and build real projects.',
                'estimated_hours': 50,
                'resources': [
                    {
                        'title': 'Full Stack Open',
                        'description': 'Modern web development with React, Node.js, and MongoDB.',
                        'url': 'https://fullstackopen.com/',
                        'resource_type': 'course',
                        'provider': 'University of Helsinki',
                        'skill_name': 'React',
                        'difficulty': 'intermediate',
                        'estimated_hours': 25,
                        'is_free': True,
                        'rating': 4.6,
                    },
                    {
                        'title': 'System Design Primer',
                        'description': 'Learn how to design large-scale systems.',
                        'url': 'https://github.com/donnemartin/system-design-primer',
                        'resource_type': 'tutorial',
                        'provider': 'GitHub',
                        'skill_name': 'System Design',
                        'difficulty': 'intermediate',
                        'estimated_hours': 25,
                        'is_free': True,
                        'rating': 4.9,
                    },
                ],
            },
            {
                'title': 'Phase 3: Advanced & Portfolio',
                'description': 'Master advanced concepts and build your portfolio.',
                'estimated_hours': 60,
                'resources': [
                    {
                        'title': 'Build a Production-Ready Project',
                        'description': 'Apply everything you\'ve learned in a full-scale project.',
                        'url': '',
                        'resource_type': 'project',
                        'provider': 'Self-directed',
                        'skill_name': role_title,
                        'difficulty': 'advanced',
                        'estimated_hours': 40,
                        'is_free': True,
                        'rating': 5.0,
                    },
                    {
                        'title': 'Technical Interview Preparation',
                        'description': 'Practice with LeetCode, mock interviews, and behavioral prep.',
                        'url': 'https://leetcode.com/',
                        'resource_type': 'tutorial',
                        'provider': 'LeetCode',
                        'skill_name': 'Problem Solving',
                        'difficulty': 'advanced',
                        'estimated_hours': 20,
                        'is_free': True,
                        'rating': 4.5,
                    },
                ],
            },
        ],
    }


def _mock_job_recommendations(user_skills, role_title):
    """Return mock job recommendations."""
    title = role_title or 'Software Developer'
    return [
        {
            'title': f'Junior {title}',
            'company': 'TechStart Inc.',
            'location': 'Remote',
            'job_type': 'full_time',
            'description': f'Entry-level {title} position. Great for building experience.',
            'requirements': user_skills[:3] if user_skills else ['Python', 'Git'],
            'salary_min': 60000,
            'salary_max': 80000,
            'match_score': 85,
            'matching_skills': user_skills[:4] if user_skills else ['Python'],
            'missing_skills': ['AWS'],
        },
        {
            'title': title,
            'company': 'InnovateTech Corp.',
            'location': 'San Francisco, CA',
            'job_type': 'full_time',
            'description': f'Mid-level {title} role in a fast-paced startup environment.',
            'requirements': user_skills[:5] if user_skills else ['JavaScript', 'React'],
            'salary_min': 90000,
            'salary_max': 130000,
            'match_score': 72,
            'matching_skills': user_skills[:3] if user_skills else ['JavaScript'],
            'missing_skills': ['Kubernetes', 'System Design'],
        },
        {
            'title': f'{title} (Contract)',
            'company': 'Digital Solutions LLC',
            'location': 'New York, NY',
            'job_type': 'contract',
            'description': f'6-month contract {title} position with possibility of extension.',
            'requirements': user_skills[:4] if user_skills else ['HTML', 'CSS', 'JavaScript'],
            'salary_min': 70000,
            'salary_max': 100000,
            'match_score': 78,
            'matching_skills': user_skills[:3] if user_skills else ['HTML', 'CSS'],
            'missing_skills': ['Docker'],
        },
        {
            'title': f'Associate {title}',
            'company': 'CloudFirst Technologies',
            'location': 'Remote',
            'job_type': 'remote',
            'description': f'Remote-first company seeking an associate {title}.',
            'requirements': user_skills[:3] if user_skills else ['Python', 'SQL'],
            'salary_min': 65000,
            'salary_max': 85000,
            'match_score': 88,
            'matching_skills': user_skills[:5] if user_skills else ['Python', 'SQL'],
            'missing_skills': [],
        },
        {
            'title': f'{title} Intern',
            'company': 'FutureLabs AI',
            'location': 'Austin, TX',
            'job_type': 'internship',
            'description': f'Internship opportunity for aspiring {title}s.',
            'requirements': user_skills[:2] if user_skills else ['Programming basics'],
            'salary_min': 40000,
            'salary_max': 55000,
            'match_score': 92,
            'matching_skills': user_skills[:4] if user_skills else ['Programming'],
            'missing_skills': [],
        },
    ]


def _mock_interview_questions(session_type, num_questions):
    """Return mock interview questions."""
    technical_questions = [
        {
            'question': 'Explain the difference between REST and GraphQL APIs. When would you choose one over the other?',
            'type': 'technical',
            'difficulty': 'medium',
            'topic': 'API Design',
            'hints': ['Consider data fetching efficiency', 'Think about over-fetching and under-fetching'],
            'expected_points': ['REST uses endpoints, GraphQL uses queries', 'GraphQL reduces over-fetching', 'REST is simpler for simple CRUD', 'GraphQL has a learning curve but offers flexibility'],
        },
        {
            'question': 'What is the time complexity of z       common sorting algorithms? Describe when you would use each.',
            'type': 'technical',
            'difficulty': 'medium',
            'topic': 'Algorithms',
            'hints': ['Think about best, average, and worst cases', 'Consider space complexity too'],
            'expected_points': ['QuickSort O(n log n) avg', 'MergeSort O(n log n) guaranteed', 'Bubble/Selection O(n²)', 'Space complexity differences'],
        },
        {
            'question': 'How would you design a URL shortening service like bit.ly?',
            'type': 'technical',
            'difficulty': 'hard',
            'topic': 'System Design',
            'hints': ['Consider hashing strategies', 'Think about scalability and database choice'],
            'expected_points': ['Hash function or counter-based ID', 'Database schema design', 'Caching for popular URLs', 'Analytics tracking', 'Handling collisions'],
        },
        {
            'question': 'Explain closures in JavaScript with an example of a practical use case.',
            'type': 'technical',
            'difficulty': 'easy',
            'topic': 'JavaScript',
            'hints': ['Think about lexical scoping', 'Consider data privacy patterns'],
            'expected_points': ['Function retaining access to outer scope', 'Practical use: data encapsulation', 'Module pattern example', 'Event handlers / callbacks'],
        },
        {
            'question': 'What are database indexes and how do they improve query performance? What are the trade-offs?',
            'type': 'technical',
            'difficulty': 'medium',
            'topic': 'Databases',
            'hints': ['Think about B-tree data structures', 'Consider write performance impact'],
            'expected_points': ['Indexes speed up reads', 'B-tree or hash index types', 'Trade-off: slower writes', 'Index on frequently queried columns', 'Composite indexes'],
        },
    ]
    
    behavioral_questions = [
        {
            'question': 'Tell me about a time when you had to deal with a significant technical challenge. How did you approach it?',
            'type': 'behavioral',
            'difficulty': 'medium',
            'topic': 'Problem Solving',
            'hints': ['Use the STAR method', 'Focus on your specific contribution'],
            'expected_points': ['Clear situation description', 'Systematic approach', 'Collaboration if applicable', 'Positive outcome or lesson learned'],
        },
        {
            'question': 'Describe a situation where you disagreed with a team member. How did you handle it?',
            'type': 'behavioral',
            'difficulty': 'medium',
            'topic': 'Teamwork',
            'hints': ['Show emotional intelligence', 'Emphasize compromise and communication'],
            'expected_points': ['Professional approach', 'Active listening', 'Finding common ground', 'Constructive resolution'],
        },
        {
            'question': 'Tell me about a project you\'re most proud of. What made it special?',
            'type': 'behavioral',
            'difficulty': 'easy',
            'topic': 'Achievements',
            'hints': ['Pick a technically challenging project', 'Quantify the impact'],
            'expected_points': ['Clear project description', 'Technical challenges overcome', 'Impact and results', 'Lessons learned'],
        },
        {
            'question': 'How do you stay updated with the latest technology trends? Give specific examples.',
            'type': 'behavioral',
            'difficulty': 'easy',
            'topic': 'Continuous Learning',
            'hints': ['Mention specific resources', 'Show genuine curiosity'],
            'expected_points': ['Specific learning resources', 'Hands-on experimentation', 'Community involvement', 'Applied learning examples'],
        },
        {
            'question': 'Describe a time when you had to work under a tight deadline. How did you prioritize?',
            'type': 'behavioral',
            'difficulty': 'medium',
            'topic': 'Time Management',
            'hints': ['Show prioritization skills', 'Mention communication with stakeholders'],
            'expected_points': ['Clear prioritization strategy', 'Communication with team/stakeholders', 'Quality maintained', 'Deadline met or managed expectations'],
        },
    ]
    
    questions = technical_questions if session_type == 'technical' else behavioral_questions
    if session_type == 'mixed':
        questions = technical_questions[:3] + behavioral_questions[:2]
    
    return questions[:num_questions]


def _mock_answer_evaluation(user_answer):
    """Return mock answer evaluation."""
    word_count = len(user_answer.split())
    
    if word_count < 20:
        score = 35
        feedback = "Your answer is too brief. Try to provide more detail with specific examples and explanations."
        strengths = ["Attempted to answer the question"]
        improvements = [
            "Provide more detailed explanations",
            "Include specific examples from your experience",
            "Structure your answer using the STAR method for behavioral questions",
        ]
    elif word_count < 50:
        score = 55
        feedback = "Decent start, but your answer could benefit from more depth. Try to elaborate on your key points and provide concrete examples."
        strengths = ["Addressed the core question", "Shows basic understanding"]
        improvements = [
            "Add specific examples or code references",
            "Elaborate on trade-offs and edge cases",
            "Include quantifiable results when possible",
        ]
    elif word_count < 150:
        score = 72
        feedback = "Good answer with reasonable depth. You've covered the main points well. To improve, consider adding more specific examples and discussing edge cases or alternative approaches."
        strengths = [
            "Good coverage of key concepts",
            "Well-structured response",
            "Shows practical understanding",
        ]
        improvements = [
            "Could discuss alternative approaches",
            "Add more real-world examples",
            "Consider mentioning edge cases",
        ]
    else:
        score = 85
        feedback = "Excellent, thorough answer! You've demonstrated deep understanding of the topic with good examples and well-structured explanations."
        strengths = [
            "Comprehensive and well-structured",
            "Excellent use of examples",
            "Demonstrates deep understanding",
            "Considers multiple perspectives",
        ]
        improvements = [
            "Could be slightly more concise in some areas",
            "Consider adding a brief summary at the end",
        ]
    
    return {
        'feedback': feedback,
        'score': score,
        'strengths': strengths,
        'improvements': improvements,
    }
