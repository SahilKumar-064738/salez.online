use serde::{Serialize, Deserialize};
use chrono::NaiveDateTime;

#[derive(Serialize)]
pub struct LeadDto {
    pub id: i64, pub name: String, pub phone: String, pub status: String,
    pub last_contacted_at: Option<NaiveDateTime>, pub created_at: NaiveDateTime,
}

#[derive(Deserialize)]
pub struct CreateLeadRequest {
    pub name: String, pub phone: String,
    #[serde(default = "default_status")] pub status: String,
}

#[derive(Deserialize)]
pub struct UpdateLeadRequest {
    pub name: Option<String>, pub phone: Option<String>, pub status: Option<String>,
}

fn default_status() -> String { "new".to_string() }
