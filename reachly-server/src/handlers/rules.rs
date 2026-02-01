use axum::{extract::{State, Path}, Json, http::StatusCode};
use sqlx::PgPool;
use crate::db::rules::*;
use crate::models::rules::*;

pub async fn get_rules(State(db): State<PgPool>) -> Json<Vec<FollowUpRuleDto>> { Json(fetch_rules(&db).await) }

pub async fn create_rule(State(db): State<PgPool>, Json(p): Json<CreateRuleRequest>) -> (StatusCode, Json<FollowUpRuleDto>) {
    (StatusCode::CREATED, Json(insert_rule(&db, &p).await))
}

pub async fn delete_rule_handler(State(db): State<PgPool>, Path(id): Path<i64>) -> StatusCode {
    if delete_rule(&db, id).await { StatusCode::NO_CONTENT } else { StatusCode::NOT_FOUND }
}
