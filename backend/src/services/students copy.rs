use actix_web::{
    get, post, delete, patch, web::{Data, Json, scope, Query, Path, ServiceConfig}, HttpResponse, Responder
};
use serde_json::json;
use crate::{
    models::StudentModel,
    schema::{CreateStudentSchema, UpdateStudentSchema, FilterOptions},
    AppState
};
use sqlx::PgPool;
use uuid::Uuid;

/// Handler para criar um estudante
#[post("/students")]
async fn create_student(
    body: Json<CreateStudentSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
        INSERT INTO students (user_id, name, email, age, parent_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, name, email, age, parent_id, students_date
    "#;

    match sqlx::query_as::<_, StudentModel>(query)
        .bind(body.user_id)
        .bind(&body.name)
        .bind(&body.email)
        .bind(&body.age)
        .bind(&body.parent_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(student) => {
            let response = json!({
                "status": "success",
                "parent": {
                    "id": student.id,
                    "user_id": student.user_id,
                    "name": student.name,
                    "email": student.email,
                    "age": student.age,
                    "parent_id": student.parent_id,
                    "students_date": student.students_date
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to create student: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Handler para obter todos os estudantes
#[get("/students")]
async fn get_all_students(
    opts: Query<FilterOptions>,
    data: Data<AppState>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(
        StudentModel,
        "SELECT * FROM students ORDER BY id LIMIT $1 OFFSET $2",
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(students) => {
            let response = json!({
                "status": "success",
                "students": students
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get students: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Handler para obter um estudante por ID
#[get("/students/{id}")]
async fn get_student_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let student_id = path.into_inner();

    match sqlx::query_as!(
        StudentModel,
        "SELECT * FROM students WHERE id = $1",
        student_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(student) => {
            let response = json!({
                "status": "success",
                "student": student
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get student: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Handler para atualizar um estudante por ID
#[patch("/students/{id}")]
async fn update_student_by_id(
    path: Path<Uuid>,
    body: Json<UpdateStudentSchema>,
    data: Data<AppState>
) -> impl Responder {
    let student_id = path.into_inner();

    match sqlx::query_as!(StudentModel, "SELECT * FROM students WHERE id = $1", student_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(student) => {
            let update_result = sqlx::query_as!(
                StudentModel,
                "UPDATE students SET user_id = COALESCE($1, user_id), name = COALESCE($2, name), email = COALESCE($3, email),age = COALESCE($4, age), parent_id = COALESCE($5, parent_id)
                WHERE id = $6 RETURNING *",
                body.user_id.as_ref(),
                body.name.as_ref(),
                body.email.as_ref(),
                body.age.as_ref(),
                body.parent_id.as_ref(),
                student_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_student) => {
                    let response = json!({
                        "status": "success",
                        "student": updated_student
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!({
                        "status": "error",
                        "message": format!("Failed to update student: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!({
                "status": "error",
                "message": format!("Student not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

/// Handler para deletar um estudante por ID
#[delete("/students/{id}")]
async fn delete_student_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let student_id = path.into_inner();

    match sqlx::query!("DELETE FROM students WHERE id = $1", student_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(error) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Failed to delete student: {:?}", error)
        })),
    }
}

// Configuração das rotas para estudantes
pub fn config_students(conf: &mut ServiceConfig) {
    conf.service(create_student)
       .service(get_all_students)
       .service(get_student_by_id)
       .service(update_student_by_id)
       .service(delete_student_by_id);
}
