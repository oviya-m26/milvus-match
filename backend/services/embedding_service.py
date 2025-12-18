from functools import lru_cache
from typing import List, Optional

from flask import current_app

try:
    from sentence_transformers import SentenceTransformer
    _HAS_SENTENCE_TRANSFORMERS = True
except (ImportError, OSError):
    _HAS_SENTENCE_TRANSFORMERS = False
    SentenceTransformer = None


@lru_cache(maxsize=1)
def _get_model() -> Optional[SentenceTransformer]:
    if not _HAS_SENTENCE_TRANSFORMERS:
        return None
    try:
        model_name = current_app.config["EMBEDDING_MODEL"]
        return SentenceTransformer(model_name)
    except Exception:
        return None


def encode_text(text: str) -> List[float]:
    if not text:
        return []
    model = _get_model()
    if not model:
        # Return empty vector if model is not available
        return []
    try:
        vector = model.encode(text)
        return vector.tolist()
    except Exception:
        return []


