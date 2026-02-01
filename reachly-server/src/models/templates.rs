use serde::Serialize;

#[derive(Serialize)]
pub struct TemplateDto {
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub content: String,
    pub category: String,
}
