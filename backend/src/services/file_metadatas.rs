use actix_web::{
    get, post, delete, patch, web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder
};
use std::fs::File; // Adiciona para leitura de arquivos locais
use actix_files::Files;  // Para servir arquivos estáticos
use actix_multipart::Multipart;
use futures_util::StreamExt;
use tokio::fs::File as TokioFile; // Use um alias para tokio::fs::File
use tokio::io::AsyncWriteExt;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;

use crate::{
    models::FileMetadataModel,
    schema::{CreateFileMetadataSchema, UpdateFileMetadataSchema, FilterOptions},
    AppState
};

// Função para upload de arquivo
#[post("/file_metadatas/upload")]
async fn upload_file(
    mut payload: Multipart,
    data: Data<AppState>
) -> impl Responder {
    while let Some(field) = payload.next().await {
        match field {
            Ok(mut field) => {
                let filename = field
                    .content_disposition()
                    .get_filename()
                    .map(|f| f.to_string())
                    .unwrap_or_else(|| "default_filename".to_string());

                let extension = filename.split('.').last().unwrap_or("mp4");
                let filename_with_extension = format!("video_{}.{}", Uuid::new_v4(), extension);
                let filepath = format!("./static/uploads/{}", filename_with_extension);

                let mut f = TokioFile::create(&filepath)
                    .await
                    .expect("Unable to create file");

                while let Some(chunk) = field.next().await {
                    match chunk {
                        Ok(data) => {
                            f.write_all(&data).await.expect("Unable to write data");
                        },
                        Err(e) => {
                            return HttpResponse::InternalServerError().json(json!( {
                                "status": "error",
                                "message": format!("Error reading chunk: {:?}", e)
                            }));
                        }
                    }
                }

                let file_url = format!("/uploads/{}", filename_with_extension);

                return HttpResponse::Ok().json(json!( {
                    "status": "success", 
                    "message": "File uploaded successfully.",
                    "file_url": file_url
                }));
            }
            Err(e) => {
                return HttpResponse::InternalServerError().json(json!( {
                    "status": "error", 
                    "message": format!("Error reading field: {:?}", e)
                }));
            }
        }
    }

    HttpResponse::Ok().json(json!( {
        "status": "success", 
        "message": "File uploaded successfully."
    }))
}

#[post("/file_metadatas")]
async fn create_file_metadata(
    body: Json<CreateFileMetadataSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
        INSERT INTO file_metadata (user_id, file_type, filename, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, file_type, filename, description, uploaded_at
    "#;

    let filename = format!("document_{}.jpg", Uuid::new_v4());

    match sqlx::query_as::<_, FileMetadataModel>(query)
        .bind(&body.user_id)
        .bind(&body.file_type)
        .bind(&filename)
        .bind(&body.description)
        .fetch_one(&data.db) // Certifique-se de usar o pool de conexão correto
        .await
    {
        Ok(file_metadata) => {
            let response = json!( {
                "status": "success",
                "file_metadata": file_metadata
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to create file_metadata: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/file_metadatas")]
pub async fn get_all_file_metadatas(
    opts: Query<FilterOptions>,
    data: Data<AppState>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(
        FileMetadataModel,
        "SELECT * FROM file_metadata ORDER BY id LIMIT $1 OFFSET $2",
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(file_metadatas) => {
            let response = json!( {
                "status": "success",
                "file_metadatas": file_metadatas
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to get file_metadatas: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/file_metadatas/{id}")]
async fn get_file_metadata_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let file_metadata_id = path.into_inner();

    match sqlx::query_as!(
        FileMetadataModel,
        "SELECT * FROM file_metadata WHERE id = $1",
        file_metadata_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(file_metadata) => {
            let response = json!( {
                "status": "success",
                "file_metadata": file_metadata
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to get file_metadata: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Função para atualizar metadados de arquivo
#[patch("/file_metadatas/{id}")]
async fn update_file_metadata_by_id(
    path: Path<Uuid>,
    body: Json<UpdateFileMetadataSchema>,
    data: Data<AppState>
) -> impl Responder {
    let file_metadata_id = path.into_inner();

    match sqlx::query_as!(
        FileMetadataModel,
        "SELECT * FROM file_metadata WHERE id = $1",
        file_metadata_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(file_metadata) => {
            let update_result = sqlx::query_as!(
                FileMetadataModel,
                "UPDATE file_metadata SET user_id = COALESCE($1, user_id), file_type = COALESCE($2, file_type), filename = COALESCE($3, filename), description = COALESCE($4, description), uploaded_at = COALESCE($5, uploaded_at) WHERE id = $6 RETURNING *",
                body.user_id.as_ref(),
                body.file_type.as_ref(),
                body.filename.as_ref(),
                body.description.as_ref(),
                Some(Utc::now()), // Garantindo que o campo uploaded_at receba o DateTime
                file_metadata_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_file_metadata) => {
                    let response = json!( {
                        "status": "success",
                        "file_metadata": updated_file_metadata
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!( {
                        "status": "error",
                        "message": format!("Failed to update file_metadata: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!( {
                "status": "error",
                "message": format!("FileMetadata not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

#[delete("/file_metadatas/{id}")]
async fn delete_file_metadata_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let file_metadata_id = path.into_inner();

    match sqlx::query!("DELETE FROM file_metadata WHERE id = $1", file_metadata_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to delete file_metadata: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Dentro do código de configuração de rotas
pub fn config_file_metadatas(conf: &mut ServiceConfig) {
    // Servir arquivos estáticos da pasta './static/uploads'
    conf.service(Files::new("/uploads", "./static/uploads").show_files_listing());
    conf.service(create_file_metadata)
       .service(get_all_file_metadatas)
       .service(get_file_metadata_by_id)
       .service(upload_file)
       .service(update_file_metadata_by_id)
       .service(delete_file_metadata_by_id);
}