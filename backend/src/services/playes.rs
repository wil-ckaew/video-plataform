use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Query, Path, ServiceConfig},
    HttpResponse, Responder,
};
use serde_json::json;
use crate::{
    models::VideoModel,
    schema::{CreateVideoSchema, UpdateVideoSchema, FilterOptions},
    AppState,
};
use sqlx::PgPool;
use uuid::Uuid;

/// Função para criar um novo telefone
#[post("/playes")]
async fn create_playes(
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
        Ok(playe) => {
            let response = json!( {
                "status": "success",
                "playe": {
                    "id": playe.id,
                    "title": playe.title,
                    "description": playe.description,
                    "thumbnail_path": playe.thumbnail_path,
                    "slug": playe.slug,
                    "published_at": playe.published_at,
                    "is_published": playe.is_published,
                    "num_likes": playe.num_likes,
                    "num_views": playe.num_views,
                    "author_id": playe.author_id,
                    "video_date": playe.video_date,
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to create playes: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}
/*
/// Função para listar todos os telefones
#[get("/phones")]
async fn get_all_phones(
    opts: Query<FilterOptions>,
    data: Data<AppState>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as::<_, PhoneModel>(
        r#"
        SELECT 
            id,
            user_id,
            student_id,
            parent_id,
            guardian_id,
            number,
            phone_type
        FROM phones 
        ORDER BY id 
        LIMIT $1 OFFSET $2
        "#
    )
    .bind(limit as i32)
    .bind(offset as i32)
    .fetch_all(&data.db)
    .await
    {
        Ok(phones) => {
            let response = json!( {
                "status": "success",
                "phones": phones
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to get phones: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função para buscar um telefone pelo ID
#[get("/phones/{id}")]
async fn get_phone_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let phone_id = path.into_inner();

    match sqlx::query_as::<_, PhoneModel>("SELECT * FROM phones WHERE id = $1")
        .bind(phone_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(phone) => HttpResponse::Ok().json(json!({"status": "success", "phone": phone})),
        Err(error) => HttpResponse::NotFound().json(json!({"status": "error", "message": format!("Failed to get phone: {:?}", error)})),
    }
}

/// Função para atualizar um telefone existente
#[patch("/phones/{id}")]
async fn update_phone_by_id(
    path: Path<Uuid>,
    body: Json<UpdatePhoneSchema>,
    data: Data<AppState>
) -> impl Responder {
    let phone_id = path.into_inner();

    match sqlx::query_as!(
        PhoneModel,
        "SELECT * FROM phones WHERE id = $1",
        phone_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(phone) => {
            let update_result = sqlx::query_as!(
                PhoneModel,
                "UPDATE phones SET 
                    user_id = COALESCE($1, user_id), 
                    student_id = COALESCE($2, student_id), 
                    parent_id = COALESCE($3, parent_id),
                    guardian_id = COALESCE($4, guardian_id),
                    number = COALESCE($5, number),
                    phone_type = COALESCE($6, phone_type)
                WHERE id = $7 RETURNING *",
                body.user_id.as_ref(),
                body.student_id.as_ref(),
                body.parent_id.as_ref(),
                body.guardian_id.as_ref(),
                body.number.as_ref(),
                body.phone_type.as_ref(),
                phone_id
                
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_phone) => {
                    let response = json!({
                        "status": "success",
                        "phone": updated_phone
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!({
                        "status": "error",
                        "message": format!("Failed to update phone: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!({
                "status": "error",
                "message": format!("Phone not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}


/// Função para deletar um telefone
#[delete("/phones/{id}")]
async fn delete_phone_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let phone_id = path.into_inner();

    match sqlx::query!("DELETE FROM phones WHERE id = $1", phone_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to delete phone: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}
*/
/// Configuração das rotas para telefones
pub fn config_playes(conf: &mut ServiceConfig) {
    conf.service(create_playes);
       // .service(get_all_phones)
       // .service(get_phone_by_id)
      //  .service(update_phone_by_id)
      //  .service(delete_phone_by_id);
}
