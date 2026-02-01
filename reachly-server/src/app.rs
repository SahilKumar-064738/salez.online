use axum::Router;
use sqlx::PgPool;
use tower_http::cors::{CorsLayer, Any};

use crate::routes::api_routes;
use crate::static_files::static_routes;

pub fn build_app(db: PgPool) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let mut app = Router::new()
        .merge(api_routes(db))
        .layer(cors);

    if std::env::var("NODE_ENV").unwrap_or_default() == "production" {
        app = app.merge(static_routes());
    }

    app
}
