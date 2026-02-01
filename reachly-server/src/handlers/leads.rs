use axum::{extract::{State, Path}, Json, http::StatusCode};
use sqlx::PgPool;
use serde_json::json;
use crate::db::leads::*;
use crate::models::leads::*;

pub async fn get_leads(State(db): State<PgPool>) -> Json<Vec<LeadDto>> { Json(fetch_leads(&db).await) }

pub async fn get_lead(State(db): State<PgPool>, Path(id): Path<i64>) -> (StatusCode, Json<serde_json::Value>) {
    match fetch_lead(&db, id).await {
        Some(l) => (StatusCode::OK, Json(serde_json::to_value(&l).unwrap())),
        None    => (StatusCode::NOT_FOUND, Json(json!({ "message": "Lead not found" }))),
    }
}

pub async fn create_lead(State(db): State<PgPool>, Json(p): Json<CreateLeadRequest>) -> (StatusCode, Json<LeadDto>) {
    (StatusCode::CREATED, Json(insert_lead(&db, &p).await))
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
