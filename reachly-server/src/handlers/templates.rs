use axum::{
    extract::{State, Path},
    http::{HeaderMap, StatusCode},
    Json,
};
use sqlx::PgPool;
use serde_json::json;

use crate::db::templates::*;
use crate::db::auth::get_user_by_session;
use crate::models::templates::*;
use crate::utils::cookies::extract_token;

pub async fn get_templates(
    State(db): State<PgPool>,
    headers: HeaderMap,
) -> Result<Json<Vec<TemplateDto>>, StatusCode> {
    let token = extract_token(&headers).ok_or(StatusCode::UNAUTHORIZED)?;
    let user = get_user_by_session(&db, &token)
        .await
        .ok_or(StatusCode::UNAUTHORIZED)?;

    Ok(Json(fetch_templates(&db, user.id).await))
}

pub async fn create_template(
    State(db): State<PgPool>,
    headers: HeaderMap,
    Json(p): Json<CreateTemplateRequest>,
) -> Result<(StatusCode, Json<TemplateDto>), StatusCode> {
    let token = extract_token(&headers).ok_or(StatusCode::UNAUTHORIZED)?;
    let user = get_user_by_session(&db, &token)
        .await
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let tpl = insert_template(&db, user.id, &p).await;

    Ok((StatusCode::CREATED, Json(tpl)))
}

pub async fn update_template_handler(
    State(db): State<PgPool>,
    headers: HeaderMap,
    Path(id): Path<i64>,
    Json(p): Json<UpdateTemplateRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), StatusCode> {
    let token = extract_token(&headers).ok_or(StatusCode::UNAUTHORIZED)?;
    let user = get_user_by_session(&db, &token)
        .await
        .ok_or(StatusCode::UNAUTHORIZED)?;

    match update_template(&db, user.id, id, &p).await {
        Some(t) => Ok((StatusCode::OK, Json(json!(t)))),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn delete_template_handler(
    State(db): State<PgPool>,
    headers: HeaderMap,
    Path(id): Path<i64>,
) -> StatusCode {
    let token = match extract_token(&headers) {
        Some(t) => t,
        None => return StatusCode::UNAUTHORIZED,
    };

    let user = match get_user_by_session(&db, &token).await {
        Some(u) => u,
        None => return StatusCode::UNAUTHORIZED,
    };

    if delete_template(&db, user.id, id).await {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}
