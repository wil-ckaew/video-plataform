// src/services/chat_rooms.rs
use actix_web::{get, post, delete, patch, web::{Data, Json, Path, Query, ServiceConfig}, HttpResponse, Responder};
use serde_json::json;
use uuid::Uuid;

use crate::{
    models::ChatRoomModel,
    schema::{CreateChatRoomSchema, UpdateChatRoomSchema, FilterOptions},
    AppState
};

#[post("/chat_rooms")]
async fn create_chat_room(
    body: Json<CreateChatRoomSchema>,
    data: Data<AppState>
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
        Err(err) => HttpResponse::InternalServerError().json(json!({ "status": "error", "message": format!("{:?}", err) }))
    }
}

#[get("/chat_rooms")]
async fn get_all_chat_rooms(
    opts: Query<FilterOptions>,
    data: Data<AppState>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(ChatRoomModel, "SELECT * FROM chat_rooms ORDER BY created_at DESC LIMIT $1 OFFSET $2", limit as i32, offset as i32)
        .fetch_all(&data.db)
        .await
    {
        Ok(rooms) => HttpResponse::Ok().json(json!({ "status": "success", "chat_rooms": rooms })),
        Err(err) => HttpResponse::InternalServerError().json(json!({ "status": "error", "message": format!("{:?}", err) }))
    }
}

#[get("/chat_rooms/{id}")]
async fn get_chat_room_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let id = path.into_inner();

    match sqlx::query_as!(ChatRoomModel, "SELECT * FROM chat_rooms WHERE id = $1", id)
        .fetch_one(&data.db)
        .await
    {
        Ok(room) => HttpResponse::Ok().json(json!({ "status": "success", "chat_room": room })),
        Err(err) => HttpResponse::NotFound().json(json!({ "status": "error", "message": format!("{:?}", err) }))
    }
}

#[patch("/chat_rooms/{id}")]
async fn update_chat_room_by_id(
    path: Path<Uuid>,
    body: Json<UpdateChatRoomSchema>,
    data: Data<AppState>
) -> impl Responder {
    let id = path.into_inner();

    let query = r#"
        UPDATE chat_rooms
        SET name = COALESCE($1, name), is_group = COALESCE($2, is_group)
        WHERE id = $3
        RETURNING id, name, is_group, created_at
    "#;

    match sqlx::query_as::<_, ChatRoomModel>(query)
        .bind(&body.name)
        .bind(body.is_group)
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(room) => HttpResponse::Ok().json(json!({ "status": "success", "chat_room": room })),
        Err(err) => HttpResponse::InternalServerError().json(json!({ "status": "error", "message": format!("{:?}", err) }))
    }
}

#[delete("/chat_rooms/{id}")]
async fn delete_chat_room_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let id = path.into_inner();

    match sqlx::query!("DELETE FROM chat_rooms WHERE id = $1", id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => HttpResponse::InternalServerError().json(json!({ "status": "error", "message": format!("{:?}", err) }))
    }
}

pub fn config_chat_rooms(cfg: &mut ServiceConfig) {
    cfg.service(create_chat_room)
       .service(get_all_chat_rooms)
       .service(get_chat_room_by_id)
       .service(update_chat_room_by_id)
       .service(delete_chat_room_by_id);
}
