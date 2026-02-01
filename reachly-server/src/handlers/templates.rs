use axum::{extract::{State, Path}, Json, http::StatusCode};
use sqlx::PgPool;
use serde_json::json;
use crate::db::templates::*;
use crate::models::templates::*;

pub async fn get_templates(State(db): State<PgPool>) -> Json<Vec<TemplateDto>> { Json(fetch_templates(&db).await) }

pub async fn create_template(State(db): State<PgPool>, Json(p): Json<CreateTemplateRequest>) -> (StatusCode, Json<TemplateDto>) {
    (StatusCode::CREATED, Json(insert_template(&db, &p).await))
}

pub async fn update_template_handler(State(db): State<PgPool>, Path(id): Path<i64>, Json(p): Json<UpdateTemplateRequest>) -> (StatusCode, Json<serde_json::Value>) {
    match update_template(&db, id, &p).await {
        Some(t) => (StatusCode::OK, Json(serde_json::to_value(&t).unwrap())),
        None    => (StatusCode::NOT_FOUND, Json(json!({ "message": "Not found" }))),
    }
}

pub async fn delete_template_handler(State(db): State<PgPool>, Path(id): Path<i64>) -> StatusCode {
    if delete_template(&db, id).await { StatusCode::NO_CONTENT } else { StatusCode::NOT_FOUND }
}
