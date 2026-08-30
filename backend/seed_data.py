import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillbridge.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile
from skills.models import SkillCategory, Skill, JobRole, RoleRequirement, UserSkill
from jobs.models import Job
from roadmap.models import LearningResource

def seed():
    print("Seeding initial SkillBridge data...")

    # 1. Create Superuser / Demo User
    demo_user, created = User.objects.get_or_create(
        username='demouser',
        defaults={
            'email': 'demo@skillbridge.ai',
            'first_name': 'Alex',
            'last_name': 'Morgan'
        }
    )
    if created:
        demo_user.set_password('demo12345')
        demo_user.save()
        print("Created demo user: demouser / demo12345")

    # 2. Categories
    categories = [
        ('Frontend Development', 'code', '#3b82f6'),
        ('Backend Development', 'server', '#10b981'),
        ('AI & Machine Learning', 'cpu', '#8b5cf6'),
        ('DevOps & Cloud', 'cloud', '#06b6d4'),
        ('Database & Storage', 'database', '#f59e0b'),
        ('Software Engineering & Soft Skills', 'users', '#ec4899'),
    ]

    cat_map = {}
    for name, icon, color in categories:
        cat, _ = SkillCategory.objects.get_or_create(name=name, defaults={'icon': icon, 'color': color})
        cat_map[name] = cat

    # 3. Skills
    skills_data = [
        ('React.js', 'Frontend Development', 'intermediate'),
        ('JavaScript (ES6+)', 'Frontend Development', 'intermediate'),
        ('TypeScript', 'Frontend Development', 'intermediate'),
        ('HTML5 & CSS3', 'Frontend Development', 'beginner'),
        ('Next.js', 'Frontend Development', 'advanced'),
        ('Tailwind CSS', 'Frontend Development', 'beginner'),
        ('Python', 'Backend Development', 'intermediate'),
        ('Django & DRF', 'Backend Development', 'intermediate'),
        ('FastAPI', 'Backend Development', 'intermediate'),
        ('Node.js', 'Backend Development', 'intermediate'),
        ('REST API Design', 'Backend Development', 'intermediate'),
        ('PostgreSQL', 'Database & Storage', 'intermediate'),
        ('Redis', 'Database & Storage', 'intermediate'),
        ('MongoDB', 'Database & Storage', 'beginner'),
        ('Docker', 'DevOps & Cloud', 'intermediate'),
        ('Kubernetes', 'DevOps & Cloud', 'advanced'),
        ('AWS (Amazon Web Services)', 'DevOps & Cloud', 'intermediate'),
        ('CI/CD Pipelines (GitHub Actions)', 'DevOps & Cloud', 'intermediate'),
        ('PyTorch', 'AI & Machine Learning', 'advanced'),
        ('TensorFlow', 'AI & Machine Learning', 'advanced'),
        ('Large Language Models (LLMs)', 'AI & Machine Learning', 'intermediate'),
        ('Prompt Engineering', 'AI & Machine Learning', 'beginner'),
        ('Data Analysis & Pandas', 'AI & Machine Learning', 'intermediate'),
        ('System Design & Architecture', 'Software Engineering & Soft Skills', 'advanced'),
        ('Git & Version Control', 'Software Engineering & Soft Skills', 'beginner'),
        ('Agile / Scrum Methodologies', 'Software Engineering & Soft Skills', 'beginner'),
    ]

    skill_map = {}
    for name, cat_name, diff in skills_data:
        skill, _ = Skill.objects.get_or_create(
            name=name,
            defaults={
                'category': cat_map.get(cat_name),
                'difficulty_level': diff,
                'description': f'Core skill in {cat_name}'
            }
        )
        skill_map[name] = skill

    # 4. Job Roles & Requirements
    roles_data = [
        {
            'title': 'Full Stack Developer',
            'industry': 'Software & Technology',
            'experience_level': 'mid',
            'avg_salary_min': 95000,
            'avg_salary_max': 145000,
            'description': 'Builds end-to-end web applications with modern frontend frameworks and robust backend microservices.',
            'reqs': [
                ('React.js', 'critical', 'intermediate'),
                ('JavaScript (ES6+)', 'critical', 'advanced'),
                ('Python', 'important', 'intermediate'),
                ('Django & DRF', 'important', 'intermediate'),
                ('PostgreSQL', 'critical', 'intermediate'),
                ('REST API Design', 'critical', 'intermediate'),
                ('Docker', 'important', 'intermediate'),
                ('Git & Version Control', 'critical', 'intermediate'),
                ('System Design & Architecture', 'nice_to_have', 'intermediate'),
            ]
        },
        {
            'title': 'AI / ML Engineer',
            'industry': 'Artificial Intelligence',
            'experience_level': 'mid',
            'avg_salary_min': 120000,
            'avg_salary_max': 180000,
            'description': 'Develops, tunes, and deploys intelligent models, LLM agents, and data-driven pipelines.',
            'reqs': [
                ('Python', 'critical', 'advanced'),
                ('PyTorch', 'critical', 'advanced'),
                ('Large Language Models (LLMs)', 'critical', 'intermediate'),
                ('Prompt Engineering', 'important', 'intermediate'),
                ('Data Analysis & Pandas', 'important', 'advanced'),
                ('Docker', 'important', 'intermediate'),
                ('REST API Design', 'important', 'intermediate'),
            ]
        },
        {
            'title': 'Frontend Engineer',
            'industry': 'Software & Technology',
            'experience_level': 'mid',
            'avg_salary_min': 90000,
            'avg_salary_max': 135000,
            'description': 'Crafts high-performance, accessible, and delightful interactive user interfaces with React and modern web tech.',
            'reqs': [
                ('React.js', 'critical', 'advanced'),
                ('JavaScript (ES6+)', 'critical', 'advanced'),
                ('TypeScript', 'critical', 'intermediate'),
                ('HTML5 & CSS3', 'critical', 'advanced'),
                ('Next.js', 'important', 'intermediate'),
                ('REST API Design', 'important', 'intermediate'),
            ]
        },
        {
            'title': 'Cloud & DevOps Architect',
            'industry': 'Cloud Infrastructure',
            'experience_level': 'senior',
            'avg_salary_min': 130000,
            'avg_salary_max': 195000,
            'description': 'Automates scalable infrastructure, containers, and deployment reliability across cloud ecosystems.',
            'reqs': [
                ('AWS (Amazon Web Services)', 'critical', 'advanced'),
                ('Docker', 'critical', 'advanced'),
                ('Kubernetes', 'critical', 'advanced'),
                ('CI/CD Pipelines (GitHub Actions)', 'critical', 'advanced'),
                ('System Design & Architecture', 'critical', 'advanced'),
                ('Python', 'important', 'intermediate'),
            ]
        }
    ]

    for r in roles_data:
        role, _ = JobRole.objects.get_or_create(
            title=r['title'],
            defaults={
                'industry': r['industry'],
                'experience_level': r['experience_level'],
                'avg_salary_min': r['avg_salary_min'],
                'avg_salary_max': r['avg_salary_max'],
                'description': r['description']
            }
        )
        for skill_name, imp, prof in r['reqs']:
            if skill_name in skill_map:
                RoleRequirement.objects.get_or_create(
                    role=role,
                    skill=skill_map[skill_name],
                    defaults={'importance': imp, 'proficiency_required': prof}
                )

    # 5. Default profile for demo user
    if hasattr(demo_user, 'profile'):
        profile = demo_user.profile
        profile.bio = "Full-stack developer passionate about building AI-powered web applications and cloud services."
        profile.location = "San Francisco, CA / Remote"
        profile.years_experience = 3
        profile.education_level = "bachelor"
        profile.career_readiness_score = 78.5
        profile.target_role = JobRole.objects.filter(title='Full Stack Developer').first()
        profile.save()

        # Add initial user skills
        initial_user_skills = [
            ('React.js', 'intermediate'),
            ('JavaScript (ES6+)', 'advanced'),
            ('HTML5 & CSS3', 'advanced'),
            ('Python', 'intermediate'),
            ('Django & DRF', 'intermediate'),
            ('REST API Design', 'intermediate'),
            ('Git & Version Control', 'advanced'),
        ]
        for sname, plevel in initial_user_skills:
            if sname in skill_map:
                UserSkill.objects.get_or_create(
                    user=demo_user,
                    skill=skill_map[sname],
                    defaults={'proficiency_level': plevel, 'source': 'resume', 'verified': True}
                )

    # 6. Sample Live Jobs
    jobs_data = [
        {
            'title': 'Senior Full Stack Engineer',
            'company': 'Stripe',
            'location': 'San Francisco, CA (Hybrid)',
            'job_type': 'full_time',
            'salary_min': 140000,
            'salary_max': 185000,
            'description': 'Help build next-generation payment interfaces and developer-facing APIs with React, Python, and distributed backend systems.',
            'requirements': ['React.js', 'Python', 'REST API Design', 'PostgreSQL', 'System Design & Architecture'],
            'url': 'https://stripe.com/jobs'
        },
        {
            'title': 'Full Stack AI Developer',
            'company': 'Anthropic / Scale AI Partner',
            'location': 'Remote (Global)',
            'job_type': 'full_time',
            'salary_min': 130000,
            'salary_max': 175000,
            'description': 'Join our product team to craft interactive AI tools, agentic workflows, and LLM-powered interfaces.',
            'requirements': ['React.js', 'Python', 'Large Language Models (LLMs)', 'Prompt Engineering', 'FastAPI'],
            'url': 'https://example.com/jobs/ai-dev'
        },
        {
            'title': 'Frontend Platform Engineer',
            'company': 'Vercel',
            'location': 'Remote',
            'job_type': 'remote',
            'salary_min': 125000,
            'salary_max': 165000,
            'description': 'Work on cutting edge React and Next.js web experiences, frontend tooling, and developer performance optimization.',
            'requirements': ['React.js', 'TypeScript', 'Next.js', 'HTML5 & CSS3'],
            'url': 'https://vercel.com/careers'
        },
        {
            'title': 'DevOps & Cloud Engineer',
            'company': 'Datadog',
            'location': 'New York, NY',
            'job_type': 'full_time',
            'salary_min': 135000,
            'salary_max': 180000,
            'description': 'Scale infrastructure across multi-cloud deployments with Kubernetes, Terraform, and automated CI/CD.',
            'requirements': ['AWS (Amazon Web Services)', 'Docker', 'Kubernetes', 'CI/CD Pipelines (GitHub Actions)'],
            'url': 'https://datadog.com/careers'
        }
    ]

    for j in jobs_data:
        Job.objects.get_or_create(
            title=j['title'],
            company=j['company'],
            defaults={
                'location': j['location'],
                'job_type': j['job_type'],
                'salary_min': j['salary_min'],
                'salary_max': j['salary_max'],
                'description': j['description'],
                'requirements': j['requirements'],
                'url': j['url'],
            }
        )

    # 7. Learning Resources
    resources_data = [
        {
            'title': 'Full Stack Open - University of Helsinki',
            'description': 'Comprehensive modern full-stack web development course with React, Redux, Node.js, REST and GraphQL.',
            'url': 'https://fullstackopen.com/',
            'resource_type': 'course',
            'provider': 'University of Helsinki',
            'difficulty': 'intermediate',
            'estimated_hours': 60,
            'is_free': True,
            'rating': 4.9,
            'skill': skill_map.get('React.js')
        },
        {
            'title': 'Django for APIs: Build web APIs with Python & Django',
            'description': 'A step-by-step guide to building scalable, production-ready REST APIs with Django REST Framework.',
            'url': 'https://djangoforapis.com/',
            'resource_type': 'book',
            'provider': 'William S. Vincent',
            'difficulty': 'intermediate',
            'estimated_hours': 25,
            'is_free': False,
            'rating': 4.8,
            'skill': skill_map.get('Django & DRF')
        },
        {
            'title': 'System Design Primer by Donne Martin',
            'description': 'Learn how to build large-scale systems, prepare for system design interviews, and understand architectures.',
            'url': 'https://github.com/donnemartin/system-design-primer',
            'resource_type': 'tutorial',
            'provider': 'GitHub Open Source',
            'difficulty': 'advanced',
            'estimated_hours': 40,
            'is_free': True,
            'rating': 4.9,
            'skill': skill_map.get('System Design & Architecture')
        },
        {
            'title': 'Docker & Kubernetes: The Practical Guide',
            'description': 'Master Docker, Docker Compose, Multi-Container setups, and production Kubernetes deployments.',
            'url': 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/',
            'resource_type': 'course',
            'provider': 'Academind',
            'difficulty': 'intermediate',
            'estimated_hours': 35,
            'is_free': False,
            'rating': 4.8,
            'skill': skill_map.get('Docker')
        }
    ]

    for res in resources_data:
        LearningResource.objects.get_or_create(
            title=res['title'],
            defaults={
                'description': res['description'],
                'url': res['url'],
                'resource_type': res['resource_type'],
                'provider': res['provider'],
                'difficulty': res['difficulty'],
                'estimated_hours': res['estimated_hours'],
                'is_free': res['is_free'],
                'rating': res['rating'],
                'skill': res['skill']
            }
        )

    print("[SUCCESS] Seed data populated successfully!")

if __name__ == '__main__':
    seed()
