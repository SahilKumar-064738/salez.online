use sqlx::{PgPool, Row};
use crate::models::reminders::ReminderDto;

pub async fn fetch_reminders(db: &PgPool) -> Vec<ReminderDto> {
    let rows = sqlx::query(
        "SELECT id, lead_id, message, scheduled_at, sent, type, created_at FROM reminders ORDER BY scheduled_at ASC"
    )
    .fetch_all(db)
    .await
    .unwrap();

    rows.into_iter()
        .map(|r| ReminderDto {
            id: r.get("id"),
            lead_id: r.get("lead_id"),
            message: r.get("message"),
            scheduled_at: r.get("scheduled_at"),
            sent: r.get("sent"),
            reminder_type: r.get("type"),
            created_at: r.get("created_at"),
        })
        .collect()
}
