use axum::{Router, routing::get};
use sqlx::PgPool;

use crate::handlers::templates::get_templates;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/templates", get(get_templates))
        .with_state(db)
}
