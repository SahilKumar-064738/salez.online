use sqlx::{PgPool, Row};
use crate::models::leads::LeadDto;

pub async fn fetch_leads(db: &PgPool) -> Vec<LeadDto> {
    let rows = sqlx::query(
        "SELECT id, phone_number, status, created_at FROM leads ORDER BY created_at DESC"
    )
    .fetch_all(db)
    .await
    .unwrap();

    rows.into_iter()
        .map(|r| LeadDto {
            id: r.get("id"),
            phone_number: r.get("phone_number"),
            status: r.get("status"),
            created_at: r.get("created_at"),
        })
        .collect()
}
use uuid::Uuid;

pub async fn get_default_business_id(db: &PgPool) -> Uuid {
    let row = sqlx::query("SELECT id FROM businesses LIMIT 1")
        .fetch_one(db)
        .await
        .expect("No business found");

    row.get("id")
}

pub async fn upsert_lead(
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

pub async fn insert_inbound_message(
    db: &PgPool,
    lead_id: Uuid,
    content: &str,
) {
    sqlx::query(
        r#"
        INSERT INTO messages (lead_id, direction, content, created_at)
        VALUES ($1, 'inbound', $2, now())
        "#
    )
    .bind(lead_id)
    .bind(content)
    .execute(db)
    .await
    .expect("Failed to insert inbound message");
}
