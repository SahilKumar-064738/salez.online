use sqlx::{PgPool, Row};
use crate::models::reminders::{ReminderDto, CreateReminderRequest};

pub async fn fetch_reminders(db: &PgPool) -> Vec<ReminderDto> {
    sqlx::query("SELECT id, lead_id, message, scheduled_at, sent, type, created_at FROM reminders ORDER BY scheduled_at ASC")
        .fetch_all(db).await.unwrap().into_iter().map(|r| ReminderDto {
            id: r.get("id"), lead_id: r.get("lead_id"), message: r.get("message"),
            scheduled_at: r.get("scheduled_at"), sent: r.get("sent"),
            reminder_type: r.get("type"), created_at: r.get("created_at"),
        }).collect()
}

pub async fn insert_reminder(db: &PgPool, req: &CreateReminderRequest) -> ReminderDto {
    let row = sqlx::query(
        "INSERT INTO reminders (lead_id,message,scheduled_at,type) VALUES ($1,$2,$3,$4) RETURNING id,lead_id,message,scheduled_at,sent,type,created_at"
    ).bind(req.lead_id).bind(&req.message).bind(&req.scheduled_at).bind(&req.reminder_type)
      .fetch_one(db).await.expect("insert reminder");
    ReminderDto {
        id: row.get("id"), lead_id: row.get("lead_id"), message: row.get("message"),
        scheduled_at: row.get("scheduled_at"), sent: row.get("sent"),
        reminder_type: row.get("type"), created_at: row.get("created_at"),
    }
}

pub async fn delete_reminder(db: &PgPool, id: i64) -> bool {
    sqlx::query("DELETE FROM reminders WHERE id = $1").bind(id).execute(db).await.unwrap().rows_affected() > 0
}
