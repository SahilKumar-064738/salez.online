use serde::Serialize;
use uuid::Uuid;
use chrono::NaiveDateTime;

#[derive(Serialize)]
pub struct LeadDto {
    pub id: Uuid,
    pub phone_number: String,
    pub status: String,
    pub created_at: NaiveDateTime,
}
