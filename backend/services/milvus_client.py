from __future__ import annotations

from typing import List, Optional, Tuple

from flask import current_app

try:
    from pymilvus import (
        Collection,
        CollectionSchema,
        DataType,
        FieldSchema,
        connections,
        utility,
    )
    _HAS_PYMILVUS = True
except (ImportError, ModuleNotFoundError):
    _HAS_PYMILVUS = False
    Collection = None
    CollectionSchema = None
    DataType = None
    FieldSchema = None
    connections = None
    utility = None


class MilvusClient:
    def __init__(self):
        self.uri = current_app.config.get("MILVUS_URI")
        self.token = current_app.config.get("MILVUS_TOKEN")
        self.collection_name = current_app.config.get("MILVUS_COLLECTION")
        self._collection: Optional[Collection] = None
        if not _HAS_PYMILVUS:
            return
        if self.uri:
            try:
                connections.connect(alias="default", uri=self.uri, token=self.token)
                self._ensure_collection()
            except Exception:
                pass

    def _ensure_collection(self):
        if not _HAS_PYMILVUS:
            return
        try:
            if utility.has_collection(self.collection_name):
                self._collection = Collection(self.collection_name)
                return
        except Exception:
            return

        try:
            fields = [
                FieldSchema(
                    name="id",
                    dtype=DataType.VARCHAR,
                    is_primary=True,
                    max_length=64,
                    auto_id=False,
                ),
                FieldSchema(
                    name="vector",
                    dtype=DataType.FLOAT_VECTOR,
                    dim=768,
                ),
                FieldSchema(
                    name="metadata",
                    dtype=DataType.JSON,
                ),
            ]
            schema = CollectionSchema(fields=fields, description="ApplicantAura jobs")
            self._collection = Collection(name=self.collection_name, schema=schema)
            self._collection.create_index(
                field_name="vector",
                index_params={
                    "index_type": "IVF_FLAT",
                    "metric_type": "IP",
                    "params": {"nlist": 1536},
                },
            )
        except Exception:
            pass

    @property
    def collection(self) -> Optional[Collection]:
        return self._collection

    def upsert(
        self, vector_id: str, vector: List[float], metadata: dict
    ) -> Optional[str]:
        if not self.collection or not vector:
            return None
        self.collection.upsert([[vector_id], [vector], [metadata]])
        self.collection.flush()
        return vector_id

    def search(
        self, vector: List[float], limit: int
    ) -> List[Tuple[str, float, dict]]:
        if not self.collection or not vector:
            return []
        res = self.collection.search(
            data=[vector],
            anns_field="vector",
            param={"metric_type": "IP", "params": {"nprobe": 16}},
            limit=limit,
            output_fields=["metadata"],
        )
        matches = []
        for hit in res[0]:
            matches.append((hit.id, hit.score, hit.entity.get("metadata", {})))
        return matches


