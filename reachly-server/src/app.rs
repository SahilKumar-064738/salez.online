use axum::Router;
use axum::http::{HeaderValue, header, Method};
use sqlx::PgPool;
use tower_http::cors::CorsLayer;

use crate::routes::api_routes;
use crate::static_files::static_routes;

pub fn build_app(db: PgPool) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(HeaderValue::from_static("http://localhost:5173"))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
        ])
        .allow_credentials(true);

    let mut app = Router::new()
        .merge(api_routes(db))
        .layer(cors);

    if std::env::var("NODE_ENV").unwrap_or_default() == "production" {
        app = app.merge(static_routes());
    }

    app
}
