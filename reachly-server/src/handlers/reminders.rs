use axum::{extract::State, Json};
use sqlx::PgPool;

use crate::db::reminders::fetch_reminders;
use crate::models::reminders::ReminderDto;

pub async fn get_reminders(
    State(db): State<PgPool>,
) -> Json<Vec<ReminderDto>> {
    Json(fetch_reminders(&db).await)
}
