// src/utils/cookies.rs
use axum::http::HeaderMap;

pub fn extract_token(headers: &HeaderMap) -> Option<String> {
    headers
        .get("cookie")?
        .to_str().ok()?
        .split(';')
        .find(|c| c.trim().starts_with("session_token="))
        .map(|c| c.trim().replace("session_token=", ""))
}
