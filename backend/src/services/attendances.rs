// backend/src/services/attendances.rs
use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Path, Query, ServiceConfig},
    HttpResponse, Responder
};
use serde_json::json;
use uuid::Uuid;
use chrono::NaiveDate;

use crate::{
    AppState,
    schema::{CreateAttendanceSchema, UpdateAttendanceSchema, FilterOptions},
    models::{AttendanceModel},
};

// Novo struct com campo opcional para o nome do grupo
#[derive(sqlx::FromRow, serde::Serialize)]
pub struct AttendanceWithGroup {
    pub id: Uuid,
    pub student_id: Uuid,
    pub student_name: String,
    pub student_group_name: Option<String>,  // Pode ser None se não houver grupo
    pub attendance_date: NaiveDate,
    pub status: String,
    pub notes: Option<String>,
}

/// Criar uma presença
#[post("/attendances")]
async fn create_attendance(
    data: Data<AppState>,
    body: Json<CreateAttendanceSchema>
) -> impl Responder {
    let query = r#"
        INSERT INTO attendances (student_id, date, status, notes)
        VALUES ($1, $2, $3, $4)
    RETURNING id, student_id, date, status, notes
    "#;

    match sqlx::query_as::<_, AttendanceModel>(query)
        .bind(body.student_id)
        .bind(body.date)
        .bind(&body.status)
        .bind(&body.notes)
        .fetch_one(&data.db)
        .await
    {
        Ok(attendance) => HttpResponse::Created().json(json!({
            "status": "success",
            "attendance": attendance
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to create attendance: {:?}", e)
        })),
    }
}

/// Listar todas as presenças com nome do aluno e nome do grupo
#[get("/attendances")]
async fn get_all_attendances(
    data: Data<AppState>,
    opts: Query<FilterOptions>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    let query = r#"
        SELECT 
            a.id,
            a.student_id,
            s.name AS student_name,
            g.name AS student_group_name,
            a.date AS attendance_date,
            a.status,
            a.notes
        FROM attendances a
        JOIN students s ON a.student_id = s.id
        LEFT JOIN groups g ON s.group_id = g.id
        ORDER BY a.date DESC
        LIMIT $1 OFFSET $2
    "#;

    match sqlx::query_as::<_, AttendanceWithGroup>(query)
        .bind(limit as i64)
        .bind(offset as i64)
        .fetch_all(&data.db)
        .await
    {
        Ok(attendances) => HttpResponse::Ok().json(json!({
            "status": "success",
            "attendances": attendances
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to get attendances: {:?}", e)
        })),
    }
}

/// Obter presença por ID
#[get("/attendances/{id}")]
async fn get_attendance_by_id(
    data: Data<AppState>,
    path: Path<Uuid>
) -> impl Responder {
    let id = path.into_inner();

    let query = "SELECT id, student_id, date, status, notes FROM attendances WHERE id = $1";

    match sqlx::query_as::<_, AttendanceModel>(query)
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(attendance) => HttpResponse::Ok().json(json!({
            "status": "success",
            "attendance": attendance
        })),
        Err(e) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": format!("Attendance not found: {:?}", e)
        })),
    }
}

/// Atualizar presença
#[patch("/attendances/{id}")]
async fn update_attendance_by_id(
    data: Data<AppState>,
    path: Path<Uuid>,
    body: Json<UpdateAttendanceSchema>
) -> impl Responder {
    let id = path.into_inner();

    let query = r#"
        UPDATE attendances
        SET student_id = COALESCE($1, student_id),
            date = COALESCE($2, date),
            status = COALESCE($3, status),
            notes = COALESCE($4, notes)
        WHERE id = $5
        RETURNING id, student_id, date, status, notes
    "#;

    match sqlx::query_as::<_, AttendanceModel>(query)
        .bind(body.student_id)
        .bind(body.date)
        .bind(&body.status)
        .bind(&body.notes)
        .bind(id)
        .fetch_one(&data.db)
        .await
    {
        Ok(updated) => HttpResponse::Ok().json(json!({
            "status": "success",
            "attendance": updated
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to update attendance: {:?}", e)
        })),
    }
}

/// Excluir presença
#[delete("/attendances/{id}")]
async fn delete_attendance_by_id(
    data: Data<AppState>,
    path: Path<Uuid>
) -> impl Responder {
    let id = path.into_inner();

    let query = "DELETE FROM attendances WHERE id = $1";

    match sqlx::query(query)
        .bind(id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to delete attendance: {:?}", e)
        })),
    }
}

/// Configuração de rotas
pub fn config_attendances(cfg: &mut ServiceConfig) {
    cfg.service(create_attendance)
        .service(get_all_attendances)
        .service(get_attendance_by_id)
        .service(update_attendance_by_id)
        .service(delete_attendance_by_id);
}

