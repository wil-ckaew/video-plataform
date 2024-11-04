use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use dotenv::dotenv;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use std::env;
//use actix_files::Files;
use lapin::{Connection, ConnectionProperties, Channel}; // RabbitMQ
use std::sync::Arc;

mod services;
mod models;
mod schema;

pub struct AppState {
    db: Pool<Postgres>,
    rabbitmq_channel: Arc<Channel>, // Adicionando o canal do RabbitMQ
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server starting...");

    // Configure logging
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "actix_web=info");
    }
    dotenv().ok();
    env_logger::init();

    // Retrieve database URL from environment variables
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // Create the database connection pool
    let pool = match PgPoolOptions::new().max_connections(10).connect(&database_url).await {
        Ok(pool) => {
            println!("Connected to the database successfully.");
            pool
        }
        Err(error) => {
            eprintln!("Failed to connect to the database: {:?}", error);
            std::process::exit(1);
        }
    };

    // Configurar conexão com o RabbitMQ
    let amqp_url = env::var("AMQP_URL").expect("AMQP_URL deve ser definido");
    let rabbitmq_connection = Connection::connect(&amqp_url, ConnectionProperties::default())
        .await
        .expect("Falha ao conectar ao RabbitMQ");
    let rabbitmq_channel = Arc::new(
        rabbitmq_connection
            .create_channel()
            .await
            .expect("Falha ao criar canal no RabbitMQ"),
    );

    // Start the HTTP server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState { 
                db: pool.clone(),
                rabbitmq_channel: rabbitmq_channel.clone(),
            })) // Share the database pool and RabbitMQ channel across handlers
            .configure(services::config) // Register routes and services
            .wrap(Logger::default()) // Enable request logging
            .wrap(
                Cors::default()
                    .allow_any_origin() // Allow requests from any origin
                    .allow_any_method() // Allow any HTTP method
                    .allow_any_header() // Allow any headers
            )

    })
    .bind("127.0.0.1:8081")? // Bind the server to port 8080
    .run()
    .await
}
