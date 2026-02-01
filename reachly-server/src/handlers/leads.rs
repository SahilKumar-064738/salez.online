use axum::{extract::State, Json, http::StatusCode};
use sqlx::PgPool;

use crate::db::leads::{fetch_leads, insert_lead};
use crate::models::leads::{LeadDto, CreateLeadRequest};

pub async fn get_leads(
    State(db): State<PgPool>,
) -> Json<Vec<LeadDto>> {
    Json(fetch_leads(&db).await)
}

pub async fn create_lead(
    State(db): State<PgPool>,
    Json(payload): Json<CreateLeadRequest>,
) -> (StatusCode, Json<LeadDto>) {
    let lead = insert_lead(&db, &payload).await;
    (StatusCode::CREATED, Json(lead))
}
