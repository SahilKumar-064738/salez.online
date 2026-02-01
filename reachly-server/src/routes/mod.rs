use sqlx::PgPool;
use axum::Router;

pub mod leads;
pub mod conversations;
pub mod webhook;

pub fn api_routes(db: PgPool) -> Router {
    Router::new()
        .merge(leads::routes(db.clone()))
        .merge(conversations::routes(db.clone()))
        .merge(webhook::routes(db))
}
