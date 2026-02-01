use sqlx::{PgPool, Row};
use crate::models::leads::{LeadDto, CreateLeadRequest};

pub async fn fetch_leads(db: &PgPool) -> Vec<LeadDto> {
    let rows = sqlx::query(
        "SELECT id, name, phone, status, last_contacted_at, created_at FROM leads ORDER BY created_at DESC"
    )
    .fetch_all(db)
    .await
    .unwrap();

    rows.into_iter()
        .map(|r| LeadDto {
            id: r.get("id"),
            name: r.get("name"),
            phone: r.get("phone"),
            status: r.get("status"),
            last_contacted_at: r.get("last_contacted_at"),
            created_at: r.get("created_at"),
        })
        .collect()
}

pub async fn insert_lead(db: &PgPool, lead: &CreateLeadRequest) -> LeadDto {
    let row = sqlx::query(
        r#"
        INSERT INTO leads (name, phone, status)
        VALUES ($1, $2, $3)
        RETURNING id, name, phone, status, last_contacted_at, created_at
        "#
    )
    .bind(&lead.name)
    .bind(&lead.phone)
    .bind(&lead.status)
    .fetch_one(db)
    .await
    .expect("Failed to insert lead");

    LeadDto {
        id: row.get("id"),
        name: row.get("name"),
        phone: row.get("phone"),
        status: row.get("status"),
        last_contacted_at: row.get("last_contacted_at"),
        created_at: row.get("created_at"),
    }
}
