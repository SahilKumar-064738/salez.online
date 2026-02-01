use axum::{Router, routing::get};
use sqlx::PgPool;

use crate::handlers::reminders::get_reminders;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/reminders", get(get_reminders))
        .with_state(db)
}
