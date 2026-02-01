use axum::{extract::{State, Path}, Json, http::StatusCode};
use sqlx::PgPool;
use crate::db::reminders::*;
use crate::models::reminders::*;

pub async fn get_reminders(State(db): State<PgPool>) -> Json<Vec<ReminderDto>> { Json(fetch_reminders(&db).await) }

pub async fn create_reminder(State(db): State<PgPool>, Json(p): Json<CreateReminderRequest>) -> (StatusCode, Json<ReminderDto>) {
    (StatusCode::CREATED, Json(insert_reminder(&db, &p).await))
}

pub async fn delete_reminder_handler(State(db): State<PgPool>, Path(id): Path<i64>) -> StatusCode {
    if delete_reminder(&db, id).await { StatusCode::NO_CONTENT } else { StatusCode::NOT_FOUND }
}
