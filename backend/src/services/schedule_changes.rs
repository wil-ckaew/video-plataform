//backend/src/services/schedule_changes.rs
use actix_web::{
    get, post, patch, delete,
    web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder,
};
use uuid::Uuid;
use serde_json::json;

use crate::{
    AppState,
    models::ScheduleChangeModel,
    schema::{CreateScheduleChangeSchema, UpdateScheduleChangeSchema, FilterOptions},
};

/// Criar mudança de treino
#[post("/schedule_changes")]
async fn create_schedule_change(
    data: Data<AppState>,
    body: Json<CreateScheduleChangeSchema>
) -> impl Responder {
    let query = r#"
        INSERT INTO schedule_changes (group_id, old_date, new_date, reason)
        VALUES ($1, $2, $3, $4)
        RETURNING id, group_id, old_date, new_date, reason, created_at
    "#;

    match sqlx::query_as::<_, ScheduleChangeModel>(query)
        .bind(body.group_id)
        .bind(body.old_date)
        .bind(body.new_date)
        .bind(&body.reason)
        .fetch_one(&data.db)
        .await
    {
        Ok(change) => HttpResponse::Created().json(json!({ "status": "success", "schedule_change": change })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create schedule change: {:?}", e)
        })),
    }
}

/// Listar mudanças de treino com paginação
#[get("/schedule_changes")]
async fn get_schedule_changes(
    data: Data<AppState>,
    opts: Query<FilterOptions>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    let query = r#"
        SELECT id, group_id, old_date, new_date, reason, created_at
        FROM schedule_changes
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    "#;

    match sqlx::query_as::<_, ScheduleChangeModel>(query)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&data.db)
        .await
    {
        Ok(changes) => HttpResponse::Ok().json(json!({ "status": "success", "schedule_changes": changes })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get schedule changes: {:?}", e)
        })),
    }
}

/// Atualizar mudança de treino
#[patch("/schedule_changes/{id}")]
async fn update_schedule_change(
    data: Data<AppState>,
    path: Path<Uuid>,
    body: Json<UpdateScheduleChangeSchema>
) -> impl Responder {
    let id = path.into_inner();

    let query = r#"
        UPDATE schedule_changes
        SET group_id = COALESCE($1, group_id),
            old_date = COALESCE($2, old_date),
            new_date = COALESCE($3, new_date),
            reason = COALESCE($4, reason)
        WHERE id = $5
        RETURNING id, group_id, old_date, new_date, reason, created_at
    "#;

    match sqlx::query_as::<_, ScheduleChangeModel>(query)
        .bind(body.group_id)
        .bind(body.old_date)
        .bind(body.new_date)
        .bind(&body.reason)
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(change) => HttpResponse::Ok().json(json!({ "status": "success", "schedule_change": change })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to update schedule change: {:?}", e)
        })),
    }
}

/// Deletar mudança de treino
#[delete("/schedule_changes/{id}")]
async fn delete_schedule_change(
    data: Data<AppState>,
    path: Path<Uuid>
) -> impl Responder {
    let id = path.into_inner();

    let query = "DELETE FROM schedule_changes WHERE id = $1";

    match sqlx::query(query)
        .bind(id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to delete schedule change: {:?}", e)
        })),
    }
}

/// Configuração das rotas
pub fn config_schedule_changes(cfg: &mut ServiceConfig) {
    cfg.service(create_schedule_change)
        .service(get_schedule_changes)
        .service(update_schedule_change)
        .service(delete_schedule_change);
}
