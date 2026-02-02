use axum::{
    extract::{State, Path},
    http::{HeaderMap, StatusCode},
    Json,
};
use sqlx::PgPool;

use crate::db::rules::*;
use crate::db::auth::get_user_by_session;
use crate::models::rules::*;
use crate::utils::cookies::extract_token;

pub async fn get_rules(
    State(db): State<PgPool>,
    headers: HeaderMap,
) -> Result<Json<Vec<FollowUpRuleDto>>, StatusCode> {
    let token = extract_token(&headers).ok_or(StatusCode::UNAUTHORIZED)?;
    let user = get_user_by_session(&db, &token)
        .await
        .ok_or(StatusCode::UNAUTHORIZED)?;

    Ok(Json(fetch_rules(&db, user.id).await))
}

pub async fn create_rule(
    State(db): State<PgPool>,
    headers: HeaderMap,
    Json(p): Json<CreateRuleRequest>,
) -> Result<(StatusCode, Json<FollowUpRuleDto>), StatusCode> {
    let token = extract_token(&headers).ok_or(StatusCode::UNAUTHORIZED)?;
    let user = get_user_by_session(&db, &token)
        .await
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let rule = insert_rule(&db, user.id, &p).await;

    Ok((StatusCode::CREATED, Json(rule)))
}

pub async fn delete_rule_handler(
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

    if delete_rule(&db, user.id, id).await {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}
