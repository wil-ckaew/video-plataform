//backend/src/services/chat.rs
use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder,
};
use uuid::Uuid;
use serde_json::json;

use crate::{
    AppState,
    models::{ChatRoomModel, MessageModel},
    schema::{CreateChatRoomSchema, UpdateChatRoomSchema, CreateMessageSchema, UpdateMessageSchema, FilterOptions},
};

/// Criar sala de chat
#[post("/chat_rooms")]
async fn create_chat_room(
    data: Data<AppState>,
    body: Json<CreateChatRoomSchema>
) -> impl Responder {
    let query = r#"
        INSERT INTO chat_rooms (name, is_group)
        VALUES ($1, $2)
        RETURNING id, name, is_group, created_at
    "#;

    match sqlx::query_as::<_, ChatRoomModel>(query)
        .bind(&body.name)
        .bind(body.is_group)
        .fetch_one(&data.db)
        .await
    {
        Ok(room) => HttpResponse::Created().json(json!({ "status": "success", "chat_room": room })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create chat room: {:?}", e)
        })),
    }
}

/// Listar salas de chat
#[get("/chat_rooms")]
async fn get_chat_rooms(
    data: Data<AppState>,
    opts: Query<FilterOptions>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    let query = r#"
        SELECT id, name, is_group, created_at
        FROM chat_rooms
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    "#;

    match sqlx::query_as::<_, ChatRoomModel>(query)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&data.db)
        .await
    {
        Ok(rooms) => HttpResponse::Ok().json(json!({ "status": "success", "chat_rooms": rooms })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get chat rooms: {:?}", e)
        })),
    }
}

/// Criar mensagem
#[post("/messages")]
async fn create_message(
    data: Data<AppState>,
    body: Json<CreateMessageSchema>
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
        Ok(message) => HttpResponse::Created().json(json!({ "status": "success", "message": message })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create message: {:?}", e)
        })),
    }
}

/// Listar mensagens de uma sala
#[get("/messages/{room_id}")]
async fn get_messages_by_room(
    data: Data<AppState>,
    path: Path<Uuid>
) -> impl Responder {
    let room_id = path.into_inner();

    let query = r#"
        SELECT id, room_id, sender_id, content, sent_at
        FROM messages
        WHERE room_id = $1
        ORDER BY sent_at ASC
    "#;

    match sqlx::query_as::<_, MessageModel>(query)
        .bind(room_id)
        .fetch_all(&data.db)
        .await
    {
        Ok(messages) => HttpResponse::Ok().json(json!({ "status": "success", "messages": messages })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get messages: {:?}", e)
        })),
    }
}

/// Atualizar mensagem
#[patch("/messages/{id}")]
async fn update_message(
    data: Data<AppState>,
    path: Path<Uuid>,
    body: Json<UpdateMessageSchema>
) -> impl Responder {
    let id = path.into_inner();

    let query = r#"
        UPDATE messages
        SET content = COALESCE($1, content)
        WHERE id = $2
        RETURNING id, room_id, sender_id, content, sent_at
    "#;

    match sqlx::query_as::<_, MessageModel>(query)
        .bind(&body.content)
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(message) => HttpResponse::Ok().json(json!({ "status": "success", "message": message })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to update message: {:?}", e)
        })),
    }
}

/// Deletar mensagem
#[delete("/messages/{id}")]
async fn delete_message(
    data: Data<AppState>,
    path: Path<Uuid>
) -> impl Responder {
    let id = path.into_inner();

    let query = "DELETE FROM messages WHERE id = $1";

    match sqlx::query(query)
        .bind(id)
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

/// Configuração das rotas
pub fn config_chat(cfg: &mut ServiceConfig) {
    cfg.service(create_chat_room)
       .service(get_chat_rooms)
       .service(create_message)
       .service(get_messages_by_room)
       .service(update_message)
       .service(delete_message);
}
