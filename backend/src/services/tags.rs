use actix_web::{
    get, post, delete, patch, web::{Data, Json, Path, ServiceConfig}, HttpResponse, Responder
};
use serde_json::json;
use uuid::Uuid;
use crate::{
    models::TagModel,
    schema::{CreateTagSchema, UpdateTagSchema, FilterOptions},
    AppState
};

/// Rota para criar uma nova tag
#[post("/tags")]
async fn create_tag(
    body: Json<CreateTagSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
        INSERT INTO tags (name)
        VALUES ($1)
        RETURNING id, name
    "#;

    match sqlx::query_as::<_, TagModel>(query)
        .bind(&body.name)
        .fetch_one(&data.db)
        .await
    {
        Ok(tag) => HttpResponse::Ok().json(json!({
            "status": "success",
            "tag": tag
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create tag: {:?}", error)
        })),
    }
}

/// Rota para obter todas as tags
#[get("/tags")]
async fn get_all_tags(data: Data<AppState>) -> impl Responder {
    let query = "SELECT * FROM tags ORDER BY id";

    match sqlx::query_as::<_, TagModel>(query).fetch_all(&data.db).await {
        Ok(tags) => HttpResponse::Ok().json(json!({
            "status": "success",
            "tags": tags
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get tags: {:?}", error)
        })),
    }
}

/// Rota para obter uma tag por ID
#[get("/tags/{id}")]
async fn get_tag_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let tag_id = path.into_inner();

    match sqlx::query_as!(TagModel, "SELECT * FROM tags WHERE id = $1", tag_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(tag) => HttpResponse::Ok().json(json!({
            "status": "success",
            "tag": tag
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get tag: {:?}", error)
        })),
    }
}

/// Rota para atualizar uma tag por ID
#[patch("/tags/{id}")]
async fn update_tag_by_id(
    path: Path<Uuid>,
    body: Json<UpdateTagSchema>,
    data: Data<AppState>
) -> impl Responder {
    let tag_id = path.into_inner();

    let query = r#"
        UPDATE tags SET name = COALESCE($1, name)
        WHERE id = $2 RETURNING *
    "#;

    match sqlx::query_as::<_, TagModel>(query)
        .bind(&body.name)
        .bind(tag_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(updated_tag) => HttpResponse::Ok().json(json!({
            "status": "success",
            "tag": updated_tag
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to update tag: {:?}", error)
        })),
    }
}

/// Rota para deletar uma tag por ID
#[delete("/tags/{id}")]
async fn delete_tag_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let tag_id = path.into_inner();

    match sqlx::query!("DELETE FROM tags WHERE id = $1", tag_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to delete tag: {:?}", error)
        })),
    }
}

/// Configuração das rotas de tag
pub fn config_tags(cfg: &mut ServiceConfig) {
    cfg.service(create_tag)
       .service(get_all_tags)
       .service(get_tag_by_id)
       .service(update_tag_by_id)
       .service(delete_tag_by_id);
}

