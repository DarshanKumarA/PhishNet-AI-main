import re
import numpy as np

# ============================================
# CONSTANTS & LISTS
# ============================================

KNOWN_LEGITIMATE_DOMAINS = {
    "google.com", "youtube.com", "facebook.com", "github.com", "amazon.com",
    "paypal.com", "netflix.com", "microsoft.com", "apple.com", "twitter.com", "ebay.com", "claude.com",
    "linkedin.com", "instagram.com", "reddit.com","gov.in", "wikipedia.org", "spotify.com", "stackoverflow.com", "x.com", "figma.com",
    "twitch.tv", "tiktok.com", "tumblr.com", "pinterest.com", "quora.com","ac.in", "dropbox.com","telegram.org","phishtank.com", "web.whatsapp.com", "discord.com",
}

PHISHING_KEYWORDS = ["verify", "confirm", "update", "secure", "login", "suspended"]

# ============================================
# HELPER FUNCTIONS
# ============================================

def count_special_chars(url):
    return len(re.findall(r"[^a-zA-Z0-9]", str(url)))

def calculate_entropy(url):
    url = str(url)
    if len(url) == 0:
        return 0
    entropy = 0
    for x in range(256):
        p_x = float(url.count(chr(x))) / len(url)
        if p_x > 0:
            entropy += - p_x * np.log2(p_x)
    return entropy

def having_ip_address(url):
    match = re.search(
        r"(([01]?\d\d?|2[0-4]\d|25[0-5])\.){3}([01]?\d\d?|2[0-4]\d|25[0-5])", url)
    return 1 if match else 0

def has_suspicious_tld(url):
    return 1 if any(tld in str(url).lower() for tld in [".tk", ".ml", ".ga", ".cf", ".gq"]) else 0

def has_shortening_service(url):
    return 1 if any(s in str(url).lower() for s in ["bit.ly", "goo.gl", "tinyurl"]) else 0

def preprocess_url(url):
    url = str(url).lower()
    url = re.sub(r"https?://", "", url)
    url = re.sub(r"^www\.", "", url)
    if url.endswith("/"):
        url = url[:-1]
    return url

def extract_domain(url):
    url = preprocess_url(url)
    domain = url.split("/")[0]
    parts = domain.split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else domain

def analyze_url_security(url):
    """
    Performs initial heuristic checks (Whitelist, IP check, Keywords).
    Returns a dictionary if a rule is hit, otherwise None.
    """
    domain = extract_domain(url)
    if domain in KNOWN_LEGITIMATE_DOMAINS:
        return {"risk_level": "SAFE", "reason": " Whitelisted domain", "confidence": 0.99}
    if has_suspicious_tld(url) and sum(1 for k in PHISHING_KEYWORDS if k in url.lower()) >= 2:
        return {"risk_level": "HIGH_RISK", "reason": " Suspicious TLD + keywords", "confidence": 0.85}
    if having_ip_address(url):
        return {"risk_level": "MEDIUM_RISK", "reason": " IP address URL", "confidence": 0.75}
    return None

def get_url_features(url):
    """
    Extracts the 17 manual features required by the model.
    """
    url_str = str(url)
    return {
        "url_length": len(url_str),
        "num_dots": url_str.count("."),
        "num_hyphens": url_str.count("-"),
        "num_underscores": url_str.count("_"),
        "num_slashes": url_str.count("/"),
        "num_questions": url_str.count("?"),
        "num_equals": url_str.count("="),
        "num_at": url_str.count("@"),
        "num_ampersands": url_str.count("&"),
        "num_digits": sum(c.isdigit() for c in url_str),
        "digit_ratio": sum(c.isdigit() for c in url_str) / max(len(url_str), 1),
        "num_special_chars": count_special_chars(url),
        "entropy": calculate_entropy(url),
        "use_of_ip": having_ip_address(url),
        "is_https": 1 if "https" in url_str.lower() else 0,
        "suspicious_tld": has_suspicious_tld(url),
        "has_shortening": has_shortening_service(url)
    }