use actix_web::{
    get, post, delete, patch, web::{Data, Json, scope, Query, Path, ServiceConfig}, HttpResponse, Responder,
};
use serde_json::json;
use crate::{
    models::UserModel,
    schema::{CreateUserSchema, UpdateUserSchema, FilterOptions},
    AppState,
};
use sqlx::PgPool;
use uuid::Uuid;

/// Endpoint para criar um novo usuário
#[post("/users")]
async fn create_user(
    body: Json<CreateUserSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let query = r#"
        INSERT INTO users (username, password_hash, role)
        VALUES ($1, $2, $3)
        RETURNING id, username, password_hash, role, users_date
    "#;

    match sqlx::query_as::<_, UserModel>(query)
        .bind(&body.username)
        .bind(&body.password_hash)
        .bind(&body.role)
        .fetch_one(&data.db)
        .await
    {
        Ok(user) => {
            let response = json!({
                "status": "success",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role,
                    "users_date": user.users_date
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to create user: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Endpoint para obter todos os usuários
#[get("/users")]
pub async fn get_all_users(
    opts: Query<FilterOptions>,
    data: Data<AppState>,
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(
        UserModel,
        "SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2",
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(users) => {
            let response = json!({
                "status": "success",
                "users": users
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get users: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Endpoint para obter um usuário por ID
#[get("/users/{id}")]
async fn get_user_by_id(
    path: Path<Uuid>,
    data: Data<AppState>,
) -> impl Responder {
    let user_id = path.into_inner();

    match sqlx::query_as!(
        UserModel,
        "SELECT * FROM users WHERE id = $1",
        user_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(user) => {
            let response = json!({
                "status": "success",
                "user": user
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("User not found: {:?}", error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

/// Endpoint para atualizar um usuário por ID
#[patch("/users/{id}")]
async fn update_user_by_id(
    path: Path<Uuid>,
    body: Json<UpdateUserSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let user_id = path.into_inner();

    match sqlx::query_as!(
        UserModel,
        "SELECT * FROM users WHERE id = $1",
        user_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(_) => {
            let update_result = sqlx::query_as!(
                UserModel,
                r#"
                UPDATE users SET 
                    username = COALESCE($1, username), 
                    password_hash = COALESCE($2, password_hash), 
                    role = COALESCE($3, role)
                WHERE id = $4 
                RETURNING id, username, password_hash, role, users_date
                "#,
                body.username.as_ref(),
                body.password_hash.as_ref(),
                body.role.as_ref(),
                user_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_user) => {
                    let response = json!({
                        "status": "success",
                        "user": updated_user
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!({
                        "status": "error",
                        "message": format!("Failed to update user: {:?}", update_error)
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

/// Endpoint para deletar um usuário por ID
#[delete("/users/{id}")]
async fn delete_user_by_id(
    path: Path<Uuid>,
    data: Data<AppState>,
) -> impl Responder {
    let user_id = path.into_inner();

    match sqlx::query!("DELETE FROM users WHERE id = $1", user_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to delete user: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Configuração das rotas de usuários
pub fn config_users(conf: &mut ServiceConfig) {
    conf.service(create_user)
       .service(get_all_users)
       .service(get_user_by_id)
       .service(update_user_by_id)
       .service(delete_user_by_id);
}
