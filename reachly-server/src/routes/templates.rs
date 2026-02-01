use axum::{Router, routing::{get, post, patch, delete}};
use sqlx::PgPool;
use crate::handlers::templates::*;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/templates",     get(get_templates).post(create_template))
        .route("/api/templates/:id", patch(update_template_handler).delete(delete_template_handler))
        .with_state(db)
}
