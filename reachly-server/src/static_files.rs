use axum::{Router, routing::get};
use tower_http::services::ServeDir;

pub fn static_routes() -> Router {
    Router::new()
        .nest_service("/", ServeDir::new("dist/public"))
        .fallback(get(|| async {
            axum::response::Html(
                tokio::fs::read_to_string("dist/public/index.html")
                    .await
                    .unwrap(),
            )
        }))
}
