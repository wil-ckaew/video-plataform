use actix_web::{
    get, post, delete, patch, web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder
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
use chrono::Utc;

use crate::{
    models::VideoMediaModel,
    schema::{CreateVideoMediaSchema, UpdateVideoMediaSchema, FilterOptions},
    AppState
};



#[post("/all_videos/upload")]
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

#[post("/all_videos")]
async fn create_all_video(
    body: Json<CreateVideoMediaSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
        INSERT INTO videomedias (video_id, video_path, status)
        VALUES ($1, $2, $3)
        RETURNING id, video_id, video_path, status
    "#;


    match sqlx::query_as::<_, VideoMediaModel>(query)
        .bind(&body.video_id)
        .bind(&body.video_path)
        .bind(&body.status)
        .fetch_one(&data.db) // Certifique-se de usar o pool de conexão correto
        .await
    {
        Ok(video) => {
            HttpResponse::Ok().json(json!({
                "status": "success",
                "video": {
                    "id": video.id,
                    "video_id": video.video_id,
                    "video_path": video.video_path,
                    "status": video.status
                   // "created_at": document.created_at
                }
            }))
        }
        Err(error) => {
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": format!("Failed to create video: {:?}", error)
            }))
        }
    }
}


#[get("/all_videos")]
pub async fn get_all_all_videos(
    opts: Query<FilterOptions>,
    data: Data<AppState>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(
        VideoMediaModel,
        "SELECT * FROM videomedias ORDER BY id LIMIT $1 OFFSET $2",
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(all_videos) => {
            let response = json!({
                "status": "success",
                "all_videos": all_videos.iter().map(|video| {
                    let video_url = format!("http://localhost:8080/uploads/{}", video.video_path);
                    json!({
                        "id": video.id,
                        "video_id": video.video_id,
                        "video_path": video.video_path,
                        "status": video.status
                      //  "file_url": video_url
                    })
                }).collect::<Vec<_>>()
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get all_videos: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/all_videos/{id}")]
async fn get_all_video_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let all_video_id = path.into_inner();

    match sqlx::query_as!(
        VideoMediaModel,
        "SELECT * FROM videomedias WHERE id = $1",
        all_video_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(video) => {
            let response = json!({
                "status": "success",
                "video": video
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get video: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Função para atualizar metadados de arquivo
#[patch("/all_videos/{id}")]
async fn update_all_video_by_id(
    path: Path<Uuid>,
    body: Json<UpdateVideoMediaSchema>,
    data: Data<AppState>
) -> impl Responder {
    let all_video_id = path.into_inner();

    match sqlx::query_as!(
        VideoMediaModel,
        "SELECT * FROM videomedias WHERE id = $1",
        all_video_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(all_video) => {
            let update_result = sqlx::query_as!(
                VideoMediaModel,
                "UPDATE videomedias SET video_id = COALESCE($1, video_id), video_path = COALESCE($2, video_path), status = COALESCE($3, status) WHERE id = $4 RETURNING *",
                body.video_id.as_ref(),
                body.video_path.as_ref(),
                body.status.as_ref(),
                all_video_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_all_video) => {
                    let response = json!( {
                        "status": "success",
                        "all_video": updated_all_video
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!( {
                        "status": "error",
                        "message": format!("Failed to update all_video: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!( {
                "status": "error",
                "message": format!("AllVideo not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

#[delete("/all_videos/{id}")]
async fn delete_all_video_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let all_video_id = path.into_inner();

    match sqlx::query!("DELETE FROM videomedias WHERE id = $1", all_video_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to delete all_video: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Dentro do código de configuração de rotas
pub fn config_all_videos(conf: &mut ServiceConfig) {
    // Servir arquivos estáticos da pasta './static/uploads'
    conf.service(Files::new("/uploads", "./static/uploads").show_files_listing());
    conf.service(create_all_video)
       .service(get_all_all_videos)
       .service(get_all_video_by_id)
       .service(upload_file)
       .service(update_all_video_by_id)
       .service(delete_all_video_by_id);
}