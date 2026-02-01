use tokio::net::TcpListener;
use dotenvy::dotenv;
use tracing_subscriber;

mod app;
mod db;
mod routes;
mod handlers;
mod models;
mod static_files;

use db::pool::create_pool;
use app::build_app;


#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let db = create_pool().await;
    let app = build_app(db);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("🚀 Server running on http://localhost:3000");

    axum::serve(listener, app).await.unwrap();
}
