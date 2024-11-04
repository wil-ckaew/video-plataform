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

pub fn config(cfg: &mut ServiceConfig) {
    cfg.service(
        actix_web::web::scope("/api")
            .configure(videos::config_videos)
            .configure(videomedias::configurar_videos_media)
            .configure(tags::config_tags)
            .configure(users::config_users)
            .configure(parents::config_parents)
            .configure(students::config_students)
            .configure(guardians::config_guardians)
            .configure(addresses::config_addresses)
            .configure(phones::config_phones)
    );
}
