use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Query, Path, ServiceConfig},
    HttpResponse, Responder,
};
use lapin::{options::BasicPublishOptions, BasicProperties, Channel};
use serde_json::json;
use crate::{
    models::VideoModel,
    schema::{CreateVideoSchema, UpdateVideoSchema, FilterOptions},
    AppState
};
use sqlx::PgPool;
use uuid::Uuid;
use chrono::{Utc, NaiveDateTime};  // Importando NaiveDateTime

// Gera o caminho dinâmico para o thumbnail com base no ID do vídeo
fn generate_thumbnail_path(video_id: Uuid) -> String {
    format!("/media/thumbnails/video-test/{}/thumbnail.jpg", video_id)
}

#[post("/videos")]
async fn create_video(
    body: Json<CreateVideoSchema>,
    data: Data<AppState>,
    rabbitmq_channel: Data<Channel>,
) -> impl Responder {
    let query = r#"
        INSERT INTO videos (title, description, thumbnail_path, slug, published_at, 
            is_published, num_likes, num_views, author_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title, description, thumbnail_path, slug, 
              published_at, is_published, num_likes, num_views, author_id, video_date
    "#;

    match sqlx::query_as::<_, VideoModel>(query)
       // .bind(body.user_id)
        .bind(&body.title)
        .bind(&body.description)
        .bind(&body.thumbnail_path)
        .bind(&body.slug)
        .bind(&body.published_at)
        .bind(&body.is_published) // Definindo valor padrão como `false`
        .bind(&body.num_likes)        // Definindo valor padrão como `0`
        .bind(&body.num_views)        // Definindo valor padrão como `0`
        .bind(&body.author_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(video) => {
            // Publicar mensagem no RabbitMQ
            if let Err(err) = publish_video_to_queue(&video.id, &rabbitmq_channel).await {
                eprintln!("Failed to publish message to RabbitMQ: {:?}", err);
                return HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": "Failed to notify transcoder."
                }));
            }
            let response = json!({
                "status": "success",
                "video": {
                    "id": video.id,
                    "title": video.title,
                    "description": video.description,
                    "thumbnail_path": video.thumbnail_path,
                    "slug": video.slug,
                    "published_at": video.published_at,
                    "is_published": video.is_published,
                    "num_likes": video.num_likes,
                    "num_views": video.num_views,
                    "author_id": video.author_id,
                    "video_date": video.video_date
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to create video: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}
/*
// Handler para criar um vídeo
#[post("/videos")]
async fn create_video(
    body: Json<CreateVideoSchema>,
    data: Data<AppState>,
    rabbitmq_channel: Data<Channel>,
) -> impl Responder {
    let query = r#"
    INSERT INTO videos (
        title, description, thumbnail_path, slug, published_at, 
        is_published, num_likes, num_views, author_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, title, description, thumbnail_path, slug, 
              published_at, is_published, num_likes, num_views, author_id, video_date
"#;

match sqlx::query_as::<_, VideoModel>(query)
        .bind(&body.title)
        .bind(&body.description)
        .bind(&body.thumbnail_path)
        .bind(&body.slug)
        .bind(&body.published_at)
        .bind(&body.is_published) // Definindo valor padrão como `false`
        .bind(&body.num_likes)        // Definindo valor padrão como `0`
        .bind(&body.num_views)        // Definindo valor padrão como `0`
        .bind(body.author_id)
        //.bind(body.video_date.unwrap_or_else(|| Utc::now().naive_utc())) // Converte para NaiveDateTime
        .fetch_one(&data.db)
        .await
    {
        Ok(video) => {
            // Publicar mensagem no RabbitMQ
            if let Err(err) = publish_video_to_queue(&video.id, &rabbitmq_channel).await {
                eprintln!("Failed to publish message to RabbitMQ: {:?}", err);
                return HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": "Failed to notify transcoder."
                }));
            }

            // Formatar a resposta JSON incluindo os detalhes do vídeo
            let response = json!({
                "status": "success",
                "video": {
                    "id": video.id,
                    "title": video.title,
                    "description": video.description,
                    "thumbnail_path": video.thumbnail_path,
                    "slug": video.slug,
                    "published_at": video.published_at,
                    "is_published": video.is_published,
                    "num_likes": video.num_likes,
                    "num_views": video.num_views,
                    "author_id": video.author_id,
                    "video_date": video.video_date
                }
            });

            HttpResponse::Ok().json(response)
        },
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create video: {:?}", error)
        })),
    }
}

*/
/*
// Handler para criar um vídeo
#[post("/videos")]
async fn create_video(
    body: Json<CreateVideoSchema>,
    data: Data<AppState>,
    rabbitmq_channel: Data<Channel>,
) -> impl Responder {
    let query = r#"
    INSERT INTO videos (
        title, description, thumbnail_path, slug, published_at, 
        is_published, num_likes, num_views, author_id, video_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, title, description, thumbnail_path, slug, 
              published_at, is_published, num_likes, num_views, author_id, video_date
"#;

    match sqlx::query_as::<_, VideoModel>(query)
        .bind(&body.title)
        .bind(&body.description)
        .bind(&body.thumbnail_path)
        .bind(&body.slug)
        .bind(body.published_at)
        .bind(body.is_published.unwrap_or(false)) // Definindo valor padrão como `false`
        .bind(body.num_likes.unwrap_or(0))        // Definindo valor padrão como `0`
        .bind(body.num_views.unwrap_or(0))        // Definindo valor padrão como `0`
        .bind(body.author_id)
        .bind(body.video_date.unwrap_or_else(|| chrono::Utc::now())) // Valor padrão para `video_date`
        .fetch_one(&data.db)
        .await
    {
        Ok(video) => {
            // Publicar mensagem no RabbitMQ
            if let Err(err) = publish_video_to_queue(&video.id, &rabbitmq_channel).await {
                eprintln!("Failed to publish message to RabbitMQ: {:?}", err);
                return HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": "Failed to notify transcoder."
                }));
            }

            // Formatar a resposta JSON incluindo os detalhes do vídeo
            let response = json!({
                "status": "success",
                "video": {
                    "id": video.id,
                    "title": video.title,
                    "description": video.description,
                    "thumbnail_path": video.thumbnail_path,
                    "slug": video.slug,
                    "published_at": video.published_at,
                    "is_published": video.is_published,
                    "num_likes": video.num_likes,
                    "num_views": video.num_views,
                    "author_id": video.author_id,
                    "video_date": video.video_date
                }
            });

            HttpResponse::Ok().json(response)
        },
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create video: {:?}", error)
        })),
    }
}
*/

// Função auxiliar para publicar mensagem no RabbitMQ
async fn publish_video_to_queue(video_id: &Uuid, rabbitmq_channel: &Channel) -> Result<(), Box<dyn std::error::Error>> {
    let payload = json!({
        "video_id": video_id,
        "action": "transcode"
    })
    .to_string();

    rabbitmq_channel
        .basic_publish(
            "video_exchange", // Troca onde a mensagem será publicada
            "video.created",   // Routing key para identificar a ação
            BasicPublishOptions::default(),
            payload.as_bytes().to_vec(), // Converte para Vec<u8>
            BasicProperties::default(),
        )
        .await?;

    Ok(())
}

// Handler para obter todos os vídeos
#[get("/videos")]
async fn get_all_videos(data: Data<AppState>) -> impl Responder {
    let query = "SELECT * FROM videos ORDER BY id";

    match sqlx::query_as::<_, VideoModel>(query).fetch_all(&data.db).await {
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

    match sqlx::query_as!(
        VideoModel,
        r#"
        SELECT id, title, description, thumbnail_path, slug, published_at,
               is_published, num_likes, num_views, author_id, video_date
        FROM videos
        WHERE id = $1
        "#,
        video_id
    )
    .fetch_optional(&data.db)
    .await
    {
        Ok(Some(video)) => HttpResponse::Ok().json(json!({"status": "success", "video": video})),
        Ok(None) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": "Video not found"
        })),
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

    match sqlx::query_as::<_, VideoModel>(query)
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

// Configuração dos serviços de vídeo
pub fn config_videos(conf: &mut ServiceConfig) {
    conf.service(create_video)
       .service(get_all_videos)
       .service(get_video_by_id)
       .service(update_video_by_id)
       .service(delete_video_by_id);
}
