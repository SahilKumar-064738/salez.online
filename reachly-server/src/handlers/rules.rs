use axum::{extract::State, Json};
use sqlx::PgPool;

use crate::db::rules::fetch_rules;
use crate::models::rules::FollowUpRuleDto;

pub async fn get_rules(
    State(db): State<PgPool>,
) -> Json<Vec<FollowUpRuleDto>> {
    Json(fetch_rules(&db).await)
}
