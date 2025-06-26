//backend/src/services/warnings.rs
use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder
};
use serde_json::json;
use uuid::Uuid;
use crate::{
    AppState,
    models::WarningModel,
    schema::{CreateWarningSchema, UpdateWarningSchema, FilterOptions},
};

/// Criar advertência
#[post("/warnings")]
async fn create_warning(
    data: Data<AppState>,
    body: Json<CreateWarningSchema>
) -> impl Responder {
    let query = r#"
        INSERT INTO warnings (student_id, reason)
        VALUES ($1, $2)
        RETURNING id, student_id, reason, warning_date
    "#;

    match sqlx::query_as::<_, WarningModel>(query)
        .bind(body.student_id)
        .bind(&body.reason)
        .fetch_one(&data.db)
        .await
    {
        Ok(warning) => HttpResponse::Created().json(json!({
            "status": "success",
            "warning": warning
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create warning: {:?}", e)
        })),
    }
}

/// Listar advertências
#[get("/warnings")]
async fn get_all_warnings(
    data: Data<AppState>,
    opts: Query<FilterOptions>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    let query = r#"
        SELECT id, student_id, reason, warning_date
        FROM warnings
        ORDER BY warning_date DESC
        LIMIT $1 OFFSET $2
    "#;

    match sqlx::query_as::<_, WarningModel>(query)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&data.db)
        .await
    {
        Ok(warnings) => HttpResponse::Ok().json(json!({
            "status": "success",
            "warnings": warnings
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get warnings: {:?}", e)
        })),
    }
}

/// Buscar advertência por ID
#[get("/warnings/{id}")]
async fn get_warning_by_id(
    data: Data<AppState>,
    path: Path<Uuid>
) -> impl Responder {
    let id = path.into_inner();

    let query = "SELECT id, student_id, reason, warning_date FROM warnings WHERE id = $1";

    match sqlx::query_as::<_, WarningModel>(query)
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(warning) => HttpResponse::Ok().json(json!({
            "status": "success",
            "warning": warning
        })),
        Err(e) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": format!("Warning not found: {:?}", e)
        })),
    }
}

/// Atualizar advertência
#[patch("/warnings/{id}")]
async fn update_warning_by_id(
    data: Data<AppState>,
    path: Path<Uuid>,
    body: Json<UpdateWarningSchema>
) -> impl Responder {
    let id = path.into_inner();

    let query = r#"
        UPDATE warnings
        SET student_id = COALESCE($1, student_id),
            reason = COALESCE($2, reason)
        WHERE id = $3
        RETURNING id, student_id, reason, warning_date
    "#;

    match sqlx::query_as::<_, WarningModel>(query)
        .bind(body.student_id)
        .bind(&body.reason)
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(updated) => HttpResponse::Ok().json(json!({
            "status": "success",
            "warning": updated
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to update warning: {:?}", e)
        })),
    }
}

/// Excluir advertência
#[delete("/warnings/{id}")]
async fn delete_warning_by_id(
    data: Data<AppState>,
    path: Path<Uuid>
) -> impl Responder {
    let id = path.into_inner();

    let query = "DELETE FROM warnings WHERE id = $1";

    match sqlx::query(query)
        .bind(id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to delete warning: {:?}", e)
        })),
    }
}

/// Configuração de rotas
pub fn config_warnings(cfg: &mut ServiceConfig) {
    cfg.service(create_warning)
        .service(get_all_warnings)
        .service(get_warning_by_id)
        .service(update_warning_by_id)
        .service(delete_warning_by_id);
}
