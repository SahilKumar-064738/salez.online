use axum::{Router, routing::post};
use sqlx::PgPool;

use crate::handlers::webhook::whatsapp_webhook;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/webhook", post(whatsapp_webhook))
        .with_state(db)
}
