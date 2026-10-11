from app.services.model_router import route

AVAILABLE = {"antarik-fast", "antarik-reason", "antarik-code"}


def msgs(text):
    return [{"role": "user", "content": text}]


def test_explicit_model_is_honoured():
    r = route("antarik-reason", msgs("hi"), AVAILABLE)
    assert (r.model, r.reason) == ("antarik-reason", "explicit")


def test_code_goes_to_coder():
    r = route("antarik-auto", msgs("Traceback (most recent call last):\n  File x"), AVAILABLE)
    assert r.model == "antarik-code"


def test_reasoning_goes_to_reason():
    r = route("antarik-auto", msgs("Compare the trade-offs of RAG vs fine-tuning"), AVAILABLE)
    assert r.model == "antarik-reason"


def test_short_chat_goes_fast():
    r = route("antarik-auto", msgs("Tag this support ticket: card not working"), AVAILABLE)
    assert r.model == "antarik-fast"
