use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::models::conversation::{ConversationDto, MessageDto};

pub async fn fetch_conversations(db: &PgPool) -> Vec<ConversationDto> {
    let conv_rows = sqlx::query(
        "SELECT id, lead_id, status, created_at FROM conversations ORDER BY created_at DESC"
    )
    .fetch_all(db)
    .await
    .unwrap();

    let mut conversations = Vec::new();

    for row in conv_rows {
        let conv_id: Uuid = row.get("id");

        let msg_rows = sqlx::query(
            "SELECT id, conversation_id, direction, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC"
        )
        .bind(conv_id)
        .fetch_all(db)
        .await
        .unwrap();

        let messages = msg_rows
            .into_iter()
            .map(|m| MessageDto {
                id: m.get("id"),
                conversation_id: m.get("conversation_id"),
                direction: m.get("direction"),
                content: m.get("content"),
                created_at: m.get("created_at"),
            })
            .collect();

        conversations.push(ConversationDto {
            id: conv_id,
            lead_id: row.get("lead_id"),
            status: row.get("status"),
            created_at: row.get("created_at"),
            messages,
        });
    }

    conversations
}

pub async fn fetch_conversation(db: &PgPool, id: Uuid) -> Option<ConversationDto> {
    let row = sqlx::query(
        "SELECT id, lead_id, status, created_at FROM conversations WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(db)
    .await
    .unwrap();

    match row {
        Some(conv) => {
            let msg_rows = sqlx::query(
                "SELECT id, conversation_id, direction, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC"
            )
            .bind(id)
            .fetch_all(db)
            .await
            .unwrap();

            let messages = msg_rows
                .into_iter()
                .map(|m| MessageDto {
                    id: m.get("id"),
                    conversation_id: m.get("conversation_id"),
                    direction: m.get("direction"),
                    content: m.get("content"),
                    created_at: m.get("created_at"),
                })
                .collect();

            Some(ConversationDto {
                id: conv.get("id"),
                lead_id: conv.get("lead_id"),
                status: conv.get("status"),
                created_at: conv.get("created_at"),
                messages,
            })
        }
        None => None,
    }
}

pub async fn create_outgoing_message(
    db: &PgPool,
    conversation_id: Uuid,
    content: &str,
) -> MessageDto {
    let row = sqlx::query(
        r#"
        INSERT INTO messages (conversation_id, direction, content, created_at)
        VALUES ($1, 'outgoing', $2, now())
        RETURNING id, conversation_id, direction, content, created_at
        "#
    )
    .bind(conversation_id)
    .bind(content)
    .fetch_one(db)
    .await
    .expect("Failed to insert outgoing message");

    MessageDto {
        id: row.get("id"),
        conversation_id: row.get("conversation_id"),
        direction: row.get("direction"),
        content: row.get("content"),
        created_at: row.get("created_at"),
    }
}
