"""Lightweight text feature helpers shared by content and interest profiling.

These are deliberately rule-based and dependency-free. They are accurate
enough to seed content profiles and can be swapped for an ML/embedding based
pipeline (or a real language detector) in a later phase without changing the
storage layer.
"""

import re

_TOKEN_SPLIT = re.compile(r"[^a-z0-9]+")
_STOPWORDS = {
    "the", "and", "for", "with", "to", "of", "on", "in", "from", "how",
    "what", "why", "who", "your", "our", "you", "my", "not", "new", "are",
    "was", "this", "that", "it", "is", "at", "by", "it's",
}

# A small map of Unicode scripts -> representative ISO-639-1 language code,
# used only as a cheap heuristic. Rows are (compiled regex, code).
_SCRIPTS = [
    (re.compile(r"[\u0600-\u06FF]"), "ar"),
    (re.compile(r"[\u0590-\u05FF]"), "he"),
    (re.compile(r"[\u0400-\u04FF]"), "ru"),
    (re.compile(r"[\u0900-\u097F]"), "hi"),
    (re.compile(r"[\u4E00-\u9FFF]"), "zh"),
    (re.compile(r"[\u3040-\u30FF]"), "ja"),
    (re.compile(r"[\uAC00-\uD7AF]"), "ko"),
    (re.compile(r"[\u0E00-\u0E7F]"), "th"),
    (re.compile(r"[\uDD00-\uDDFF]"), "ar"),
]


def topic_tokens(text: str) -> list[str]:
    """Split free text into normalized topic tokens (lowercased, deduped)."""
    tokens: list[str] = []
    seen: set[str] = set()
    for word in _TOKEN_SPLIT.split((text or "").lower()):
        if len(word) >= 3 and word not in _STOPWORDS and word not in seen:
            seen.add(word)
            tokens.append(word)
    return tokens


def detect_language(text: str | None) -> str:
    """Heuristic language detection based on dominant Unicode script.

    Returns a lowercase ISO-639-1-ish code, defaulting to ``en`` when the text
    is empty or no strong non-Latin script is present.
    """
    if not text:
        return "en"
    counts: dict[str, int] = {}
    for pattern, code in _SCRIPTS:
        n = len(pattern.findall(text))
        if n:
            counts[code] = counts.get(code, 0) + n
    if not counts:
        return "en"
    best_code = max(counts, key=counts.get)
    return best_code if counts[best_code] >= 3 else "en"