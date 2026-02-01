use axum::{Router, routing::{get, post, patch, delete}};
use sqlx::PgPool;
use crate::handlers::leads::*;

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/leads",     get(get_leads).post(create_lead))
        .route("/api/leads/:id", get(get_lead).patch(update_lead_handler).delete(delete_lead_handler))
        .with_state(db)
}
