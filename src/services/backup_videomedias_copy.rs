// src/services/videomedias.rs
use actix_web::{get, post, patch, delete, web::{self, Json, Path}, HttpResponse, Responder, web::Data};
use sqlx::PgPool;
use serde_json::json;
use uuid::Uuid;

use crate::models::{VideoMedia, CreateVideoMediaSchema, UpdateVideoMediaSchema}; // Verifique se essas structs estão definidas no models.rs

#[post("/videomedias")]
async fn create_video_media(
    body: Json<CreateVideoMediaSchema>,
    data: Data<PgPool>
) -> impl Responder {
    let query = r#"
        INSERT INTO video_media (video_id, video_path, status)
        VALUES ($1, $2, $3)
        RETURNING id, video_id, video_path, status
    "#;

    match sqlx::query_as::<_, VideoMedia>(query)
        .bind(&body.video_id)
        .bind(&body.video_path)
        .bind(&body.status)
        .fetch_one(&data)
        .await
    {
        Ok(video_media) => HttpResponse::Ok().json(json!({"status": "success", "video_media": video_media})),
        Err(error) => HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to create video media: {:?}", error)})),
    }
}

#[get("/videomedias")]
async fn get_all_video_media(data: Data<PgPool>) -> impl Responder {
    let query = "SELECT * FROM video_media ORDER BY id";

    match sqlx::query_as::<_, VideoMedia>(query).fetch_all(&data).await {
        Ok(videomedias) => HttpResponse::Ok().json(json!({"status": "success", "video_media": videomedias})),
        Err(error) => HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to get video media: {:?}", error)})),
    }
}

#[get("/videomedias/{id}")]
async fn get_video_media_by_id(
    path: Path<Uuid>,
    data: Data<PgPool>
) -> impl Responder {
    let video_media_id = path.into_inner();

    match sqlx::query_as!(VideoMedia, "SELECT * FROM video_media WHERE id = $1", video_media_id)
        .fetch_one(&data)
        .await
    {
        Ok(video_media) => HttpResponse::Ok().json(json!({"status": "success", "video_media": video_media})),
        Err(error) => HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to get video media: {:?}", error)})),
    }
}

#[patch("/videomedias/{id}")]
async fn update_video_media_by_id(
    path: Path<Uuid>,
    body: Json<UpdateVideoMediaSchema>,
    data: Data<PgPool>
) -> impl Responder {
    let video_media_id = path.into_inner();

    let query = r#"
        UPDATE video_media 
        SET video_path = COALESCE($1, video_path), 
            status = COALESCE($2, status) 
        WHERE id = $3 
        RETURNING *
    "#;

    match sqlx::query_as::<_, VideoMedia>(query)
        .bind(&body.video_path)
        .bind(&body.status)
        .bind(video_media_id)
        .fetch_one(&data)
        .await
    {
        Ok(updated_video_media) => HttpResponse::Ok().json(json!({"status": "success", "video_media": updated_video_media})),
        Err(error) => HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to update video media: {:?}", error)})),
    }
}

#[delete("/videomedias/{id}")]
async fn delete_video_media_by_id(
    path: Path<Uuid>,
    data: Data<PgPool>
) -> impl Responder {
    let video_media_id = path.into_inner();

    match sqlx::query!("DELETE FROM video_media WHERE id = $1", video_media_id)
        .execute(&data)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(error) => HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to delete video media: {:?}", error)})),
    }
}

pub fn config_video_media(cfg: &mut web::ServiceConfig) {
    cfg.service(create_video_media)
       .service(get_all_video_media)
       .service(get_video_media_by_id)
       .service(update_video_media_by_id)
       .service(delete_video_media_by_id);
}
