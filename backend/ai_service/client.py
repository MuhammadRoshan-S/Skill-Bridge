"""
Google Gemini API client wrapper for SkillBridge.
Uses google-genai SDK (gemini-3.5-flash-lite model) with persistent disk/memory caching
and automatic 429 / RESOURCE_EXHAUSTED free-tier quota protection.
"""

import json
import logging
import hashlib
import time
import os
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

# Try new SDK first (google-genai), fall back to old (google-generativeai)
GENAI_NEW = False
GENAI_OLD = False

try:
    from google import genai
    from google.genai import types as genai_types
    GENAI_NEW = True
    logger.info("Using new google-genai SDK")
except ImportError:
    try:
        import google.generativeai as genai_legacy
        GENAI_OLD = True
        logger.info("Using legacy google-generativeai SDK")
    except ImportError:
        logger.warning("No Gemini SDK installed. AI features will use mock data.")


# ================= Persistent Disk & Memory Cache for Free Tier =================
CACHE_FILE_PATH = Path(__file__).resolve().parent / '.gemini_cache.json'
CACHE_TTL_SECONDS = 86400 * 7  # 7 Days Persistent Cache
_API_PROMPT_CACHE = {}
_API_REQUEST_COUNT = 0


def _load_disk_cache():
    """Load cached responses from disk into memory."""
    global _API_PROMPT_CACHE
    try:
        if CACHE_FILE_PATH.exists():
            with open(CACHE_FILE_PATH, 'r', encoding='utf-8') as f:
                _API_PROMPT_CACHE = json.load(f)
    except Exception as e:
        logger.warning(f"Could not load Gemini disk cache: {e}")
        _API_PROMPT_CACHE = {}


