use lapin::{
    options::*,
    types::FieldTable,
    Channel,
    Connection,
    ConnectionProperties,
    BasicProperties,
};
use std::fs;
use std::path::Path;
use std::error::Error;
use futures_util::StreamExt;

/// Função para encontrar arquivos de vídeo no diretório especificado
fn find_video_files_in_directory(dir: &str) -> Result<Vec<String>, Box<dyn Error>> {
    let video_files = fs::read_dir(dir)?
        .filter_map(Result::ok)
        .filter(|entry| {
            let path = entry.path();
            path.is_file() && (path.extension().map(|ext| ext == "mp4" || ext == "m4s").unwrap_or(false))
        })
        .map(|entry| entry.path().to_string_lossy().to_string())
        .collect::<Vec<String>>();

    if video_files.is_empty() {
        Err("Nenhum arquivo de vídeo encontrado no diretório.".into())
    } else {
        Ok(video_files)
    }
}

/// Função para enviar uma mensagem ao RabbitMQ
async fn send_message(channel: Channel, message: &str) -> Result<(), Box<dyn Error>> {
    let queue_name = "transcode_queue";
    // Declarando a fila com `durable: false` para compatibilidade
    let _queue = channel
        .queue_declare(
            queue_name, 
            QueueDeclareOptions { durable: false, ..QueueDeclareOptions::default() }, 
            FieldTable::default(),
        )
        .await?;

    channel.basic_publish(
        "",
        queue_name,
        BasicPublishOptions::default(),
        message.as_bytes().to_vec(),
        BasicProperties::default(),
    )
    .await?;

    println!("Mensagem enviada: {}", message);
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Diretório contendo arquivos de vídeo
    let video_directory = "../media/thumbnails/video-test/";
    //let video_directory = "../media/uploads/1/";

    // Encontre os arquivos de vídeo
    match find_video_files_in_directory(video_directory) {
        Ok(video_files) => {
            // Conectar ao RabbitMQ
            let conn = Connection::connect(
                "amqp://guest:guest@localhost:5672/%2f", 
                ConnectionProperties::default(),
            )
            .await?;
            
            let channel = conn.create_channel().await?;

            // Enviar cada arquivo de vídeo para a fila
            for video in video_files {
                send_message(channel.clone(), &video).await?;
            }

            println!("Todos os arquivos de vídeo foram enviados.");
        }
        Err(e) => {
            eprintln!("Erro ao ler o diretório: {}", e);
        }
    }

    Ok(())
}
