use serde::Serialize;
use chrono::NaiveDateTime;

#[derive(Serialize)]
pub struct ReminderDto {
    pub id: i64,
    pub lead_id: i64,
    pub message: String,
    pub scheduled_at: NaiveDateTime,
    pub sent: bool,
    #[serde(rename = "type")]
    pub reminder_type: String,
    pub created_at: NaiveDateTime,
}
