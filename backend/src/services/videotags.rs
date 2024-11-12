use actix_web::{
    get, post, delete, patch, web::{Data, Json, Path, ServiceConfig}, HttpResponse, Responder
};
use serde_json::json;
use uuid::Uuid;
use crate::{
    models::VideoTagModel,
    schema::{CreateVideoTagSchema, UpdateVideoTagSchema, FilterOptions},
    AppState
};

/// Função para criar um nova tag
#[post("/videotags")]
pub async fn create_videotag(
    body: Json<CreateVideoTagSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let query = r#"
        INSERT INTO video_tags (video_id, tag_id)
        VALUES ($1, $2)
        RETURNING video_id, tag_id
    "#;

    match sqlx::query_as::<_, VideoTagModel>(query)
        .bind(&body.video_id)
        .bind(&body.tag_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(videotag) => {
            let response = json!({
                "status": "sucesso",
                "videotag": {
                    "video_id": videotag.video_id,
                    "tag_id": videotag.tag_id,
                }
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "erro",
                "mensagem": format!("Falha ao criar videotag: {:?}", error),
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Rota para obter todas as tags
#[get("/videotags")]
async fn get_all_videotags(data: Data<AppState>) -> impl Responder {
    let query = "SELECT * FROM video_tags ORDER BY video_id";

    match sqlx::query_as::<_, VideoTagModel>(query).fetch_all(&data.db).await {
        Ok(videotags) => HttpResponse::Ok().json(json!({
            "status": "success",
            "videotags": videotags
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get videotags: {:?}", error)
        })),
    }
}

/// Rota para obter uma videotag por video_id
#[get("/videotags/{id}")]
async fn get_videotag_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let videotag_id = path.into_inner();

    match sqlx::query_as!(VideoTagModel, "SELECT * FROM video_tags WHERE video_id = $1", videotag_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(videotag) => HttpResponse::Ok().json(json!({
            "status": "success",
            "videotag": videotag
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get videotag: {:?}", error)
        })),
    }
}

/// Rota para atualizar uma tag por ID
#[patch("/videotags/{id}")]
async fn update_videotag_by_id(
    path: Path<Uuid>,
    body: Json<UpdateVideoTagSchema>,
    data: Data<AppState>
) -> impl Responder {
    let videotag_id = path.into_inner();

    let query = r#"
        UPDATE video_tags SET tag_id = COALESCE($1, tag_id)
        WHERE video_id = $2 RETURNING *
    "#;

    match sqlx::query_as::<_, VideoTagModel>(query)
        .bind(&body.tag_id)
        .bind(videotag_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(updated_videotag) => HttpResponse::Ok().json(json!({
            "status": "success",
            "videotag": updated_videotag
        })),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to update videotag: {:?}", error)
        })),
    }
}

/// Rota para deletar uma videotag por video_id
#[delete("/tags/{id}")]
async fn delete_videotag_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let videotag_id = path.into_inner();

    match sqlx::query!("DELETE FROM video_tags WHERE video_id = $1", videotag_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to delete videotag: {:?}", error)
        })),
    }
}

/// Configuração das rotas de videotag
pub fn config_videotags(conf: &mut ServiceConfig) {
    conf.service(create_videotag)
       .service(get_all_videotags)
       .service(get_videotag_by_id)
       .service(update_videotag_by_id)
       .service(delete_videotag_by_id);
}

