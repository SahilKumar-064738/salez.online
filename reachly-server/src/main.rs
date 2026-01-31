use axum::{
    routing::{get, post},
    extract::State,
    Json, Router,
};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

use serde::{Deserialize, Serialize};
use serde_json::json;

use sqlx::{PgPool, Row};
use uuid::Uuid;

use dotenvy::dotenv;
use tracing_subscriber;

mod db;
use db::create_pool;

// =======================
// DTOs
// =======================

#[derive(Serialize)]
struct LeadDto {
    id: Uuid,
    phone_number: String,
    status: String,
    created_at: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
struct WebhookPayload {
    from: String,
    message: String,
}

// =======================
// MAIN
// =======================

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let db_pool = create_pool().await;
    println!("✅ Connected to PostgreSQL");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/leads", get(get_leads))
        .route("/webhook", post(webhook))
        .with_state(db_pool)
        .layer(cors);

    let listener = TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("🚀 Reachly server running at http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();
}

// =======================
// API HANDLERS
// =======================

async fn get_leads(
    State(db): State<PgPool>,
) -> Json<Vec<LeadDto>> {
    let rows = sqlx::query(
        r#"
        SELECT id, phone_number, status, created_at
        FROM leads
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&db)
    .await
    .expect("Failed to fetch leads");

    let leads = rows
        .into_iter()
        .map(|row| LeadDto {
            id: row.get("id"),
            phone_number: row.get("phone_number"),
            status: row.get("status"),
            created_at: row.get("created_at"),
        })
        .collect();

    Json(leads)
}

async fn webhook(
    State(db): State<PgPool>,
    Json(payload): Json<WebhookPayload>,
) -> Json<serde_json::Value> {
    let business_id = get_default_business_id(&db).await;
    let lead_id = upsert_lead(&db, business_id, &payload.from).await;

    insert_message(&db, lead_id, "inbound", &payload.message).await;
    update_lead_inbound(&db, lead_id).await;

    Json(json!({ "received": true }))
}

// =======================
// DB HELPERS
// =======================

async fn get_default_business_id(db: &PgPool) -> Uuid {
    let row = sqlx::query("SELECT id FROM businesses LIMIT 1")
        .fetch_one(db)
        .await
        .expect("No business found");

    row.get("id")
}

async fn upsert_lead(
    db: &PgPool,
    business_id: Uuid,
    phone: &str,
) -> Uuid {
    let row = sqlx::query(
        r#"
        INSERT INTO leads (business_id, phone_number)
        VALUES ($1, $2)
        ON CONFLICT (business_id, phone_number)
        DO UPDATE SET automation_paused = false
        RETURNING id
        "#
    )
    .bind(business_id)
    .bind(phone)
    .fetch_one(db)
    .await
    .expect("Failed to upsert lead");

    row.get("id")
}

async fn insert_message(
    db: &PgPool,
    lead_id: Uuid,
    direction: &str,
    content: &str,
) {
    sqlx::query(
        r#"
        INSERT INTO messages (lead_id, direction, content, sent_at)
        VALUES ($1, $2, $3, now())
        "#
    )
    .bind(lead_id)
    .bind(direction)
    .bind(content)
    .execute(db)
    .await
    .expect("Failed to insert message");
}

async fn update_lead_inbound(db: &PgPool, lead_id: Uuid) {
    sqlx::query(
        r#"
        UPDATE leads
        SET last_inbound_at = now(),
            automation_paused = true
        WHERE id = $1
        "#
    )
    .bind(lead_id)
    .execute(db)
    .await
    .expect("Failed to update lead");
}
