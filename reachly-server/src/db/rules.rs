use sqlx::{PgPool, Row};
use crate::models::rules::FollowUpRuleDto;

pub async fn fetch_rules(db: &PgPool) -> Vec<FollowUpRuleDto> {
    let rows = sqlx::query(
        "SELECT id, user_id, delay_hours, template_id, \"order\" FROM follow_up_rules ORDER BY \"order\" ASC"
    )
    .fetch_all(db)
    .await
    .unwrap();

    rows.into_iter()
        .map(|r| FollowUpRuleDto {
            id: r.get("id"),
            user_id: r.get("user_id"),
            delay_hours: r.get("delay_hours"),
            template_id: r.get("template_id"),
            order: r.get("order"),
        })
        .collect()
}
