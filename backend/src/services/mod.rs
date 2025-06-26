//backend/src/servides/mod.rs
use actix_web::web::ServiceConfig;

pub mod videos;
pub mod videomedias;
pub mod tags;
pub mod users;
pub mod parents;
pub mod students;
pub mod guardians;
pub mod addresses;
pub mod phones;
pub mod videouploads;
pub mod videotags;
pub mod playes;
pub mod photos;
pub mod documents;
pub mod file_metadatas;
pub mod logs;
pub mod health;
pub mod tasks;
pub mod meus_videos;
pub mod all_videos;

// Novos módulos
pub mod attendances;
pub mod warnings;
pub mod chat_rooms;
pub mod messages;
pub mod schedule_changes;
pub mod groups;

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(
        actix_web::web::scope("/api")
            .configure(videos::config_videos)
            .configure(videomedias::configurar_videos_media)
            .configure(tags::config_tags)
            .configure(videotags::config_videotags)
            .configure(users::config_users)
            .configure(parents::config_parents)
            .configure(students::config_students)
            .configure(guardians::config_guardians)
            .configure(addresses::config_addresses)
            .configure(phones::config_phones)
            .configure(videouploads::video_uploads_scope)
            .configure(playes::config_playes)
            .configure(health::config_health)
            .configure(tasks::config_tasks)
            .configure(documents::config_documents)
            .configure(photos::config_photos)
            .configure(file_metadatas::config_file_metadatas)
            .configure(logs::config_logs)
            .configure(meus_videos::config_meus_videos)
            .configure(all_videos::config_all_videos)
            // Novos serviços
            .configure(attendances::config_attendances)
            .configure(warnings::config_warnings)
            .configure(chat_rooms::config_chat_rooms)
            .configure(messages::config_messages)
            .configure(schedule_changes::config_schedule_changes)
            .configure(groups::config_groups)
    );
}
