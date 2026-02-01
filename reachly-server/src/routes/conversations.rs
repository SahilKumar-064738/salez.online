use axum::{Router, routing::{get, post}};
use sqlx::PgPool;
use crate::handlers::conversations::{list_conversations, get_conversation};
use crate::handlers::messages::send_message;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/conversations",              get(list_conversations))
        .route("/api/conversations/:id",          get(get_conversation))
        .route("/api/conversations/:id/messages", post(send_message))
        .with_state(db)
}
