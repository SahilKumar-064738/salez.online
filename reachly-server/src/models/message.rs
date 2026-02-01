use serde::Serialize;
use uuid::Uuid;
use chrono::NaiveDateTime;

#[derive(Serialize)]
pub struct MessageDto {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub direction: String,
    pub content: String,
    pub created_at: NaiveDateTime,
}
