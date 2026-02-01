use axum::{Router, routing::get};
use sqlx::PgPool;

use crate::handlers::rules::get_rules;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/rules", get(get_rules))
        .with_state(db)
}
