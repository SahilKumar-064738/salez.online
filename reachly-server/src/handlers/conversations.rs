use axum::{
    extract::{State, Path},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::db::conversations::{
    fetch_conversations,
    fetch_conversation,
};
use crate::models::conversation::ConversationDto;

pub async fn list_conversations(
    State(db): State<PgPool>,
) -> Json<Vec<ConversationDto>> {
    Json(fetch_conversations(&db).await)
}

pub async fn get_conversation(
    State(db): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<ConversationDto>, axum::http::StatusCode> {
    match fetch_conversation(&db, id).await {
        Some(c) => Ok(Json(c)),
        None => Err(axum::http::StatusCode::NOT_FOUND),
    }
}
