use axum::{Router, routing::get};
use sqlx::PgPool;

use crate::handlers::leads::get_leads;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/leads", get(get_leads))
        .with_state(db)
}
