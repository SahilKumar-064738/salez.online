use sqlx::PgPool;
use axum::Router;

pub mod leads;
pub mod conversations;
pub mod webhook;
pub mod templates;
pub mod rules;
pub mod reminders;

pub fn api_routes(db: PgPool) -> Router {
    Router::new()
        .merge(leads::routes(db.clone()))
        .merge(conversations::routes(db.clone()))
        .merge(webhook::routes(db.clone()))
        .merge(templates::routes(db.clone()))
        .merge(rules::routes(db.clone()))
        .merge(reminders::routes(db))
}
