"""
Validation utilities for AI inputs and custom job roles in SkillBridge.
Prevents processing of gibberish, random keyboard smash, and nonsensical input.
"""

import re


KNOWN_TECH_TERMS = {
    # Tech acronyms & short words
    'ai', 'ml', 'nlp', 'llm', 'rag', 'genai', 'cv', 'dl', 'rl',
    'dev', 'sr', 'jr', 'lead', 'staff', 'mgr', 'pm', 'po',
    'sre', 'devops', 'secops', 'devsecops', 'qa', 'sdet', 'ui', 'ux',
    'db', 'dba', 'sql', 'nosql', 'rdbms', 'orm',
    'aws', 'gcp', 'oci', 'k8s', 'sdk', 'api', 'rest', 'grpc', 'graphql',
    'cto', 'cio', 'cso', 'cpo', 'ceo', 'vp', 'dir',
    'net', 'cpp', 'php', 'js', 'ts', 'go', 'rs', 'py',
    'iot', 'ar', 'vr', 'xr', 'gis', 'etl', 'bi', 'ci', 'cd',
    'cryptography', 'cybersecurity', 'sysadmin', 'python', 'ruby', 'crypto', 'dynamic', 'cyber'
}

KEYBOARD_SMASH_PATTERNS = [
    'asdf', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'jkl;',
    'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop',
    'zxcv', 'xcvb', 'cvbn', 'vbnm',
]


def is_valid_job_role_title(title: str) -> tuple[bool, str]:
    """
    Validate whether a custom role title is a plausible career / job title
    rather than random characters, keyboard smash, or nonsensical gibberish.
    
    Returns (is_valid: bool, error_message: str)
    """
    if not title or not isinstance(title, str):
        return False, "Target role title cannot be empty."
    
    cleaned = title.strip()
    if len(cleaned) < 3:
        return False, "Target role title is too short (minimum 3 characters)."
    
    if len(cleaned) > 80:
        return False, "Target role title is too long (maximum 80 characters)."
    
    # Reject strings with suspicious punctuation commonly found in random smash
    if re.search(r'[;<>{}|\\`~^=$%*!@_]', cleaned):
        return False, "Please enter a valid job title without special punctuation or symbols."
    
    # Check for obvious keyboard sequential smash patterns
    lower_cleaned = cleaned.lower()
    for pat in KEYBOARD_SMASH_PATTERNS:
        if pat in lower_cleaned and lower_cleaned not in KNOWN_TECH_TERMS:
            return False, f"'{title}' contains keyboard smash patterns."
            
    # Extract words
    words = re.findall(r'[A-Za-z0-9+#\.\-]+', cleaned)
    if not words:
        return False, "Job role must contain standard alphabetical words."
    
    standard_vowels = set('aeiouAEIOU')
    
    for word in words:
        alpha_only = re.sub(r'[^A-Za-z]', '', word).lower()
        if not alpha_only:
            continue
            
        # Check single word length
        if len(alpha_only) > 22:
            return False, f"'{word}' is not recognized as a real word or job title."
            
        if alpha_only in KNOWN_TECH_TERMS:
            continue
            
        # For words 4+ chars, check vowel ratio
        vowel_count = sum(1 for c in alpha_only if c in 'aeiouy')
        if len(alpha_only) >= 4 and vowel_count == 0:
            return False, f"'{word}' does not have standard word structure."
            
        if len(alpha_only) >= 6 and (vowel_count / len(alpha_only)) < 0.18:
            return False, f"'{word}' has an unnatural letter distribution."
        
        # Check consonant cluster (e.g. 5+ consecutive consonants)
        max_consonants = 0
        curr_c = 0
        for char in alpha_only:
            if char not in 'aeiouy':
                curr_c += 1
                max_consonants = max(max_consonants, curr_c)
            else:
                curr_c = 0
        if max_consonants >= 5:
            return False, f"'{word}' contains an unnatural sequence of consonants."

    return True, ""
