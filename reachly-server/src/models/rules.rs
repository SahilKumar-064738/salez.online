use serde::Serialize;

#[derive(Serialize)]
pub struct FollowUpRuleDto {
    pub id: i64,
    pub user_id: i64,
    pub delay_hours: i64,
    pub template_id: i64,
    pub order: i64,
}
