use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Path, ServiceConfig},
    HttpResponse, Responder,
};
use sqlx::PgPool;
use uuid::Uuid;
use serde::Deserialize;
use actix_multipart::Multipart;
use futures_util::stream::StreamExt as _;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use serde_json::json;
use crate::{
    models::VideoModel,
    schema::{CreateVideoSchema, UpdateVideoSchema, FilterOptions},
    AppState,
};
use lapin::{options::BasicPublishOptions, BasicProperties, Channel};

const UPLOAD_DIR: &str = "./uploads/"; // Diretório onde os vídeos serão salvos

// Estrutura para receber metadados do upload finalizado
#[derive(Deserialize)]
struct FinishUpload {
    file_name: String,
    total_chunks: usize,
}

// Handler para criar um vídeo
#[post("/videos")]
async fn create_video(
    body: Json<CreateVideoSchema>,
    data: Data<AppState>,
    rabbitmq_channel: Data<Channel>, // Canal RabbitMQ injetado
) -> impl Responder {
    let query = r#"
        INSERT INTO videos (title, description)
        VALUES ($1, $2)
        RETURNING id, title, description
    "#;

    match sqlx::query_as::<_, VideoModel>(query)
        .bind(&body.title)
        .bind(&body.description)
        .fetch_one(&data.db)
        .await
    {
        Ok(video) => {
            // Publicar mensagem no RabbitMQ
            if let Err(err) = publish_video_to_queue(video.id, &rabbitmq_channel).await {
                eprintln!("Falha ao publicar no RabbitMQ: {:?}", err);
                return HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": "Falha ao notificar transcoder."
                }));
            }

            HttpResponse::Ok().json(json!({
                "status": "success",
                "video": video
            }))
        },
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Falha ao criar vídeo: {:?}", error)
        })),
    }
}

// Função para publicar mensagem no RabbitMQ
async fn publish_video_to_queue(video_id: Uuid, channel: &Channel) -> Result<(), lapin::Error> {
    let video_message = json!({
        "video_id": video_id.to_string(),
    });

    let payload = serde_json::to_vec(&video_message).unwrap();

    channel.basic_publish(
        "video_queue", // Nome da fila
        "", // Routing key
        BasicPublishOptions::default(),
        payload,
        BasicProperties::default(),
    ).await?;

    Ok(())
}

// Handler para receber chunks do vídeo
#[post("/upload_chunk/{id}/{chunk_index}")]
async fn upload_chunk(
    path: Path<(Uuid, usize)>, // (video_id, chunk_index)
    mut payload: Multipart,
) -> impl Responder {
    let (video_id, chunk_index) = path.into_inner();
    let file_path = PathBuf::from(format!("{}{}_chunk_{}", UPLOAD_DIR, video_id, chunk_index));

    let mut f = OpenOptions::new().create(true).append(true).open(file_path).unwrap();

    while let Some(Ok(mut field)) = payload.next().await {
        while let Some(chunk) = field.next().await {
            f.write_all(&chunk.unwrap()).unwrap();
        }
    }

    HttpResponse::Ok().json(json!({ "status": "success", "chunk_index": chunk_index }))
}

// Função para consolidar os chunks após o upload completo
async fn consolidate_chunks(video_id: Uuid, total_chunks: usize) -> Result<(), std::io::Error> {
    let final_path = format!("{}{}.mp4", UPLOAD_DIR, video_id);
    let mut final_file = OpenOptions::new().create(true).write(true).open(final_path)?;

    for i in 0..total_chunks {
        let chunk_path = format!("{}{}_chunk_{}", UPLOAD_DIR, video_id, i);
        let mut chunk_file = std::fs::File::open(chunk_path.clone())?;

        std::io::copy(&mut chunk_file, &mut final_file)?;
        std::fs::remove_file(chunk_path)?; // Apagar o chunk após consolidação
    }

    Ok(())
}

// Handler para finalizar o upload e consolidar os chunks
#[post("/finish_upload/{id}")]
async fn finish_upload(
    path: Path<Uuid>,
    data: Json<FinishUpload>,
) -> impl Responder {
    let video_id = path.into_inner();
    let total_chunks = data.total_chunks;

    if let Err(error) = consolidate_chunks(video_id, total_chunks).await {
        return HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Falha ao finalizar upload: {:?}", error)
        }));
    }

    HttpResponse::Ok().json(json!({ "status": "success", "message": "Upload finalizado com sucesso" }))
}

// Handler para obter todos os vídeos
#[get("/videos")]
async fn get_all_videos(data: Data<AppState>) -> impl Responder {
    let query = "SELECT * FROM videos ORDER BY id";

    match sqlx::query_as::<_, VideoModel>(query).fetch_all(&data.db).await {
        Ok(videos) => HttpResponse::Ok().json(json!({"status": "success", "videos": videos})),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Falha ao obter vídeos: {:?}", error)
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
            "message": "Vídeo não encontrado"
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Falha ao obter vídeo: {:?}", error)
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
            "message": format!("Falha ao atualizar vídeo: {:?}", error)
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

    let query = "DELETE FROM videos WHERE id = $1 RETURNING *";

    match sqlx::query_as::<_, VideoModel>(query).bind(video_id).fetch_optional(&data.db).await {
        Ok(Some(deleted_video)) => HttpResponse::Ok().json(json!({
            "status": "success",
            "video": deleted_video
        })),
        Ok(None) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": "Vídeo não encontrado"
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Falha ao deletar vídeo: {:?}", error)
        })),
    }
}

// Função para configurar o escopo de rotas de upload de vídeo
pub fn video_uploads_scope(cfg: &mut ServiceConfig) {
    cfg.service(create_video)
       .service(upload_chunk)
       .service(finish_upload)
       .service(get_all_videos)
       .service(get_video_by_id)
       .service(update_video_by_id)
       .service(delete_video_by_id);
}
