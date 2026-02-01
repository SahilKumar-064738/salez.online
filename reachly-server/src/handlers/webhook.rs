use axum::{extract::State, Json};
use serde::Deserialize;
use sqlx::PgPool;
use serde_json::json;

use crate::db::leads::{
    get_default_business_id,
    upsert_lead,
    insert_inbound_message,
};

#[derive(Deserialize)]
pub struct WebhookPayload {
    pub from: String,
    pub message: String,
}

pub async fn whatsapp_webhook(
    State(db): State<PgPool>,
    Json(payload): Json<WebhookPayload>,
) -> Json<serde_json::Value> {
    let business_id = get_default_business_id(&db).await;
    let lead_id = upsert_lead(&db, business_id, &payload.from).await;

    insert_inbound_message(&db, lead_id, &payload.message).await;

    Json(json!({ "ok": true }))
}
