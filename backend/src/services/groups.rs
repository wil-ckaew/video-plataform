// backend/src/services/groups.rs
use actix_web::{
    get, post, patch, delete,
    web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder,
};
use serde_json::json;
use uuid::Uuid;

use crate::{
    models::GroupModel,
    schema::{CreateGroupSchema, UpdateGroupSchema, FilterOptions},
    AppState,
};

/// Criar um novo grupo
#[post("/groups")]
async fn create_group(
    data: Data<AppState>,
    body: Json<CreateGroupSchema>,
) -> impl Responder {
    let query = r#"
        INSERT INTO groups (name, description)
        VALUES ($1, $2)
        RETURNING id, name, description, created_at
    "#;

    match sqlx::query_as::<_, GroupModel>(query)
        .bind(&body.name)
        .bind(&body.description)
        .fetch_one(&data.db)
        .await
    {
        Ok(group) => HttpResponse::Created().json(json!({ "status": "success", "group": group })),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao criar grupo: {}", err)
        })),
    }
}

/// Listar todos os grupos com paginação
#[get("/groups")]
async fn get_all_groups(
    data: Data<AppState>,
    opts: Query<FilterOptions>,
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    let query = r#"
        SELECT id, name, description, created_at
        FROM groups
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    "#;

    match sqlx::query_as::<_, GroupModel>(query)
        .bind(limit as i32)
        .bind(offset as i32)
        .fetch_all(&data.db)
        .await
    {
        Ok(groups) => HttpResponse::Ok().json(json!({ "status": "success", "groups": groups })),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao listar grupos: {}", err)
        })),
    }
}

/// Obter um grupo por ID
#[get("/groups/{id}")]
async fn get_group_by_id(
    data: Data<AppState>,
    path: Path<Uuid>,
) -> impl Responder {
    let group_id = path.into_inner();

    let query = "SELECT id, name, description, created_at FROM groups WHERE id = $1";

    match sqlx::query_as::<_, GroupModel>(query)
        .bind(group_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(group) => HttpResponse::Ok().json(json!({ "status": "success", "group": group })),
        Err(err) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": format!("Grupo não encontrado: {}", err)
        })),
    }
}

/// Atualizar grupo por ID
#[patch("/groups/{id}")]
async fn update_group_by_id(
    data: Data<AppState>,
    path: Path<Uuid>,
    body: Json<UpdateGroupSchema>,
) -> impl Responder {
    let group_id = path.into_inner();

    let query = r#"
        UPDATE groups SET
            name = COALESCE($1, name),
            description = COALESCE($2, description)
        WHERE id = $3
        RETURNING id, name, description, created_at
    "#;

    match sqlx::query_as::<_, GroupModel>(query)
        .bind(body.name.as_deref())
        .bind(body.description.as_deref())
        .bind(group_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(group) => HttpResponse::Ok().json(json!({ "status": "success", "group": group })),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao atualizar grupo: {}", err)
        })),
    }
}

/// Deletar grupo por ID
#[delete("/groups/{id}")]
async fn delete_group_by_id(
    data: Data<AppState>,
    path: Path<Uuid>,
) -> impl Responder {
    let group_id = path.into_inner();

    match sqlx::query("DELETE FROM groups WHERE id = $1")
        .bind(group_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao deletar grupo: {}", err)
        })),
    }
}

/// Registrar rotas do módulo groups
pub fn config_groups(cfg: &mut ServiceConfig) {
    cfg.service(create_group)
        .service(get_all_groups)
        .service(get_group_by_id)
        .service(update_group_by_id)
        .service(delete_group_by_id);
}
