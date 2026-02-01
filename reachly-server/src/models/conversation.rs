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

#[derive(Serialize)]
pub struct ConversationDto {
    pub id: Uuid,
    pub lead_id: Uuid,
    pub status: String,
    pub created_at: NaiveDateTime,
    pub messages: Vec<MessageDto>,
}
