use actix_web::{
    get, post, delete, patch, web::{Data, Json, scope, Query, Path, ServiceConfig}, HttpResponse, Responder
};
use serde_json::json;
use crate::{
    model::DocumentModel,
    schema::{CreateDocumentSchema, UpdateDocumentSchema, FilterOptions},
    AppState
};
use sqlx::PgPool;
use uuid::Uuid;

// Endpoint de verificação de saúde
#[get("/healthchecker")]
async fn health_checker() -> impl Responder {
    const MESSAGE: &str = "Health check: API is up and running smoothly.";

    HttpResponse::Ok().json(json!({
        "status": "success",
        "message": MESSAGE
    }))
}

// Endpoint para criar um documento
#[post("/document")]
async fn create_document(
    body: Json<CreateDocumentSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
        INSERT INTO documents (user_id, doc_type, filename)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, doc_type, filename, created_at
    "#;

    // Gera um nome de arquivo com base no UUID
    let filename = format!("document_{}.jpg", Uuid::new_v4());

    match sqlx::query_as::<_, DocumentModel>(query)
        .bind(&body.user_id)
        .bind(&body.doc_type)
        .bind(&filename)
        .fetch_one(&data.db)
        .await
    {
        Ok(document) => {
            let response = json!({
                "status": "success",
                "document": {
                    "id": document.id,
                    "user_id": document.user_id,
                    "doc_type": document.doc_type,
                    "filename": document.filename,
                    "created_at": document.created_at
                }
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to create document: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}


// Endpoint para listar todos os documentos
#[get("/documents")]
pub async fn get_all_documents(
    opts: Query<FilterOptions>,
    data: Data<AppState>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(
        DocumentModel,
        "SELECT * FROM documents ORDER BY id LIMIT $1 OFFSET $2",
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(documents) => {
            let response = json!({
                "status": "success",
                "documents": documents
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get documents: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Endpoint para obter um documento por ID
#[get("/documents/{id}")]
pub async fn get_document_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let document_id = path.into_inner();

    match sqlx::query_as!(
        DocumentModel,
        "SELECT * FROM documents WHERE id = $1",
        document_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(document) => {
            let response = json!({
                "status": "success",
                "document": document
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get document: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}


// Endpoint para excluir um documento por ID
#[delete("/documents/{id}")]
async fn delete_document_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let document_id = path.into_inner();

    match sqlx::query!("DELETE FROM documents WHERE id = $1", document_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to delete document: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Endpoint para atualizar um documento por ID
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
        Ok(_document) => {
            // Atualizar o documento
            let update_result = sqlx::query_as!(
                DocumentModel,
                "UPDATE documents SET user_id = COALESCE($1, user_id), doc_type = COALESCE($2, doc_type) WHERE id = $3 RETURNING *",
                body.user_id.as_ref(),
                body.doc_type.as_ref(),
                document_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_document) => {
                    let response = json!({
                        "status": "success",
                        "document": updated_document
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!({
                        "status": "error",
                        "message": format!("Failed to update document: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!({
                "status": "error",
                "message": format!("Document not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

// Configuração das rotas
pub fn config_documents(conf: &mut ServiceConfig) {
    conf.service(
        scope("/api")
            .service(create_document)       
            .service(get_all_documents)
            .service(get_document_by_id)                 
            .service(delete_document_by_id)
            .service(update_document_by_id)
    );
}

