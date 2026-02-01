use axum::{Router, routing::{get, post}};
use sqlx::PgPool;

use crate::handlers::leads::{get_leads, create_lead};

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/leads", get(get_leads))
        .route("/api/leads", post(create_lead))
        .with_state(db)
}
