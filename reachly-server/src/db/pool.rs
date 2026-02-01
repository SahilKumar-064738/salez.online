use sqlx::PgPool;

pub async fn create_pool() -> PgPool {
    let url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL not set");

    PgPool::connect(&url)
        .await
        .expect("Failed to connect to Postgres")
}
