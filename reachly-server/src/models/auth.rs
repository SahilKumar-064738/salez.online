use serde::{Serialize, Deserialize};
use chrono::NaiveDateTime;

#[derive(Serialize, Clone)]
pub struct UserDto {
    pub id:           i64,
    pub email:        String,
    pub name:         String,
    pub company_name: Option<String>,
    pub created_at:   NaiveDateTime,
}

#[derive(Deserialize)]
pub struct LoginRequest  { pub email: String, pub password: String }

#[derive(Deserialize)]
pub struct SignupRequest { pub name: String, pub company_name: String, pub email: String, pub password: String }
