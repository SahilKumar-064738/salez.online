use sqlx::{PgPool, Row};
use crate::models::templates::TemplateDto;

pub async fn fetch_templates(db: &PgPool) -> Vec<TemplateDto> {
    let rows = sqlx::query(
        "SELECT id, user_id, name, content, category FROM templates ORDER BY id ASC"
    )
    .fetch_all(db)
    .await
    .unwrap();

    rows.into_iter()
        .map(|r| TemplateDto {
            id: r.get("id"),
            user_id: r.get("user_id"),
            name: r.get("name"),
            content: r.get("content"),
            category: r.get("category"),
        })
        .collect()
}
