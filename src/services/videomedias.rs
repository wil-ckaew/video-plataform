use actix_web::{
    get, post, delete, patch, web::{Data, Json, scope, Query, Path, ServiceConfig}, HttpResponse, Responder
};
use serde_json::json;
use crate::{
    models::VideoMediaModel,
    schema::{CreateVideoMediaSchema, UpdateVideoMediaSchema, FilterOptions},
    AppState
};
use sqlx::PgPool;
use uuid::Uuid;

/// Função para criar um novo vídeo
#[post("/videomedia")]
pub async fn criar_video_media(
    body: Json<CreateVideoMediaSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let query = r#"
        INSERT INTO videomedia (video_id, video_path, status)
        VALUES ($1, $2, $3)
        RETURNING id, video_id, video_path, status
    "#;

    match sqlx::query_as::<_, VideoMediaModel>(query)
        .bind(body.video_id)
        .bind(&body.video_path)
        .bind(&body.status)
        .fetch_one(&data.db)
        .await
    {
        Ok(videomedia) => {
            let response = json!({
                "status": "sucesso",
                "videomedia": {
                    "id": videomedia.id,
                    "video_id": videomedia.video_id,
                    "video_path": videomedia.video_path,
                    "status": videomedia.status,
                }
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "erro",
                "mensagem": format!("Falha ao criar videomedia: {:?}", error),
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função para buscar todos os vídeos
#[get("/videomedias")]
pub async fn obter_todos_videos_media(
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
        Ok(novos_videos_media) => {
            let response = json!({
                "status": "sucesso",
                "videos_media": novos_videos_media
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "erro",
                "mensagem": format!("Falha ao obter videos_media: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função para atualizar um vídeo existente
#[patch("/videosmedias/{id}")]
pub async fn atualizar_video_media_por_id(
    path: Path<Uuid>,
    body: Json<UpdateVideoMediaSchema>,
    data: Data<AppState>
) -> impl Responder {
    let video_id = path.into_inner();

    let query = r#"
        UPDATE videomedias
        SET video_id = COALESCE($1, video_id),
            video_path = COALESCE($2, video_path),
            status = COALESCE($3, status)
        WHERE id = $4
        RETURNING *
    "#;

    match sqlx::query_as::<_, VideoMediaModel>(query)
        .bind(body.video_id.as_ref())
        .bind(body.video_path.as_ref())
        .bind(body.status.as_ref())
        .bind(video_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(video_media_atualizado) => {
            let response = json!({
                "status": "sucesso",
                "video": video_media_atualizado
            });
            HttpResponse::Ok().json(response)
        }
        Err(update_error) => {
            let response = json!({
                "status": "erro",
                "mensagem": format!("Falha ao atualizar videomedia: {:?}", update_error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função para buscar um vídeo pelo ID
#[get("/videosmedias/{id}")]
pub async fn obter_video_media_por_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let video_id = path.into_inner();

    match sqlx::query_as!(
        VideoMediaModel,
        "SELECT * FROM videomedias WHERE id = $1",
        video_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(videomedia) => {
            let response = json!({
                "status": "sucesso",
                "videomedia": videomedia
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "erro",
                "mensagem": format!("Falha ao obter videomedia: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função para deletar um vídeo
#[delete("/videosmedias/{id}")]
pub async fn deletar_video_media_por_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let video_id = path.into_inner();

    match sqlx::query!(
        r#"
        DELETE FROM videomedias
        WHERE id = $1
        "#,
        video_id
    )
    .execute(&data.db)
    .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(error) => {
            eprintln!("Falha ao deletar vídeo: {:?}", error);
            HttpResponse::InternalServerError().finish()
        }
    }
}

// Configuração das rotas para vídeos
pub fn configurar_videos_media(conf: &mut ServiceConfig) {
    conf.service(criar_video_media)
       .service(obter_todos_videos_media)
       .service(obter_video_media_por_id)
       .service(atualizar_video_media_por_id)
       .service(deletar_video_media_por_id);
}
