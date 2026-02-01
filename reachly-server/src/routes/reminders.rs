use axum::{Router, routing::{get, post, delete}};
use sqlx::PgPool;
use crate::handlers::reminders::*;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/reminders",     get(get_reminders).post(create_reminder))
        .route("/api/reminders/:id", delete(delete_reminder_handler))
        .with_state(db)
}
