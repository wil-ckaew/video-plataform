use actix_web::{
    get, post, delete, patch, web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder
};
use std::fs::File; // Adiciona para leitura de arquivos locais
use actix_files::Files;  // Para servir arquivos estáticos
use tokio::fs::File as TokioFile; // Use um alias para tokio::fs::File
use actix_multipart::Multipart;
use futures_util::StreamExt;
//use tokio::fs::File; // Use o tipo correto
use tokio::io::AsyncWriteExt;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use std::path::PathBuf;
use std::fs;
use chrono::Utc;

use crate::{
    models::{MeusVideoModel, PhotoModel, StudentModel},
    schema::{CreateMeusVideoSchema, UpdateMeusVideoSchema, FilterOptions, CreatePhotoSchema, UpdatePhotoSchema},
    AppState
};


// Função para upload de vídeo
#[post("all_videos/upload")]
async fn upload_meusvideo(
    data: Data<AppState>,
    mut payload: Multipart
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



#[post("/all_videos")]
async fn create_meusvideo(
    body: Json<CreateMeusVideoSchema>,
    data: Data<AppState>
) -> impl Responder {
    
    let query = r#"

        INSERT INTO meusvideos (student_id, filename, description)
        VALUES ($1, $2, $3)
        RETURNING id, student_id, filename, description, created_at
    "#;

    let filename = format!("document_{}.jpg", Uuid::new_v4());

    match sqlx::query_as::<_, MeusVideoModel>(query)
        .bind(body.student_id)
        .bind(&body.filename)
        .bind(&body.description)
        .fetch_one(&data.db)
        .await
    {
        Ok(meusvideo) => {
            let response = json!( {
                "status": "success",
                "meusvideo": {
                    "id": meusvideo.id,
                    "student_id": meusvideo.student_id,
                    "filename": meusvideo.filename,
                    "description": meusvideo.description,
                    "created_at": meusvideo.created_at
                }
            });
            HttpResponse::Ok().json(response)
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

// Função para obter todos os vídeos
#[get("/all_videos")]
pub async fn get_all_meusvideos(
    opts: Query<FilterOptions>,
    data: Data<AppState>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(
        MeusVideoModel,
        "SELECT * FROM meusvideos ORDER BY id LIMIT $1 OFFSET $2",
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(meusvideos) => {
            let response = json!( {
                "status": "success",
                "meusvideos": meusvideos
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to get meus videos: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Função para obter um vídeo por ID
#[get("/all_videos/{id}")]
async fn get_meusvideo_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let meusvideo_id = path.into_inner();

    match sqlx::query_as!(
        MeusVideoModel,
        "SELECT * FROM meusvideos WHERE id = $1",
        meusvideo_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(meusvideo) => {
            let response = json!( {
                "status": "success",
                "meusvideo": meusvideo
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to get meus video: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Função para atualizar um vídeo
#[patch("/all_videos/{id}")]
async fn update_meusvideo_by_id(
    path: Path<Uuid>,
    body: Json<UpdateMeusVideoSchema>,
    data: Data<AppState>
) -> impl Responder {
    let meusvideo_id = path.into_inner();

    match sqlx::query_as!(
        MeusVideoModel,
        "SELECT * FROM meusvideos WHERE id = $1",
        meusvideo_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(_) => {
            let update_result = sqlx::query_as!(
                MeusVideoModel,
                "UPDATE meusvideos SET student_id = COALESCE($1, student_id), filename = COALESCE($2, filename), description = COALESCE($3, description) WHERE id = $4 RETURNING *",
                body.student_id.as_ref(),
                body.filename.as_ref(),
                body.description.as_ref(),
                meusvideo_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_meusvideo) => {
                    let response = json!( {
                        "status": "success",
                        "meusvideo": updated_meusvideo
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!( {
                        "status": "error",
                        "message": format!("Failed to update meus video: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Meus Video not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

// Função para deletar um vídeo por ID
#[delete("/all_videos/{id}")]
async fn delete_meusvideo_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let meusvideo_id = path.into_inner();

    match sqlx::query!("DELETE FROM meusvideos WHERE id = $1", meusvideo_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to delete meus video: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}


// Função para obter todos os alunos
#[get("/students")]
async fn get_students(data: Data<AppState>) -> impl Responder {
    match sqlx::query_as!(StudentModel, "SELECT * FROM students")
        .fetch_all(&data.db)
        .await
    {
        Ok(students) => {
            let response = json!( {
                "status": "success",
                "students": students
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to get students: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Configuração das rotas para vídeos e alunos
pub fn config_all_videos(conf: &mut ServiceConfig) {
    conf.service(create_meusvideo)
       .service(get_all_meusvideos)
       .service(get_meusvideo_by_id)
       .service(update_meusvideo_by_id)
       .service(delete_meusvideo_by_id)
       .service(upload_meusvideo) // Adicionando o serviço de upload de vídeo
       .service(Files::new("/static", "./static").show_files_listing())
       .service(get_students);
}
