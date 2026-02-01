use axum::{extract::State, Json};
use sqlx::PgPool;

use crate::db::leads::fetch_leads;
use crate::models::leads::LeadDto;

pub async fn get_leads(
    State(db): State<PgPool>,
) -> Json<Vec<LeadDto>> {
    Json(fetch_leads(&db).await)
}
