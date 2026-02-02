use sqlx::{PgPool, Row};
use crate::models::rules::{FollowUpRuleDto, CreateRuleRequest};

pub async fn fetch_rules(db: &PgPool, user_id: i64) -> Vec<FollowUpRuleDto> {
    sqlx::query(
        r#"
        SELECT id, user_id, delay_hours, template_id, "order"
        FROM follow_up_rules
        WHERE user_id = $1
        ORDER BY "order" ASC
        "#
    )
    .bind(user_id)
    .fetch_all(db)
    .await
    .unwrap()
    .into_iter()
    .map(|r| FollowUpRuleDto {
        id: r.get("id"),
        user_id: r.get("user_id"),
        delay_hours: r.get("delay_hours"),
        template_id: r.get("template_id"),
        order: r.get("order"),
    })
    .collect()
}


pub async fn insert_rule(db: &PgPool, user_id: i64, req: &CreateRuleRequest) -> FollowUpRuleDto {

    let row = sqlx::query(
        r#"INSERT INTO follow_up_rules (user_id,delay_hours,template_id,"order") VALUES ($1,$2,$3,$4) RETURNING id,user_id,delay_hours,template_id,"order""#
    ).bind(user_id).bind(req.delay_hours).bind(req.template_id).bind(req.order)
      .fetch_one(db).await.expect("insert rule");
    FollowUpRuleDto { id: row.get("id"), user_id: row.get("user_id"), delay_hours: row.get("delay_hours"), template_id: row.get("template_id"), order: row.get("order") }
}

pub async fn delete_rule(db: &PgPool, user_id: i64, id: i64) -> bool {
    sqlx::query(
        "DELETE FROM follow_up_rules WHERE id = $1 AND user_id = $2"
    )
    .bind(id)
    .bind(user_id)
    .execute(db)
    .await
    .unwrap()
    .rows_affected() > 0
}
