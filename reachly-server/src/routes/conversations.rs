use axum::{Router, routing::get};
use sqlx::PgPool;

use crate::handlers::conversations::{
    list_conversations,
    get_conversation,
};

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/conversations", get(list_conversations))
        .route("/api/conversations/:id", get(get_conversation))
        .with_state(db)
}
