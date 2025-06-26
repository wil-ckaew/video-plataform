use actix_web::{
    get, post, delete, patch, web::{Data, Json, scope, Query, Path, ServiceConfig}, HttpResponse, Responder
};
use serde_json::json;
use crate::{
    models::GuardianModel,
    schema::{CreateGuardianSchema, UpdateGuardianSchema, FilterOptions},
    AppState
};
use sqlx::PgPool;
use uuid::Uuid;

/// Função para criar um novo responsável
#[post("/guardians")]
async fn create_guardian(
    body: Json<CreateGuardianSchema>,
    data: Data<AppState>
) -> impl Responder {
    let query = r#"
        INSERT INTO guardians (id, user_id, name, relationship)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, name, relationship, guardians_date
        "#;
  
        match sqlx::query_as::<_, GuardianModel>(query)
        .bind(&body.user_id)
        .bind(&body.name)
        .bind(&body.relationship)
        .fetch_one(&data.db)
        .await
    {
        Ok(guardian) => {
            let response = json!({
                "status": "success",
                "guardian": {
                    "id": guardian.id,
                    "user_id": guardian.user_id,
                    "name": guardian.name,
                    "relationship": guardian.relationship,
                    "guardians_date": guardian.guardians_date
                }
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to create guardian: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função para listar todos os responsáveis
#[get("/guardians")]
async fn get_all_guardians(
    opts: Query<FilterOptions>,
    data: Data<AppState>
) -> impl Responder {
    let limit = opts.limit.unwrap_or(10);
    let offset = (opts.page.unwrap_or(1) - 1) * limit;

    match sqlx::query_as!(
        GuardianModel,
        "SELECT * FROM guardians ORDER BY id LIMIT $1 OFFSET $2",
        limit as i32,
        offset as i32
    )
    .fetch_all(&data.db)
    .await
    {
        Ok(guardians) => {
            let response = json!({
                "status": "success",
                "guardians": guardians
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get guardians: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função para buscar um responsável pelo ID
#[get("/guardians/{id}")]
async fn get_guardian_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let guardian_id = path.into_inner();

    match sqlx::query_as!(
        GuardianModel,
        "SELECT * FROM guardians WHERE id = $1",
        guardian_id
    )
    .fetch_one(&data.db)
    .await
    {
        Ok(guardian) => {
            let response = json!({
                "status": "success",
                "guardian": guardian
            });
            HttpResponse::Ok().json(response)
        }
        Err(error) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to get guardian: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função para atualizar um responsável existente
#[patch("/guardians/{id}")]
async fn update_guardian_by_id(
    path: Path<Uuid>,
    body: Json<UpdateGuardianSchema>,
    data: Data<AppState>
) -> impl Responder {
    let guardian_id = path.into_inner();

    match sqlx::query_as!(GuardianModel, "SELECT * FROM guardians WHERE id = $1", guardian_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(guardian) => {
            let update_result = sqlx::query_as!(
                GuardianModel,
                "UPDATE guardians SET user_id = COALESCE($1, user_id),  name = COALESCE($2, name), relationship = COALESCE($3, relationship) WHERE id = $4 RETURNING *",
                body.user_id.as_ref(),
                body.name.as_ref(),
                body.relationship.as_ref(),
                guardian_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_guardian) => {
                    let response = json!({
                        "status": "success",
                        "guardian": updated_guardian
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!({
                        "status": "error",
                        "message": format!("Failed to update guardian: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!({
                "status": "error",
                "message": format!("Guardian not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}


/// Função para deletar um responsável
#[delete("/guardians/{id}")]
async fn delete_guardian_by_id(
    path: Path<Uuid>,
    data: Data<AppState>
) -> impl Responder {
    let guardian_id = path.into_inner();

    match sqlx::query!("DELETE FROM guardians WHERE id = $1", guardian_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            let response = json!({
                "status": "error",
                "message": format!("Failed to delete guardian: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

/// Função de configuração dos serviços de guardian
pub fn config_guardians(conf: &mut ServiceConfig) {
    conf.service(create_guardian)
       .service(get_all_guardians)
       .service(get_guardian_by_id)
       .service(update_guardian_by_id)
       .service(delete_guardian_by_id);
}
