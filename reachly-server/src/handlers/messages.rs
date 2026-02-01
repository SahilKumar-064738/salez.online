use axum::{extract::{State, Path}, Json};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::db::conversations::create_outgoing_message;
use crate::models::conversation::MessageDto;

#[derive(Deserialize)]
pub struct SendMessagePayload {
    pub content: String,
}

pub async fn send_message(
    State(db): State<PgPool>,
    Path(conversation_id): Path<Uuid>,
    Json(payload): Json<SendMessagePayload>,
) -> Json<MessageDto> {
    Json(create_outgoing_message(&db, conversation_id, &payload.content).await)
}
