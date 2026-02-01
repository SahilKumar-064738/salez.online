use serde::{Serialize, Deserialize};

#[derive(Serialize)]
pub struct TemplateDto { pub id: i64, pub user_id: i64, pub name: String, pub content: String, pub category: String }

#[derive(Deserialize)]
pub struct CreateTemplateRequest { pub user_id: i64, pub name: String, pub content: String, pub category: String }

#[derive(Deserialize)]
pub struct UpdateTemplateRequest { pub name: Option<String>, pub content: Option<String>, pub category: Option<String> }
