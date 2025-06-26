use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Query, Path, ServiceConfig},
    HttpResponse, Responder,
};
use crate::{
    models::VideoModel,
    schema::{CreateVideoSchema, UpdateVideoSchema, FilterOptions},
    AppState,
};
use actix_files::Files;  // Para servir arquivos estáticos
use actix_multipart::Multipart;
use futures_util::StreamExt;
use tokio::fs::File as TokioFile; // Use um alias para tokio::fs::File
use tokio::fs::{self, File}; // Importando tokio::fs para operações assíncronas
use tokio::io::AsyncWriteExt;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use std::path::PathBuf;
use chrono::{Utc, NaiveDateTime};  // Importando NaiveDateTime
use lapin::{options::BasicPublishOptions, BasicProperties, Channel};

// Gera o caminho dinâmico para o thumbnail com base no ID do vídeo
fn generate_thumbnail_path(video_id: Uuid) -> String {
    format!("/media/thumbnails/video-test/{}/thumbnail.jpg", video_id)
}

#[post("/upload")]
async fn upload_file(mut payload: Multipart) -> impl Responder {
    // Verifique se o diretório de uploads existe, caso contrário, crie-o
    let uploads_dir = "./static/uploads";
    if !fs::metadata(uploads_dir).await.is_ok() {
        fs::create_dir_all(uploads_dir).await.expect("Failed to create uploads directory");
    }

    while let Some(field) = payload.next().await {
        match field {
            Ok(mut field) => {
                // Extrair o nome original do arquivo
                let filename = field
                    .content_disposition()
                    .get_filename()
                    .map(|f| f.to_string())
                    .unwrap_or_else(|| "default_filename".to_string());

                // Defina o caminho do arquivo para salvar no diretório de uploads
                let filepath = format!("./static/uploads/{}", filename);

                // Crie o arquivo no diretório de uploads com o nome original
                let mut f = File::create(&filepath)
                    .await
                    .expect("Unable to create file");

                // Escreve o conteúdo do arquivo
                while let Some(chunk) = field.next().await {
                    match chunk {
                        Ok(data) => {
                            f.write_all(&data).await.expect("Unable to write data");
                        },
                        Err(e) => {
                            return HttpResponse::InternalServerError().json(json!({
                                "status": "error",
                                "message": format!("Error reading chunk: {:?}", e)
                            }));
                        }
                    }
                }

                // Gera a URL para o arquivo carregado
                let file_url = format!("/uploads/{}", filename);

                // Retorna a resposta de sucesso com a URL do arquivo
                return HttpResponse::Ok().json(json!({
                    "status": "success",
                    "message": "File uploaded successfully.",
                    "file_url": file_url
                }));
            }
            Err(e) => {
                return HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": format!("Error reading field: {:?}", e)
                }));
            }
        }
    }

    HttpResponse::Ok().json(json!({
        "status": "success",
        "message": "File uploaded successfully."
    }))
}

#[post("/videos")]
async fn create_video(
    body: Json<CreateVideoSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
       INSERT INTO videos (title, description, thumbnail_path, slug, published_at, is_published, num_likes, num_views, author_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title, description, thumbnail_path, slug, published_at, is_published, num_likes, num_views, author_id, video_date
    "#;

    match sqlx::query_as::<_, VideoModel>(query)
        .bind(&body.title)
        .bind(&body.description)
        .bind(&body.thumbnail_path)
        .bind(&body.slug)
        .bind(&body.published_at)
        .bind(&body.is_published)
        .bind(&body.num_likes)
        .bind(&body.num_views)
        .bind(&body.author_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(video) => {
            // Publica a mensagem usando o canal RabbitMQ no AppState
            if let Err(err) = publish_video_to_queue(&video.id, &data.rabbitmq_channel).await {
                eprintln!("Failed to publish message to RabbitMQ: {:?}", err);
                return HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": "Failed to notify transcoder."
                }));
            }

            // Formata a resposta JSON incluindo os detalhes do vídeo
            let response = json!( {
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
                    "video_date": video.video_date,
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to create video: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

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

/*
// Handler para criar um vídeo
#[post("/videos")]
async fn create_video(
    body: Json<CreateVideoSchema>,
    data: Data<AppState>,
  //  rabbitmq_channel: Data<Channel>
) -> impl Responder {
    let query = r#"
       INSERT INTO videos (title, description, thumbnail_path, slug, published_at, is_published, num_likes, num_views, author_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title, description, thumbnail_path, slug, published_at, is_published, num_likes, num_views, author_id, video_date
    "#;

    match sqlx::query_as::<_, VideoModel>(query)
        .bind(&body.title)
        .bind(&body.description)
        .bind(&body.thumbnail_path)
        .bind(&body.slug)
        .bind(&body.published_at)
        .bind(&body.is_published)
        .bind(&body.num_likes)
        .bind(&body.num_views)
        .bind(&body.author_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(video) => {/*
            // Publicar mensagem no RabbitMQ
            if let Err(err) = publish_video_to_queue(&video.id, &rabbitmq_channel).await {
                eprintln!("Failed to publish message to RabbitMQ: {:?}", err);
                return HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": "Failed to notify transcoder."
                }));
            }
*/
            // Formatar a resposta JSON incluindo os detalhes do vídeo
            let response = json!( {
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
                    "video_date": video.video_date,
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to create videos: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

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
*/

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
       .service(upload_file)
       .service(update_video_by_id)
       .service(delete_video_by_id)
       .service(Files::new("/static", "./static").show_files_listing())
       .service(Files::new("/uploads", "./static/uploads").show_files_listing());
}
