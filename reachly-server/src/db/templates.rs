use sqlx::{PgPool, Row};
use crate::models::templates::{TemplateDto, CreateTemplateRequest, UpdateTemplateRequest};

pub async fn fetch_templates(db: &PgPool, user_id: i64) -> Vec<TemplateDto> {
    sqlx::query(
        "SELECT id, user_id, name, content, category
         FROM templates
         WHERE user_id = $1
         ORDER BY id ASC"
    )
    .bind(user_id)
    .fetch_all(db)
    .await
    .unwrap()
    .into_iter()
    .map(|r| TemplateDto {
        id: r.get("id"),
        user_id: r.get("user_id"),
        name: r.get("name"),
        content: r.get("content"),
        category: r.get("category"),
    })
    .collect()
}


pub async fn insert_template(db: &PgPool,user_id: i64,req: &CreateTemplateRequest) -> TemplateDto {

    let row = sqlx::query(
        "INSERT INTO templates (user_id,name,content,category) VALUES ($1,$2,$3,$4) RETURNING id,user_id,name,content,category"
    ).bind(user_id).bind(&req.name).bind(&req.content).bind(&req.category)
      .fetch_one(db).await.expect("insert template");
    TemplateDto { id: row.get("id"), user_id: row.get("user_id"), name: row.get("name"), content: row.get("content"), category: row.get("category") }
}

pub async fn update_template(
    db: &PgPool,
    user_id: i64,
    id: i64,
    req: &UpdateTemplateRequest,
) -> Option<TemplateDto> {
    let row = match (req.name.as_ref(), req.content.as_ref(), req.category.as_ref()) {

        (Some(n), Some(c), Some(cat)) =>
            sqlx::query(
                "UPDATE templates
                 SET name=$1, content=$2, category=$3
                 WHERE id=$4 AND user_id=$5
                 RETURNING id, user_id, name, content, category"
            )
            .bind(n).bind(c).bind(cat).bind(id).bind(user_id)
            .fetch_optional(db).await.unwrap(),

        (Some(n), Some(c), None) =>
            sqlx::query(
                "UPDATE templates
                 SET name=$1, content=$2
                 WHERE id=$3 AND user_id=$4
                 RETURNING id, user_id, name, content, category"
            )
            .bind(n).bind(c).bind(id).bind(user_id)
            .fetch_optional(db).await.unwrap(),

        (Some(n), None, Some(cat)) =>
            sqlx::query(
                "UPDATE templates
                 SET name=$1, category=$2
                 WHERE id=$3 AND user_id=$4
                 RETURNING id, user_id, name, content, category"
            )
            .bind(n).bind(cat).bind(id).bind(user_id)
            .fetch_optional(db).await.unwrap(),

        (None, Some(c), Some(cat)) =>
            sqlx::query(
                "UPDATE templates
                 SET content=$1, category=$2
                 WHERE id=$3 AND user_id=$4
                 RETURNING id, user_id, name, content, category"
            )
            .bind(c).bind(cat).bind(id).bind(user_id)
            .fetch_optional(db).await.unwrap(),

        (Some(n), None, None) =>
            sqlx::query(
                "UPDATE templates
                 SET name=$1
                 WHERE id=$2 AND user_id=$3
                 RETURNING id, user_id, name, content, category"
            )
            .bind(n).bind(id).bind(user_id)
            .fetch_optional(db).await.unwrap(),

        (None, Some(c), None) =>
            sqlx::query(
                "UPDATE templates
                 SET content=$1
                 WHERE id=$2 AND user_id=$3
                 RETURNING id, user_id, name, content, category"
            )
            .bind(c).bind(id).bind(user_id)
            .fetch_optional(db).await.unwrap(),

        (None, None, Some(cat)) =>
            sqlx::query(
                "UPDATE templates
                 SET category=$1
                 WHERE id=$2 AND user_id=$3
                 RETURNING id, user_id, name, content, category"
            )
            .bind(cat).bind(id).bind(user_id)
            .fetch_optional(db).await.unwrap(),

        _ => return None,
    };

    row.map(|r| TemplateDto {
        id: r.get("id"),
        user_id: r.get("user_id"),
        name: r.get("name"),
        content: r.get("content"),
        category: r.get("category"),
    })
}


pub async fn delete_template(db: &PgPool, user_id: i64, id: i64) -> bool {
    sqlx::query(
        "DELETE FROM templates WHERE id = $1 AND user_id = $2"
    )
    .bind(id)
    .bind(user_id)
    .execute(db)
    .await
    .unwrap()
    .rows_affected() > 0
}
