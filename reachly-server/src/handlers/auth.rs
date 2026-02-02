use axum::{
    extract::State,
    http::{StatusCode, HeaderMap, header},
    Json,
};
use sqlx::PgPool;
use serde_json::json;
use rand::Rng;


use crate::models::auth::{LoginRequest, SignupRequest};
use crate::db::auth::{find_user_by_email, insert_user, create_session, get_user_by_session, delete_session};

fn gen_token() -> String {
    let mut rng = rand::thread_rng();
    (0..64).map(|_| { let i = rng.gen_range(0..36); if i<10 {(b'0'+i) as char} else {(b'a'+i-10) as char} }).collect()
}

fn cookie_set(t: &str) -> header::HeaderValue {
    header::HeaderValue::from_str(&format!("session_token={}; HttpOnly; SameSite=Lax; Path=/", t)).unwrap()
}

fn cookie_clear() -> header::HeaderValue {
    header::HeaderValue::from_str("session_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0").unwrap()
}

pub fn extract_token(headers: &axum::http::HeaderMap) -> Option<String> {
    headers.get("cookie")?.to_str().ok().and_then(|c|
        c.split(';').map(|s| s.trim())
         .find(|s| s.starts_with("session_token="))
         .map(|s| s.trim_start_matches("session_token=").to_string())
    )
}

pub async fn login(
    State(db): State<PgPool>,
    Json(p): Json<LoginRequest>,
) -> (StatusCode, HeaderMap, Json<serde_json::Value>) {
    let mut h = HeaderMap::new();
    match find_user_by_email(&db, &p.email).await {
        Some((user, hash)) if bcrypt::verify(&p.password, &hash).unwrap_or(false) => {
            let tok = gen_token();
            create_session(&db, &tok, user.id).await;
            h.insert(header::SET_COOKIE, cookie_set(&tok));
            (StatusCode::OK, h, Json(json!({ "id": user.id, "email": user.email, "name": user.name, "companyName": user.company_name })))
        }
        _ => (StatusCode::UNAUTHORIZED, h, Json(json!({ "message": "Invalid email or password" }))),
    }
}

pub async fn signup(
    State(db): State<PgPool>,
    Json(p): Json<SignupRequest>,
) -> (StatusCode, HeaderMap, Json<serde_json::Value>) {
    let mut h = HeaderMap::new();
    let hashed = bcrypt::hash(&p.password, 10).expect("bcrypt");
    match insert_user(&db, &p.name, &p.company_name, &p.email, &hashed).await {
        Ok(user) => {
            let tok = gen_token();
            create_session(&db, &tok, user.id).await;
            h.insert(header::SET_COOKIE, cookie_set(&tok));
            (StatusCode::CREATED, h, Json(json!({ "id": user.id, "email": user.email, "name": user.name, "companyName": user.company_name })))
        }
        Err(msg) => (StatusCode::BAD_REQUEST, h, Json(json!({ "message": msg }))),
    }
}


pub async fn me(
    State(db): State<PgPool>,
    headers: HeaderMap,
) -> (StatusCode, Json<serde_json::Value>) {
    if let Some(tok) = extract_token(&headers) {
        if let Some(u) = get_user_by_session(&db, &tok).await {
            return (
                StatusCode::OK,
                Json(json!({
                    "id": u.id,
                    "email": u.email,
                    "name": u.name,
                    "companyName": u.company_name
                })),
            );
        }
    }

    (
        StatusCode::UNAUTHORIZED,
        Json(json!({ "message": "Not authenticated" })),
    )
}


pub async fn logout(
    State(db): State<PgPool>,
    cookie: axum::http::HeaderMap,
) -> (StatusCode, HeaderMap, Json<serde_json::Value>) {
    let mut h = HeaderMap::new();
    if let Some(tok) = extract_token(&cookie) { delete_session(&db, &tok).await; }
    h.insert(header::SET_COOKIE, cookie_clear());
    (StatusCode::OK, h, Json(json!({ "ok": true })))
}
