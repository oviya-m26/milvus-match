from math import ceil


def paginate(query, page: int, limit: int):
    total = query.count()
    items = query.limit(limit).offset((page - 1) * limit).all()
    num_pages = ceil(total / limit) if total else 1
    return items, total, num_pages


