// src/services/videos.rs
use actix_web::{get, post, web::{Data, Json, Path}, HttpResponse, Responder, Scope};
use sqlx::PgPool;
use uuid::Uuid;
use lapin::{options::BasicPublishOptions, BasicProperties, Channel};
use serde_json::json;
use crate::models::video::{Video, CreateVideoSchema};

// Handler para criar um vídeo
#[post("/videos")]
async fn create_video(
    body: Json<CreateVideoSchema>,
    data: Data<AppState>,
    rabbitmq_channel: Data<Channel>, // Canal do RabbitMQ injetado
) -> impl Responder {
    let query = r#"
        INSERT INTO videos (title, description)
        VALUES ($1, $2)
        RETURNING id, title, description
    "#;

    match sqlx::query_as::<_, Video>(query)
        .bind(&body.title)
        .bind(&body.description)
        .fetch_one(&data.db)
        .await
    {
        Ok(video) => {
            // Publicar mensagem no RabbitMQ
            if let Err(err) = publish_video_to_queue(video.id, &rabbitmq_channel).await {
                eprintln!("Failed to publish message to RabbitMQ: {:?}", err);
                return HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": "Failed to notify transcoder."
                }));
            }

            HttpResponse::Ok().json(json!({
                "status": "success",
                "video": video
            }))
        },
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create video: {:?}", error)
        })),
    }
}

// Função para publicar a mensagem no RabbitMQ
async fn publish_video_to_queue(video_id: Uuid, channel: &Channel) -> Result<(), lapin::Error> {
    let video_message = json!({
        "video_id": video_id.to_string(),
        // Adicione outros campos que você deseja enviar, como caminho do vídeo, etc.
    });

    let payload = serde_json::to_vec(&video_message).unwrap();

    channel.basic_publish(
        "video_queue", // O nome da fila
        "", // Routing key
        BasicPublishOptions::default(),
        payload,
        BasicProperties::default(),
    ).await?;

    Ok(())
}

// Handler para obter todos os vídeos
#[get("/videos")]
async fn get_all_videos(data: Data<AppState>) -> impl Responder {
    let query = "SELECT * FROM videos ORDER BY id";

    match sqlx::query_as::<_, Video>(query).fetch_all(&data.db).await {
        Ok(videos) => HttpResponse::Ok().json(json!({"status": "success", "videos": videos})),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get videos: {:?}", error)
        })),
    }
}

// Handler para obter um vídeo por ID
#[get("/videos/{id}")]
async fn get_video_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let video_id = path.into_inner();

    match sqlx::query_as!(Video, "SELECT * FROM videos WHERE id = $1", video_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(video) => HttpResponse::Ok().json(json!({"status": "success", "video": video})),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get video: {:?}", error)
        })),
    }
}

// Handler para atualizar um vídeo por ID
#[patch("/videos/{id}")]
async fn update_video_by_id(
    path: Path<Uuid>,
    body: Json<UpdateVideoSchema>,
    data: Data<AppState>
) -> impl Responder {
    let video_id = path.into_inner();

    let query = r#"
        UPDATE videos SET title = COALESCE($1, title), description = COALESCE($2, description)
        WHERE id = $3 RETURNING *
    "#;

    match sqlx::query_as::<_, Video>(query)
        .bind(&body.title)
        .bind(&body.description)
        .bind(video_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(updated_video) => HttpResponse::Ok().json(json!({"status": "success", "video": updated_video})),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to update video: {:?}", error)
        })),
    }
}

// Handler para deletar um vídeo por ID
#[delete("/videos/{id}")]
async fn delete_video_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let video_id = path.into_inner();

    match sqlx::query!("DELETE FROM videos WHERE id = $1", video_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to delete video: {:?}", error)
        })),
    }
}

// Função de configuração dos serviços de vídeo
pub fn config_videos(cfg: &mut Scope) {
    cfg.service(create_video)
       .service(get_all_videos)
       .service(get_video_by_id)
       .service(update_video_by_id)
       .service(delete_video_by_id);
}
