"""
Competitor price analysis — pure, deterministic, no LLM calls.

Given a list of valid competitor_prices rows for ONE scrape run, produce:
  - experiment_results rows (median, min, max, IQR-outlier flags, ...)
  - recommendations rows (one per product), approval-only by default.

The math is intentionally simple so demo numbers are easy to read:

  current_price       = max competitor price for that product
                        (treats "us" as the premium position initially)
  competitor_median   = median of competitor prices
  recommended_price   = competitor_median (match the market)
  delta_pct           = (recommended - current) / current * 100
  confidence          = clamp(0,1) of:
                          base 0.30
                          + 0.10 * n_competitors      (more = better)
                          + 0.30 * (1 - CV)           (low variance = better)
                          + 0.10 * (1 - outlier_frac) (clean data = better)
"""

from __future__ import annotations

import math
import statistics
from collections import defaultdict
from typing import Any


def _iqr_outliers(values: list[float]) -> set[int]:
    """Return indices flagged as outliers by 1.5 × IQR. Needs n ≥ 4."""
    n = len(values)
    if n < 4:
        return set()
    sorted_pairs = sorted(enumerate(values), key=lambda p: p[1])
    sorted_vals = [v for _, v in sorted_pairs]
    q1 = statistics.median(sorted_vals[: n // 2])
    upper_half = sorted_vals[(n + 1) // 2 :]
    q3 = statistics.median(upper_half) if upper_half else sorted_vals[-1]
    iqr = q3 - q1
    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    return {idx for idx, v in sorted_pairs if v < lo or v > hi}


def analyze_run(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Group rows by product and emit experiments + recommendations.

    Input rows are dicts (e.g. from db.query) with product_name, competitor,
    price, currency, is_valid. Rows with is_valid=False or price=None are
    excluded from numeric stats but logged.

    Output:
      {
        "products": [
          {
            "product_name": str,
            "experiments": [ {experiment_name, metric_name, metric_value, result}, ... ],
            "recommendation": { ... } | None,
          },
          ...
        ],
        "summary": {
          "products_analyzed": int,
          "products_skipped":  int,
          "rows_in":           int,
          "rows_valid":        int,
        }
      }
    """
    by_product: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for r in rows:
        if r.get("is_valid") in (False, 0):
            continue
        if r.get("price") is None:
            continue
        by_product[r["product_name"]].append(r)

    products_out: list[dict[str, Any]] = []
    skipped = 0
    rows_valid = sum(len(v) for v in by_product.values())

    for product_name, prows in by_product.items():
        n = len(prows)
        prices = [float(r["price"]) for r in prows]

        if n < 2:
            # Not enough competitors to recommend; emit a single-row experiment.
            products_out.append({
                "product_name": product_name,
                "experiments": [{
                    "experiment_name": "competitor_price_analysis",
                    "metric_name": "insufficient_competitors",
                    "metric_value": float(n),
                    "result": {
                        "n_competitors": n,
                        "reason": "Need ≥ 2 competitors for a recommendation.",
                    },
                }],
                "recommendation": None,
            })
            skipped += 1
            continue

        median = statistics.median(prices)
        mean = statistics.fmean(prices)
        mn, mx = min(prices), max(prices)
        stdev = statistics.pstdev(prices) if n > 1 else 0.0
        cv = (stdev / mean) if mean else 0.0  # coefficient of variation
        outlier_idx = _iqr_outliers(prices)
        outlier_competitors = [prows[i]["competitor"] for i in sorted(outlier_idx)]
        outlier_frac = len(outlier_idx) / n

        current_price = mx                              # treat "us" as the premium
        recommended_price = round(median, 2)
        delta_pct = round(((recommended_price - current_price) / current_price) * 100, 2) if current_price else 0.0

        confidence = 0.30 + 0.10 * n + 0.30 * (1 - cv) + 0.10 * (1 - outlier_frac)
        confidence = max(0.0, min(1.0, confidence))

        currency = prows[0].get("currency", "EUR")
        reason = (
            f"{n} competitors observed (median {median:.2f} {currency}, "
            f"range {mn:.2f}–{mx:.2f}, CV {cv:.2f}). "
            f"Recommend matching the market median; current price {current_price:.2f} {currency} "
            f"is {abs(delta_pct):.1f}% {'above' if delta_pct < 0 else 'below'} median."
        )
        if outlier_competitors:
            reason += f" Outliers excluded: {', '.join(outlier_competitors)}."

        experiments = [
            {
                "experiment_name": "competitor_price_analysis",
                "metric_name": "competitor_median",
                "metric_value": float(median),
                "result": {"n": n, "currency": currency},
            },
            {
                "experiment_name": "competitor_price_analysis",
                "metric_name": "competitor_min",
                "metric_value": float(mn),
                "result": {"competitor": prows[prices.index(mn)]["competitor"]},
            },
            {
                "experiment_name": "competitor_price_analysis",
                "metric_name": "competitor_max",
                "metric_value": float(mx),
                "result": {"competitor": prows[prices.index(mx)]["competitor"]},
            },
            {
                "experiment_name": "competitor_price_analysis",
                "metric_name": "coefficient_of_variation",
                "metric_value": round(cv, 4),
                "result": {"interpretation": "lower = more consistent pricing across competitors"},
            },
            {
                "experiment_name": "competitor_price_analysis",
                "metric_name": "iqr_outliers",
                "metric_value": float(len(outlier_idx)),
                "result": {"competitors": outlier_competitors},
            },
            {
                "experiment_name": "competitor_price_analysis",
                "metric_name": "confidence",
                "metric_value": round(confidence, 4),
                "result": {
                    "breakdown": {
                        "base": 0.30,
                        "n_competitor_bonus": round(0.10 * n, 4),
                        "consistency_bonus": round(0.30 * (1 - cv), 4),
                        "clean_data_bonus": round(0.10 * (1 - outlier_frac), 4),
                    }
                },
            },
        ]

        recommendation = {
            "product_name": product_name,
            "current_price": current_price,
            "recommended_price": recommended_price,
            "delta_pct": delta_pct,
            "confidence": round(confidence, 4),
            "reason": reason,
        }

        products_out.append({
            "product_name": product_name,
            "experiments": experiments,
            "recommendation": recommendation,
        })

    return {
        "products": products_out,
        "summary": {
            "products_analyzed": len(products_out) - skipped,
            "products_skipped": skipped,
            "rows_in": len(rows),
            "rows_valid": rows_valid,
        },
    }
