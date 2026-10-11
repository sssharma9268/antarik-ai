"""Model routing for `antarik-auto`.

Classify before generating: the tier is chosen up front from cheap signals in the request,
so hard requests never pay for a failed attempt on a small model first.
Naming a model explicitly always overrides the router.

v0 is a rules-based classifier. Later: a small trained classifier, per-org routing policies.
The route *reason* is recorded for metering; the request text never is.
"""

import re
from dataclasses import dataclass

AUTO_MODEL = "antarik-auto"
FAST, REASON, CODE = "antarik-fast", "antarik-reason", "antarik-code"

_CODE_PATTERNS = re.compile(
    r"```|Traceback \(most recent call last\)|\bdef \w+\(|\bclass \w+[:(]|\bimport \w+|"
    r"\bfunction \w*\(|=>|#include|\bSELECT\b.+\bFROM\b|\bpublic static\b|\bconsole\.log\(|"
    r"\b(TypeError|ValueError|SyntaxError|NullPointerException|segfault)\b",
    re.IGNORECASE | re.DOTALL,
)
_REASON_PATTERNS = re.compile(
    r"\b(why|prove|derive|step[- ]by[- ]step|analy[sz]e|compare|trade-?offs?|evaluate|"
    r"plan|strategy|reason|calculate|explain how|pros and cons)\b",
    re.IGNORECASE,
)
LONG_PROMPT_CHARS = 2000


@dataclass(frozen=True)
class Route:
    model: str  # public model name, e.g. antarik-fast
    reason: str  # short, text-free explanation stored in usage records


def _last_user_text(messages: list[dict]) -> str:
    for m in reversed(messages):
        if m.get("role") == "user":
            content = m.get("content")
            if isinstance(content, str):
                return content
            if isinstance(content, list):  # OpenAI content parts
                return " ".join(p.get("text", "") for p in content if isinstance(p, dict))
    return ""


def route(requested_model: str, messages: list[dict], available: set[str]) -> Route:
    if requested_model != AUTO_MODEL:
        return Route(requested_model, "explicit")

    text = _last_user_text(messages)
    if _CODE_PATTERNS.search(text) and CODE in available:
        return Route(CODE, "auto:code-signals")
    if len(text) > LONG_PROMPT_CHARS and REASON in available:
        return Route(REASON, "auto:long-prompt")
    if _REASON_PATTERNS.search(text) and REASON in available:
        return Route(REASON, "auto:reasoning-signals")
    if FAST in available:
        return Route(FAST, "auto:default-fast")
    # Fall back to whatever is configured
    return Route(sorted(available)[0], "auto:fallback")
