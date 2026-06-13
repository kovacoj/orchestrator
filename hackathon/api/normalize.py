"""
Raw Apify dataset items → competitor_prices rows.

Validation rule (per hackathon spec §7):
  - missing price, currency, or url → keep raw, mark normalized row invalid.
"""

from __future__ import annotations

from typing import Any


REQUIRED = ("product", "competitor", "price", "currency", "url")


def normalize_one(raw: dict[str, Any]) -> dict[str, Any]:
    """Map a raw Apify item to a competitor_prices row dict.

    Returns a dict with `is_valid` set; `id` and `scrape_run_id` are filled
    by the caller before insert.
    """
    product_name = raw.get("product") or raw.get("product_name") or raw.get("title")
    competitor = raw.get("competitor") or raw.get("source")
    price = raw.get("price")
    currency = raw.get("currency")
    availability = (raw.get("availability") or "unknown").lower()
    url = raw.get("url")
    brand = raw.get("brand")
    raw_title = raw.get("title")

    missing = []
    if price is None:
        missing.append("price")
    if not currency:
        missing.append("currency")
    if not url:
        missing.append("url")
    if not product_name:
        missing.append("product_name")
    if not competitor:
        missing.append("competitor")

    is_valid = len(missing) == 0

    row = {
        "product_name": product_name or "<missing>",
        "brand": brand,
        "competitor": competitor or "<missing>",
        "price": float(price) if isinstance(price, (int, float)) else None,
        "currency": currency or "UNKNOWN",
        "availability": availability if availability in ("in_stock", "out_of_stock", "unknown") else "unknown",
        "url": url,
        "raw_title": raw_title,
        "raw": raw,
        "is_valid": is_valid,
    }
    if not is_valid:
        row["raw"] = {**raw, "_normalization_missing": missing}
    return row


def normalize_many(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [normalize_one(it) for it in items]
