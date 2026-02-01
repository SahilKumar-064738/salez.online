use crate::models::auth::UserDto;
use sqlx::{PgPool, Row, Error};

pub async fn find_user_by_email(db: &PgPool, email: &str) -> Option<(UserDto, String)> {
    let row = sqlx::query(
        "SELECT id, email, name, company_name, password, created_at FROM users WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(db)
    .await
    .unwrap();

    row.map(|r| {
        (UserDto {
            id: r.get("id"),
            email: r.get("email"),
            name: r.get("name"),
            company_name: r.get("company_name"),
            created_at: r.get("created_at"),
        }, r.get::<String, _>("password"))
    })
}


pub async fn insert_user(
    db: &PgPool,
    name: &str,
    company_name: &str,
    email: &str,
    hashed_password: &str,
) -> Result<UserDto, String> {
    let result = sqlx::query(
        "INSERT INTO users (name, company_name, email, password)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, company_name, created_at"
    )
    .bind(name)
    .bind(company_name)
    .bind(email)
    .bind(hashed_password)
    .fetch_one(db)
    .await;

    match result {
        Ok(row) => Ok(UserDto {
            id: row.get("id"),
            email: row.get("email"),
            name: row.get("name"),
            company_name: row.get("company_name"),
            created_at: row.get("created_at"),
        }),

        Err(Error::Database(db_err)) => {
            // ✅ ONLY catch duplicate email
            if db_err.constraint() == Some("users_email_key") {
                Err("Email already exists".to_string())
            } else {
                Err(format!("Database error: {}", db_err))
            }
        }

        Err(err) => Err(format!("Unexpected error: {}", err)),
    }
}


pub async fn create_session(db: &PgPool, token: &str, user_id: i64) {
    sqlx::query("INSERT INTO sessions (token, user_id) VALUES ($1, $2)")
        .bind(token).bind(user_id).execute(db).await.unwrap();
}

pub async fn get_user_by_session(db: &PgPool, token: &str) -> Option<UserDto> {
    let row = sqlx::query(
        "SELECT u.id, u.email, u.name, u.company_name, u.created_at \
         FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1"
    )
    .bind(token)
    .fetch_optional(db)
    .await
    .unwrap();

    row.map(|r| UserDto {
        id: r.get("id"), email: r.get("email"), name: r.get("name"),
        company_name: r.get("company_name"), created_at: r.get("created_at"),
    })
}

pub async fn delete_session(db: &PgPool, token: &str) {
    sqlx::query("DELETE FROM sessions WHERE token = $1")
        .bind(token).execute(db).await.unwrap();
}
