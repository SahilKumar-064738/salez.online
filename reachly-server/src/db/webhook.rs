use sqlx::{PgPool, Row};
use uuid::Uuid;

pub async fn get_default_business_id(db: &PgPool) -> Uuid {
    let row = sqlx::query("SELECT id FROM businesses LIMIT 1")
        .fetch_one(db)
        .await
        .unwrap();

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
    .unwrap();

    row.get("id")
}

pub async fn insert_inbound_message(
    db: &PgPool,
    lead_id: Uuid,
    content: &str,
) {
    sqlx::query(
        r#"
        INSERT INTO messages (lead_id, direction, content, sent_at)
        VALUES ($1, 'inbound', $2, now())
        "#
    )
    .bind(lead_id)
    .bind(content)
    .execute(db)
    .await
    .unwrap();
}