def _save_disk_cache():
    """Persist cache to disk."""
    try:
        with open(CACHE_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(_API_PROMPT_CACHE, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.warning(f"Could not save Gemini disk cache: {e}")


# Initialize cache on module load
_load_disk_cache()


def get_api_request_count():
    """Return total live Gemini API calls made in this server session."""
    return _API_REQUEST_COUNT


def _get_api_key():
    """Return the configured API key or None."""
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == 'your-gemini-api-key-here':
        logger.warning("GEMINI_API_KEY not configured. Using mock data.")
        return None
    return api_key


def _get_primary_model_name():
    """Return the primary configured Gemini model name."""
    return getattr(settings, 'GEMINI_MODEL', 'gemini-3.5-flash-lite') or 'gemini-3.5-flash-lite'


def _get_backup_model_name():
    """Return the backup configured Gemini model name for rate-limit failover."""
    return getattr(settings, 'GEMINI_BACKUP_MODEL', 'gemini-3.1-flash-lite') or 'gemini-3.1-flash-lite'


def _compute_hash(key_str):
    return hashlib.sha256(key_str.strip().encode('utf-8')).hexdigest()


def call_gemini(prompt, max_retries=1, force_refresh=False):
    """
    Call the Gemini API with smart persistent caching, automatic failover to backup model
    (gemini-3.1-flash-lite) upon rate limits / 429, and quota protection.
    """
    global _API_REQUEST_COUNT
    api_key = _get_api_key()
    if not api_key:
        return None

    primary_model = _get_primary_model_name()
    backup_model = _get_backup_model_name()
    
    # Models to try in priority order
    models_to_try = [primary_model]
    if backup_model and backup_model != primary_model:
        models_to_try.append(backup_model)

    # Check cache first for any of our models to save API calls
    for model_name in models_to_try:
        cache_key = _compute_hash(f"{model_name}:{prompt}")
        if not force_refresh and cache_key in _API_PROMPT_CACHE:
            cached_entry = _API_PROMPT_CACHE[cache_key]
            cached_text = cached_entry.get('text')
            timestamp = cached_entry.get('timestamp', 0)
            if cached_text and (time.time() - timestamp < CACHE_TTL_SECONDS):
                logger.info(f"⚡ [Gemini Cache Hit] Served request from persistent cache for {model_name} (0 API calls used).")
                return cached_text

    # Try models in sequence (Primary -> Backup)
    for model_idx, model_name in enumerate(models_to_try):
        is_backup = (model_idx > 0)
        cache_key = _compute_hash(f"{model_name}:{prompt}")

        # --- New SDK path ---
        if GENAI_NEW:
            client = genai.Client(api_key=api_key)
            for attempt in range(max_retries + 1):
                try:
                    _API_REQUEST_COUNT += 1
                    model_label = f"Backup: {model_name}" if is_backup else f"Primary: {model_name}"
                    logger.info(f"🌐 [Gemini Live Call #{_API_REQUEST_COUNT}] ({model_label})")
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=genai_types.GenerateContentConfig(
                            temperature=0.7,
                            max_output_tokens=8192,  # Expanded token window to prevent JSON truncation
                        ),
                    )
                    result_text = response.text
                    if result_text:
                        _API_PROMPT_CACHE[cache_key] = {
                            'text': result_text,
                            'timestamp': time.time(),
                        }
                        _save_disk_cache()
                        if is_backup:
                            logger.info(f"✅ Successfully served request via backup model: {model_name}")
                        return result_text
                except Exception as e:
                    err_msg = str(e)
                    is_rate_limit = ("429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower())
                    if is_rate_limit and not is_backup and len(models_to_try) > 1:
                        logger.warning(
                            f"⚠️ [Gemini Rate Limit] Primary model '{model_name}' hit rate limit. "
                            f"Automatically failing over to backup model: '{backup_model}'..."
                        )
                        break  # Break retry loop to immediately try backup model
                    elif is_rate_limit:
                        logger.warning(f"⚠️ [Gemini Quota Exceeded] All models exhausted quota. Gracefully switching to dynamic local intelligence.")
                        return None
                    
                    logger.error(f"Gemini API error ({model_name}, attempt {attempt + 1}): {e}")
                    if attempt == max_retries and not is_backup and len(models_to_try) > 1:
                        logger.info(f"Failing over to backup model '{backup_model}' after attempts failed.")
                        break
                    elif attempt == max_retries:
                        return None

        # --- Legacy SDK path ---
        if GENAI_OLD:
            genai_legacy.configure(api_key=api_key)
            model = genai_legacy.GenerativeModel(model_name)
            for attempt in range(max_retries + 1):
                try:
                    _API_REQUEST_COUNT += 1
                    logger.info(f"🌐 [Gemini Legacy Call #{_API_REQUEST_COUNT}] Model: {model_name}")
                    response = model.generate_content(
                        prompt,
                        generation_config=genai_legacy.types.GenerationConfig(
                            temperature=0.7,
                            max_output_tokens=8192,
                        )
                    )
                    result_text = response.text
                    if result_text:
                        _API_PROMPT_CACHE[cache_key] = {
                            'text': result_text,
                            'timestamp': time.time(),
                        }
                        _save_disk_cache()
                        return result_text
                except Exception as e:
                    err_msg = str(e)
                    is_rate_limit = ("429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower())
                    if is_rate_limit and not is_backup and len(models_to_try) > 1:
                        logger.warning(f"⚠️ [Gemini Rate Limit] Failing over to backup model: {backup_model}")
                        break
                    elif is_rate_limit:
                        logger.warning(f"⚠️ [Gemini Free Tier Quota] Gracefully switching to dynamic local intelligence.")
                        return None
                    logger.error(f"Gemini API error (attempt {attempt + 1}): {e}")
                    if attempt == max_retries:
                        return None

    return None


def call_gemini_json(prompt, max_retries=1, force_refresh=False):
    """
    Call Gemini and parse the response as JSON with resilient repair.
    """
    raw = call_gemini(prompt, max_retries=max_retries, force_refresh=force_refresh)
    if raw is None:
        return None

    try:
        text = raw.strip()
        if text.startswith('```json'):
            text = text[7:]
        elif text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]

        text = text.strip()
        return json.loads(text)
    except json.JSONDecodeError as e:
        # Resilient JSON recovery for partial arrays
        try:
            cleaned = text.strip()
            if cleaned.startswith('[') and not cleaned.endswith(']'):
                # Find last complete object closing
                last_brace = cleaned.rfind('}')
                if last_brace != -1:
                    repaired = cleaned[:last_brace+1] + ']'
                    return json.loads(repaired)
            elif cleaned.startswith('{') and not cleaned.endswith('}'):
                last_brace = cleaned.rfind('}')
                if last_brace != -1:
                    repaired = cleaned[:last_brace+1]
                    return json.loads(repaired)
        except Exception:
            pass

        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        return None
