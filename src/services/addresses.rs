// src/services/addresses.rs
use actix_web::{
    delete, get, patch, post,
    web::{Data, Json, Path, ServiceConfig},
    HttpResponse, Responder,
};
use serde_json::json;
use crate::{
    models::AddressModel,
    schema::{CreateAddressSchema, UpdateAddressSchema},
    AppState
};
use sqlx::PgPool;
use uuid::Uuid;

#[post("/addresses")]
async fn create_address(
    body: Json<CreateAddressSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let query = r#"
        INSERT INTO addresses (id, street, city, state, zip_code)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, street, city, state, zip_code
    "#;

    match sqlx::query_as::<_, AddressModel>(query)
        .bind(Uuid::new_v4()) // Gera um novo UUID para o endereço
        .bind(&body.street)
        .bind(&body.city)
        .bind(&body.state)
        .bind(&body.zip_code)
        .fetch_one(&data.db)
        .await
    {
        Ok(address) => {
            let response = json!( {
                "status": "success",
                "address": {
                    "id": address.id,
                    "street": address.street,
                    "city": address.city,
                    "state": address.state,
                    "zip_code": address.zip_code,
                }
            });
            HttpResponse::Created().json(response)
        }
        Err(error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to create address: {:?}", error)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

#[get("/addresses")]
async fn get_all_addresses(data: Data<AppState>) -> impl Responder {
    let query = "SELECT id, street, city, state, zip_code FROM addresses ORDER BY id";

    match sqlx::query_as::<_, AddressModel>(query).fetch_all(&data.db).await {
        Ok(addresses) => HttpResponse::Ok().json(json!({"status": "success", "addresses": addresses})),
        Err(error) => HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to get addresses: {:?}", error)})),
    }
}

#[get("/addresses/{id}")]
async fn get_address_by_id(
    path: Path<Uuid>,
    data: Data<AppState>,
) -> impl Responder {
    let address_id = path.into_inner();

    match sqlx::query_as!(AddressModel, "SELECT * FROM addresses WHERE id = $1", address_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(address) => HttpResponse::Ok().json(json!({"status": "success", "address": address})),
        Err(error) => HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Failed to get address: {:?}", error)})),
    }
}

#[patch("/addresses/{id}")]
async fn update_address_by_id(
    path: Path<Uuid>,
    body: Json<UpdateAddressSchema>,
    data: Data<AppState>,
) -> impl Responder {
    let address_id = path.into_inner();

    match sqlx::query_as!(AddressModel, "SELECT * FROM addresses WHERE id = $1", address_id)
        .fetch_one(&data.db)
        .await
    {
        Ok(_) => {
            let update_result = sqlx::query_as!(
                AddressModel,
                "UPDATE addresses SET street = COALESCE($1, street), city = COALESCE($2, city), state = COALESCE($3, state), zip_code = COALESCE($4, zip_code) WHERE id = $5 RETURNING *",
                body.street.as_ref(),
                body.city.as_ref(),
                body.state.as_ref(),
                body.zip_code.as_ref(),
                address_id
            )
            .fetch_one(&data.db)
            .await;

            match update_result {
                Ok(updated_address) => {
                    let response = json!( {
                        "status": "success",
                        "address": updated_address
                    });
                    HttpResponse::Ok().json(response)
                }
                Err(update_error) => {
                    let response = json!( {
                        "status": "error",
                        "message": format!("Failed to update address: {:?}", update_error)
                    });
                    HttpResponse::InternalServerError().json(response)
                }
            }
        }
        Err(fetch_error) => {
            let response = json!( {
                "status": "error",
                "message": format!("Address not found: {:?}", fetch_error)
            });
            HttpResponse::NotFound().json(response)
        }
    }
}

#[delete("/addresses/{id}")]
async fn delete_address_by_id(
    path: Path<Uuid>,
    data: Data<AppState>,
) -> impl Responder {
    let address_id = path.into_inner();

    match sqlx::query!("DELETE FROM addresses WHERE id = $1", address_id)
        .execute(&data.db)
        .await
    {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(err) => {
            let response = json!( {
                "status": "error",
                "message": format!("Failed to delete address: {:?}", err)
            });
            HttpResponse::InternalServerError().json(response)
        }
    }
}

// Configuração das rotas para endereços
pub fn config_addresses(conf: &mut ServiceConfig) {
    conf.service(create_address)
       .service(get_all_addresses)
       .service(get_address_by_id)
       .service(update_address_by_id)
       .service(delete_address_by_id);
}
