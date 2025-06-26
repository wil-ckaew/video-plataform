use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Query, Path, ServiceConfig},
    HttpResponse, Responder,
};
use serde_json::json;
use crate::{
    models::ParentModel,
    schema::{CreateParentSchema, UpdateParentSchema, FilterOptions},
    AppState,
};
use sqlx::PgPool;
use uuid::Uuid;

#[post("/parents")]
async fn create_parent(
    body: Json<CreateParentSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let query = r#"
        INSERT INTO parents (user_id, name, email)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, name, email, parents_date
    "#;

    match sqlx::query_as::<_, ParentModel>(query)
        .bind(body.user_id)
        .bind(&body.name)
        .bind(&body.email)
        .fetch_one(&data.db)
        .await
    {
        Ok(parent) => {
            let response = json!({
                "status": "success",
                "parent": {
                    "id": parent.id,
                    "user_id": parent.user_id,
                    "name": parent.name,
                    "email": parent.email,
                    "parents_date": parent.parents_date
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to create parent: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/parents")]
pub async fn get_all_parents(
    opts: Query<FilterOptions>,
    data: Data<AppState>,
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10) as i64; // Convert limit to i64
    let offset = (opts.page.unwrap_or(1) - 1) as i64 * limit; // Convert offset to i64

    match sqlx::query_as!(
        ParentModel,
        "SELECT * FROM parents ORDER BY id LIMIT $1 OFFSET $2",
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(parents) => {
            let response = json!({
                "status": "success",
                "parents": parents
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get parents: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/parents/{id}")]
async fn get_parent_by_id(
    path: Path<Uuid>, // Path will be directly used
    data: Data<AppState>,
) -> impl Responder {
    let parent_id = path.into_inner();

    match sqlx::query_as!(
        ParentModel,
        "SELECT * FROM parents WHERE id = $1",
        parent_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(parent) => {
            let response = json!({
                "status": "success",
                "parent": parent
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get parent: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[patch("/parents/{id}")]
async fn update_parent_by_id(
    path: Path<Uuid>,
    body: Json<UpdateParentSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let parent_id = path.into_inner();

    match sqlx::query_as!(ParentModel, "SELECT * FROM parents WHERE id = $1", parent_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(parent) => {
            let update_result = sqlx::query_as!(
                ParentModel,
                "UPDATE parents SET user_id = COALESCE($1, user_id), name = COALESCE($2, name), email = COALESCE($3, email) WHERE id = $4 RETURNING *",
                body.user_id.as_ref(),
                body.name.as_ref(),
                body.email.as_ref(),
                parent_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_parent) => {
                    let response = json!({
                        "status": "success",
                        "parent": updated_parent
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!({
                        "status": "error",
                        "message": format!("Failed to update parent: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!({
                "status": "error",
                "message": format!("User not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

#[delete("/parents/{id}")]
async fn delete_parent_by_id(
    path: Path<Uuid>,
    data: Data<AppState>,
) -> impl Responder {
    let parent_id = path.into_inner();

    match sqlx::query!("DELETE FROM parents WHERE id = $1", parent_id)
        .execute(&data.db)
        .await
    {
        Ok(result) if result.rows_affected() > 0 => {
            HttpResponse::NoContent().finish()
        }
        Ok(_) => {
            let response = json!({
                "status": "error",
                "message": "Parent not found."
            });
            HttpResponse::NotFound().json(response)
        }
        Err(err) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to delete parent: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Configuração das rotas para tarefas
pub fn config_parents(conf: &mut ServiceConfig) {
    conf.service(create_parent)
       .service(get_all_parents)
       .service(get_parent_by_id)
       .service(update_parent_by_id)
       .service(delete_parent_by_id);
}
