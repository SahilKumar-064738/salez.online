use axum::{Router, routing::{get, post}};
use sqlx::PgPool;
use crate::handlers::auth::{login, signup, me, logout};

pub fn routes(db: PgPool) -> Router {
    Router::new()
        .route("/api/auth/login",  post(login))
        .route("/api/auth/signup", post(signup))
        .route("/api/auth/me",     get(me))
        .route("/api/auth/logout", post(logout))
        .with_state(db)
}
