//backend/src/services/students.rs
use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Query, Path, ServiceConfig},
    HttpResponse, Responder,
};
use serde_json::json;
use crate::{
    models::StudentModel,
    schema::{CreateStudentSchema, UpdateStudentSchema, FilterOptions},
    AppState,
};
use uuid::Uuid;

/// Handler para criar um estudante
#[post("/students")]
async fn create_student(
    body: Json<CreateStudentSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
        INSERT INTO students (user_id, name, email, age, birth_date, shirt_size, parent_id, group_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, name, email, age, birth_date, shirt_size, parent_id, group_id, students_date
    "#;

    match sqlx::query_as::<_, StudentModel>(query)
        .bind(body.user_id)
        .bind(&body.name)
        .bind(&body.email)
        .bind(body.age)
        .bind(body.birth_date)
        .bind(&body.shirt_size)
        .bind(body.parent_id)       // Option<Uuid>
        .bind(body.group_id)        // Option<Uuid>
        .fetch_one(&data.db)
        .await
    {
        Ok(student) => {
            HttpResponse::Created().json(json!({
                "status": "success",
                "student": student
            }))
        }
        Err(error) => {
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": format!("Failed to create student: {:?}", error)
            }))
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
        r#"
        SELECT id, user_id, name, email, age, birth_date, shirt_size, parent_id, group_id, students_date
        FROM students
        ORDER BY id
        LIMIT $1 OFFSET $2
        "#,
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(students) => {
            HttpResponse::Ok().json(json!({
                "status": "success",
                "students": students
            }))
        }
        Err(error) => {
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": format!("Failed to get students: {:?}", error)
            }))
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
        r#"
        SELECT id, user_id, name, email, age, birth_date, shirt_size, parent_id, group_id, students_date
        FROM students
        WHERE id = $1
        "#,
        student_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(student) => {
            HttpResponse::Ok().json(json!({
                "status": "success",
                "student": student
            }))
        }
        Err(error) => {
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": format!("Failed to get student: {:?}", error)
            }))
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

    // Verifica se estudante existe
    match sqlx::query_as!(
        StudentModel,
        r#"
        SELECT id, user_id, name, email, age, birth_date, shirt_size, parent_id, group_id, students_date
        FROM students
        WHERE id = $1
        "#,
        student_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(_) => {
            let update_result = sqlx::query_as!(
                StudentModel,
                r#"
                UPDATE students SET
                    user_id = COALESCE($1, user_id),
                    name = COALESCE($2, name),
                    email = COALESCE($3, email),
                    age = COALESCE($4, age),
                    birth_date = COALESCE($5, birth_date),
                    shirt_size = COALESCE($6, shirt_size),
                    parent_id = COALESCE($7, parent_id),
                    group_id = COALESCE($8, group_id)
                WHERE id = $9
                RETURNING id, user_id, name, email, age, birth_date, shirt_size, parent_id, group_id, students_date
                "#,
                body.user_id,
                body.name.as_ref(),
                body.email.as_ref(),
                body.age,
                body.birth_date,
                body.shirt_size.as_ref(),
                body.parent_id,
                body.group_id,
                student_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_student) => {
                    HttpResponse::Ok().json(json!({
                        "status": "success",
                        "student": updated_student
                    }))
                }
                Err(error) => {
                    HttpResponse::InternalServerError().json(json!({
                        "status": "error",
                        "message": format!("Failed to update student: {:?}", error)
                    }))
                }
            }
        }
        Err(error) => {
            HttpResponse::NotFound().json(json!({
                "status": "error",
                "message": format!("Student not found: {:?}", error)
            }))
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

// Configuração das rotas
pub fn config_students(conf: &mut ServiceConfig) {
    conf.service(create_student)
        .service(get_all_students)
        .service(get_student_by_id)
        .service(update_student_by_id)
        .service(delete_student_by_id);
}
