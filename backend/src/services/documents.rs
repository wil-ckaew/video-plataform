use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Path, ServiceConfig, Query},
    HttpResponse, Responder,
};
use actix_multipart::Multipart;
use futures_util::StreamExt;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;
use std::path::PathBuf;
use std::fs;
use crate::{models::DocumentModel, schema::{CreateDocumentSchema, UpdateDocumentSchema, FilterOptions}, AppState};

const UPLOAD_DIR: &str = "static/uploads";

fn create_upload_dir() {
    if !PathBuf::from(UPLOAD_DIR).exists() {
        fs::create_dir_all(UPLOAD_DIR).unwrap();
    }
}

#[post("/upload")]
async fn upload_document(mut payload: Multipart, _data: Data<AppState>) -> impl Responder {
    create_upload_dir();

    let mut filename = String::new();
    while let Some(field) = payload.next().await {
        match field {
            Ok(mut field) => {
                if let Some(fname) = field.content_disposition().get_filename() {
                    filename = fname.to_string();
                    let filepath = format!("{}/{}", UPLOAD_DIR, filename);

                    if let Ok(mut f) = File::create(&filepath).await {
                        while let Some(chunk) = field.next().await {
                            if let Ok(data) = chunk {
                                if let Err(e) = f.write_all(&data).await {
                                    return HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Write error: {:?}", e)}));
                                }
                            } else {
                                return HttpResponse::InternalServerError().json(json!({"status": "error", "message": "Failed to read chunk"}));
                            }
                        }
                    } else {
                        return HttpResponse::InternalServerError().json(json!({"status": "error", "message": "Failed to create file"}));
                    }
                }
            }
            Err(e) => {
                return HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Error reading field: {:?}", e)}));
            }
        }
    }

    HttpResponse::Ok().json(json!({"status": "success", "message": "File uploaded successfully", "filename": filename}))
}

#[get("/healthchecker")]
async fn health_checker() -> impl Responder {
    HttpResponse::Ok().json(json!({"status": "success", "message": "API is up and running smoothly."}))
}

#[post("/documents")]
async fn create_document(mut payload: Multipart, data: Data<AppState>) -> impl Responder {
    create_upload_dir(); // Certifique-se de que essa função cria a pasta de uploads

    let mut student_id = String::new();
    let mut doc_type = String::new();
    let mut filename = String::new();

    while let Some(item) = payload.next().await {
        let mut field = item.unwrap(); // Agora mutável

        if field.name() == "student_id" {
            student_id = field.fold(String::new(), |mut acc, data| async {
                if let Ok(bytes) = data {
                    acc.push_str(&String::from_utf8_lossy(&bytes));
                }
                acc
            }).await;
        } else if field.name() == "doc_type" {
            doc_type = field.fold(String::new(), |mut acc, data| async {
                if let Ok(bytes) = data {
                    acc.push_str(&String::from_utf8_lossy(&bytes));
                }
                acc
            }).await;
        } else if field.name() == "file" {
            if let Some(file_name) = field.content_disposition().get_filename() {
                let file_path = format!("{}/{}", UPLOAD_DIR, file_name);
                
                // Usando tokio::fs::File para criar o arquivo
                let mut f = File::create(&file_path).await.expect("Unable to create file");

                // Armazenar o nome do arquivo antes de usar o campo
                filename = file_name.to_string();

                // Usar um loop para escrever os chunks no arquivo
                while let Some(chunk) = field.next().await {
                    let data = chunk.unwrap();
                    f.write_all(&data).await.expect("Unable to write data");
                }
            }
        }
    }

    // Tenta converter student_id para UUID
    let student_id_uuid = match Uuid::parse_str(&student_id) {
        Ok(uuid) => uuid,
        Err(_) => {
            return HttpResponse::BadRequest().json(json!({
                "status": "error",
                "message": "Invalid UUID format for student_id"
            }));
        }
    };

    let query = r#"
        INSERT INTO documents (student_id, doc_type, filename)
        VALUES ($1::uuid, $2, $3)
        RETURNING id, student_id, doc_type, filename, created_at
    "#;

    match sqlx::query_as::<_, DocumentModel>(query)
        .bind(student_id_uuid)
        .bind(&doc_type)
        .bind(&filename)
        .fetch_one(&data.db)
        .await
    {
        Ok(document) => {
            HttpResponse::Ok().json(json!({
                "status": "success",
                "document": {
                    "id": document.id,
                    "student_id": document.student_id,
                    "doc_type": document.doc_type,
                    "filename": document.filename,
                    "created_at": document.created_at
                }
            }))
        }
        Err(error) => {
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": format!("Failed to create document: {:?}", error)
            }))
        }
    }
}

#[get("/documents")]
pub async fn get_all_documents(opts: Query<FilterOptions>, data: Data<AppState>) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(DocumentModel, "SELECT * FROM documents ORDER BY id LIMIT $1 OFFSET $2", limit as i32, offset as i32)
        .fetch_all(&data.db)
        .await
    {
        Ok(documents) => {
            HttpResponse::Ok().json(json!({"status": "success", "documents": documents}))
        }
        Err(error) => {
            HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to get documents: {:?}", error)}))
        }
    }
}

#[get("/documents/{id}")]
pub async fn get_document_by_id(path: Path<Uuid>, data: Data<AppState>) -> impl Responder {
    let document_id = path.into_inner();

    match sqlx::query_as!(DocumentModel, "SELECT * FROM documents WHERE id = $1", document_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(document) => {
            HttpResponse::Ok().json(json!({"status": "success", "document": document}))
        }
        Err(error) => {
            HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to get document: {:?}", error)}))
        }
    }
}

#[delete("/documents/{id}")]
async fn delete_document_by_id(path: Path<Uuid>, data: Data<AppState>) -> impl Responder {
    let document_id = path.into_inner();

    match sqlx::query!("DELETE FROM documents WHERE id = $1", document_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to delete document: {:?}", err)}))
        }
    }
}

#[patch("/documents/{id}")]
async fn update_document_by_id(
    path: Path<Uuid>,
    body: Json<UpdateDocumentSchema>,
    data: Data<AppState>
) -> impl Responder {
    let document_id = path.into_inner();

    // Recuperar o documento existente
    match sqlx::query_as!(
        DocumentModel,
        "SELECT * FROM documents WHERE id = $1",
        document_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(existing_document) => {
            // Atualizar o documento
            let update_result = sqlx::query_as!(
                DocumentModel,
                "UPDATE documents SET student_id = COALESCE($1, student_id), doc_type = COALESCE($2, doc_type), filename = COALESCE($3, filename) WHERE id = $4 RETURNING *",
                body.student_id.as_ref(),  // Mantendo como Option<Uuid>
                body.doc_type.as_ref().map(|s| s.as_str()),  // Convertendo Option<String> para Option<&str>
                body.filename.as_ref(),  // Agora permitindo alteração do filename
                document_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_document) => {
                    let response = json!( {
                        "status": "success",
                        "document": updated_document
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!( {
                        "status": "error",
                        "message": format!("Failed to update document: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Document not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

pub fn config_documents(conf: &mut ServiceConfig) {
    conf.service(upload_document)
        .service(health_checker)
        .service(create_document)
        .service(get_all_documents)
        .service(get_document_by_id)
        .service(delete_document_by_id)
        .service(update_document_by_id);
}
