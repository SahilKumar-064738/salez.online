use axum::{extract::{State, Path}, Json, http::StatusCode};
use sqlx::PgPool;
use serde_json::json;
use crate::db::leads::*;
use crate::models::leads::*;
use axum::http::HeaderMap;
use crate::handlers::auth::extract_token;
use crate::db::auth::get_user_by_session;

pub async fn get_leads(State(db): State<PgPool>) -> Json<Vec<LeadDto>> { Json(fetch_leads(&db).await) }

pub async fn get_lead(State(db): State<PgPool>, Path(id): Path<i64>) -> (StatusCode, Json<serde_json::Value>) {
    match fetch_lead(&db, id).await {
        Some(l) => (StatusCode::OK, Json(serde_json::to_value(&l).unwrap())),
        None    => (StatusCode::NOT_FOUND, Json(json!({ "message": "Lead not found" }))),
    }
}
pub async fn create_lead(
    State(db): State<PgPool>,
    headers: HeaderMap,
    Json(p): Json<CreateLeadRequest>,
) -> Result<(StatusCode, Json<LeadDto>), StatusCode> {

    let token = extract_token(&headers)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let user = get_user_by_session(&db, &token)
        .await
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let lead = insert_lead(&db, user.id, &p)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(lead)))
}


pub async fn update_lead_handler(State(db): State<PgPool>, Path(id): Path<i64>, Json(p): Json<UpdateLeadRequest>) -> (StatusCode, Json<serde_json::Value>) {
    match update_lead(&db, id, &p).await {
        Some(l) => (StatusCode::OK, Json(serde_json::to_value(&l).unwrap())),
        None    => (StatusCode::NOT_FOUND, Json(json!({ "message": "Lead not found" }))),
    }
}

pub async fn delete_lead_handler(State(db): State<PgPool>, Path(id): Path<i64>) -> StatusCode {
    if delete_lead(&db, id).await { StatusCode::NO_CONTENT } else { StatusCode::NOT_FOUND }
}
