use lapin::{
    options::*,
    types::FieldTable,
    Channel,
    Connection,
    ConnectionProperties,
    message::Delivery,
};
use futures_util::stream::StreamExt;
use std::process::Command;
use std::error::Error;

async fn process_video(file_path: &str) -> Result<(), Box<dyn Error>> {
    let output_file = format!("{}.mp4", file_path);
    
    let output = Command::new("ffmpeg")
        .args(&["-i", file_path, &output_file])
        .output()?;

    if output.status.success() {
        println!("Vídeo transcodificado com sucesso: {}", file_path);
    } else {
        eprintln!(
            "Erro ao transcodificar vídeo: {}\nErro: {:?}",
            file_path,
            String::from_utf8_lossy(&output.stderr)
        );
    }

    Ok(())
}

async fn consume_queue(channel: Channel) -> Result<(), Box<dyn Error>> {
    let queue_name = "transcode_queue";

    let _queue = channel
        .queue_declare(
            queue_name,
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await?;

    let mut consumer = channel
        .basic_consume(
            queue_name,
            "transcoder_consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;

    println!("Aguardando mensagens de vídeo para transcodificação...");

    while let Some(delivery_result) = consumer.next().await {
        match delivery_result {
            Ok((channel, delivery)) => {
                let msg = String::from_utf8_lossy(&delivery.data);

                match process_video(&msg).await {
                    Ok(_) => {
                        delivery.ack(BasicAckOptions::default()).await?;
                    }
                    Err(e) => {
                        eprintln!("Erro ao processar vídeo: {:?}", e);
                    }
                }
            }
            Err(e) => {
                eprintln!("Erro ao receber entrega: {:?}", e);
            }
        }
    }

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let conn = Connection::connect(
        "amqp://guest:guest@localhost:5672/%2f",
        ConnectionProperties::default(),
    )
    .await?;

    let channel = conn.create_channel().await?;

    consume_queue(channel).await?;

    Ok(())
}
