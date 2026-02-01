use sqlx::{PgPool, Row};
use crate::models::leads::{LeadDto, CreateLeadRequest, UpdateLeadRequest};

pub async fn fetch_leads(db: &PgPool) -> Vec<LeadDto> {
    sqlx::query("SELECT id, name, phone, status, last_contacted_at, created_at FROM leads ORDER BY created_at DESC")
        .fetch_all(db).await.unwrap().into_iter().map(|r| LeadDto {
            id: r.get("id"), name: r.get("name"), phone: r.get("phone"),
            status: r.get("status"), last_contacted_at: r.get("last_contacted_at"), created_at: r.get("created_at"),
        }).collect()
}

pub async fn fetch_lead(db: &PgPool, id: i64) -> Option<LeadDto> {
    sqlx::query("SELECT id, name, phone, status, last_contacted_at, created_at FROM leads WHERE id = $1")
        .bind(id).fetch_optional(db).await.unwrap().map(|r| LeadDto {
            id: r.get("id"), name: r.get("name"), phone: r.get("phone"),
            status: r.get("status"), last_contacted_at: r.get("last_contacted_at"), created_at: r.get("created_at"),
        })
}

pub async fn insert_lead(db: &PgPool, lead: &CreateLeadRequest) -> LeadDto {
    let row = sqlx::query(
        "INSERT INTO leads (name, phone, status) VALUES ($1, $2, $3) \
         RETURNING id, name, phone, status, last_contacted_at, created_at"
    ).bind(&lead.name).bind(&lead.phone).bind(&lead.status)
      .fetch_one(db).await.expect("insert lead");
    LeadDto {
        id: row.get("id"), name: row.get("name"), phone: row.get("phone"),
        status: row.get("status"), last_contacted_at: row.get("last_contacted_at"), created_at: row.get("created_at"),
    }
}

pub async fn update_lead(db: &PgPool, id: i64, req: &UpdateLeadRequest) -> Option<LeadDto> {
    let row = match (req.name.as_ref(), req.phone.as_ref(), req.status.as_ref()) {
        (Some(n), Some(p), Some(s)) => sqlx::query("UPDATE leads SET name=$1,phone=$2,status=$3,last_contacted_at=now() WHERE id=$4 RETURNING id,name,phone,status,last_contacted_at,created_at").bind(n).bind(p).bind(s).bind(id).fetch_optional(db).await.unwrap(),
        (Some(n), Some(p), None)    => sqlx::query("UPDATE leads SET name=$1,phone=$2,last_contacted_at=now() WHERE id=$3 RETURNING id,name,phone,status,last_contacted_at,created_at").bind(n).bind(p).bind(id).fetch_optional(db).await.unwrap(),
        (Some(n), None, Some(s))    => sqlx::query("UPDATE leads SET name=$1,status=$2,last_contacted_at=now() WHERE id=$3 RETURNING id,name,phone,status,last_contacted_at,created_at").bind(n).bind(s).bind(id).fetch_optional(db).await.unwrap(),
        (None, Some(p), Some(s))    => sqlx::query("UPDATE leads SET phone=$1,status=$2,last_contacted_at=now() WHERE id=$3 RETURNING id,name,phone,status,last_contacted_at,created_at").bind(p).bind(s).bind(id).fetch_optional(db).await.unwrap(),
        (Some(n), None, None)       => sqlx::query("UPDATE leads SET name=$1,last_contacted_at=now() WHERE id=$2 RETURNING id,name,phone,status,last_contacted_at,created_at").bind(n).bind(id).fetch_optional(db).await.unwrap(),
        (None, Some(p), None)       => sqlx::query("UPDATE leads SET phone=$1,last_contacted_at=now() WHERE id=$2 RETURNING id,name,phone,status,last_contacted_at,created_at").bind(p).bind(id).fetch_optional(db).await.unwrap(),
        (None, None, Some(s))       => sqlx::query("UPDATE leads SET status=$1,last_contacted_at=now() WHERE id=$2 RETURNING id,name,phone,status,last_contacted_at,created_at").bind(s).bind(id).fetch_optional(db).await.unwrap(),
        _                           => return fetch_lead(db, id).await,
    };
    row.map(|r| LeadDto {
        id: r.get("id"), name: r.get("name"), phone: r.get("phone"),
        status: r.get("status"), last_contacted_at: r.get("last_contacted_at"), created_at: r.get("created_at"),
    })
}

pub async fn delete_lead(db: &PgPool, id: i64) -> bool {
    sqlx::query("DELETE FROM leads WHERE id = $1").bind(id).execute(db).await.unwrap().rows_affected() > 0
}
