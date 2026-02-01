use axum::{Router, routing::{get, post, delete}};
use sqlx::PgPool;
use crate::handlers::rules::*;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/rules",     get(get_rules).post(create_rule))
        .route("/api/rules/:id", delete(delete_rule_handler))
        .with_state(db)
}
