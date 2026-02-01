use axum::{extract::State, Json};
use sqlx::PgPool;

use crate::db::templates::fetch_templates;
use crate::models::templates::TemplateDto;

pub async fn get_templates(
    State(db): State<PgPool>,
) -> Json<Vec<TemplateDto>> {
    Json(fetch_templates(&db).await)
}
