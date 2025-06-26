use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Query, Path, ServiceConfig},
    HttpResponse, Responder,
};
use serde_json::json;
use crate::{
    models::PhoneModel,
    schema::{CreatePhoneSchema, UpdatePhoneSchema, FilterOptions},
    AppState,
};
use sqlx::PgPool;
use uuid::Uuid;

/// Função para criar um novo telefone
#[post("/phones")]
async fn create_phone(
    body: Json<CreatePhoneSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
        INSERT INTO phones (user_id, student_id, parent_id, guardian_id, number, phone_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, student_id, parent_id, guardian_id, number, phone_type
    "#;

    match sqlx::query_as::<_, PhoneModel>(query)
        .bind(body.user_id) // Usando diretamente porque é um Option<Uuid>
        .bind(body.student_id)
        .bind(body.parent_id)
        .bind(body.guardian_id)
        .bind(&body.number)
        .bind(&body.phone_type)
        .fetch_one(&data.db)
        .await
    {
        Ok(phone) => {
            let response = json!( {
                "status": "success",
                "phone": {
                    "id": phone.id,
                    "user_id": phone.user_id,
                    "parent_id": phone.parent_id,
                    "student_id": phone.student_id,
                    "guardian_id": phone.guardian_id,
                    "number": phone.number,
                    "phone_type": phone.phone_type,
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to create phone: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

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

#[patch("/phones/{id}")]
async fn update_phone_by_id(
    path: Path<Uuid>,
    data: Data<AppState>,
    body: Json<UpdatePhoneSchema>,
) -> impl Responder {
    let phone_id = path.into_inner();

    let number = match &body.number {
        Some(n) if !n.trim().is_empty() => n.trim().to_owned(),
        _ => {
            return HttpResponse::BadRequest().json(json!({
                "status": "error",
                "message": "O campo 'number' é obrigatório e não pode ser vazio."
            }));
        }
    };

    let query = r#"
        UPDATE phones SET
            user_id = COALESCE($1, user_id),
            parent_id = COALESCE($2, parent_id),
            student_id = COALESCE($3, student_id),
            guardian_id = COALESCE($4, guardian_id),
            number = $5,
            phone_type = COALESCE($6, phone_type)
        WHERE id = $7
        RETURNING id, user_id, student_id, parent_id, guardian_id, number, phone_type
    "#;

    match sqlx::query_as::<_, PhoneModel>(query)
        .bind(body.user_id)
        .bind(body.parent_id)
        .bind(body.student_id)
        .bind(body.guardian_id)
        .bind(number)
        .bind(body.phone_type.as_deref())
        .bind(phone_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(phone) => HttpResponse::Ok().json(json!({
            "status": "success",
            "phone": phone
        })),
        Err(err) => {
            eprintln!("Erro ao atualizar telefone: {:?}", err);
            HttpResponse::InternalServerError().json(json!({
                "status": "error",
                "message": format!("Erro ao atualizar telefone: {}", err)
            }))
        }
    }
}

/*
/// Função para atualizar um telefone existente
#[patch("/phones/{id}")]
async fn update_phone_by_id(
    path: Path<Uuid>,
    body: Json<UpdatePhoneSchema>,
    data: Data<AppState>
) -> impl Responder {
    let phone_id = path.into_inner();

    // Prepare the update query
    let update_result = sqlx::query_as!(
        PhoneModel,
        r#"
        UPDATE phones SET 
            user_id = COALESCE($1, user_id),
            student_id = COALESCE($2, student_id),
            parent_id = COALESCE($3, parent_id),
            guardian_id = COALESCE($4, guardian_id),
            number = COALESCE($5, number),
            phone_type = COALESCE($6, phone_type)
        WHERE id = $7
        RETURNING id, user_id, student_id, parent_id, guardian_id, number, phone_type
        "#,
        // Para cada um dos campos que podem ser `Option`
        body.user_id.unwrap_or(Uuid::nil()),  // Para user_id
        body.student_id.unwrap_or(Uuid::nil()), // Para student_id
        body.parent_id.unwrap_or(Uuid::nil()), // Para parent_id
        body.guardian_id.unwrap_or(Uuid::nil()), // Para guardian_id
        body.number.clone(), // Para number (não deve ser Option)
        body.phone_type.clone(), // Para phone_type (não deve ser Option)
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

*/

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

/// Configuração das rotas para telefones
pub fn config_phones(conf: &mut ServiceConfig) {
    conf.service(create_phone)
        .service(get_all_phones)
        .service(get_phone_by_id)
        .service(update_phone_by_id)
        .service(delete_phone_by_id);
}
