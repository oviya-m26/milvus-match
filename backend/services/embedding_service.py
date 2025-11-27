from functools import lru_cache
from typing import List

from flask import current_app
from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def _get_model() -> SentenceTransformer:
    model_name = current_app.config["EMBEDDING_MODEL"]
    return SentenceTransformer(model_name)


def encode_text(text: str) -> List[float]:
    if not text:
        return []
    model = _get_model()
    vector = model.encode(text)
    return vector.tolist()


