use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder,
};
use serde_json::json;
use uuid::Uuid;

use crate::{
    AppState,
    models::MessageModel,
    schema::{CreateMessageSchema, UpdateMessageSchema, FilterOptions},
};

/// Criar nova mensagem
#[post("/messages")]
async fn create_message(
    body: Json<CreateMessageSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let query = r#"
        INSERT INTO messages (room_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, room_id, sender_id, content, sent_at
    "#;

    match sqlx::query_as::<_, MessageModel>(query)
        .bind(body.room_id)
        .bind(body.sender_id)
        .bind(&body.content)
        .fetch_one(&data.db)
        .await
    {
        Ok(message) => HttpResponse::Created().json(json!({
            "status": "success",
            "message": message
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Error creating message: {:?}", e)
        })),
    }
}

/// Buscar todas as mensagens
#[get("/messages")]
async fn get_all_messages(
    opts: Query<FilterOptions>,
    data: Data<AppState>,
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    let query = r#"
        SELECT id, room_id, sender_id, content, sent_at
        FROM messages
        ORDER BY sent_at DESC
        LIMIT $1 OFFSET $2
    "#;

    match sqlx::query_as::<_, MessageModel>(query)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&data.db)
        .await
    {
        Ok(messages) => HttpResponse::Ok().json(json!({
            "status": "success",
            "messages": messages
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Error fetching messages: {:?}", e)
        })),
    }
}

/// Buscar mensagem por ID
#[get("/messages/{id}")]
async fn get_message_by_id(
    path: Path<Uuid>,
    data: Data<AppState>,
) -> impl Responder {
    let id = path.into_inner();

    let query = r#"
        SELECT id, room_id, sender_id, content, sent_at
        FROM messages
        WHERE id = $1
    "#;

    match sqlx::query_as::<_, MessageModel>(query)
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(message) => HttpResponse::Ok().json(json!({
            "status": "success",
            "message": message
        })),
        Err(e) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": format!("Message not found: {:?}", e)
        })),
    }
}

/// Atualizar uma mensagem
#[patch("/messages/{id}")]
async fn update_message_by_id(
    path: Path<Uuid>,
    body: Json<UpdateMessageSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let id = path.into_inner();

    let query = r#"
        UPDATE messages
        SET content = COALESCE($1, content)
        WHERE id = $2
        RETURNING id, room_id, sender_id, content, sent_at
    "#;

    match sqlx::query_as::<_, MessageModel>(query)
        .bind(body.content.as_ref())
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(updated) => HttpResponse::Ok().json(json!({
            "status": "success",
            "message": updated
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to update message: {:?}", e)
        })),
    }
}

/// Deletar uma mensagem
#[delete("/messages/{id}")]
async fn delete_message_by_id(
    path: Path<Uuid>,
    data: Data<AppState>,
) -> impl Responder {
    let id = path.into_inner();

    match sqlx::query!("DELETE FROM messages WHERE id = $1", id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to delete message: {:?}", e)
        })),
    }
}

/// Registrar todas as rotas do módulo messages
pub fn config_messages(cfg: &mut ServiceConfig) {
    cfg.service(create_message)
        .service(get_all_messages)
        .service(get_message_by_id)
        .service(update_message_by_id)
        .service(delete_message_by_id);
}
