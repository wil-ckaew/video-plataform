// src/models.rs
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{NaiveDate, NaiveDateTime, DateTime, Utc};

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct UserModel {
    pub id: Uuid,
    pub username: String,
    pub password_hash: String,
    pub role: String,
    pub users_date: Option<DateTime<Utc>>, // <-- ALTERADO PARA Option
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ParentModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub name: String,
    pub email: String,
    pub parents_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct GuardianModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub name: String,
    pub relationship: String,
    pub guardians_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct StudentModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub name: String,
    pub email: String,
    pub age: i32,
    pub birth_date: Option<NaiveDate>,
    pub shirt_size: Option<String>,
    pub parent_id: Option<Uuid>,
    pub group_id: Option<Uuid>,
    pub students_date: Option<DateTime<Utc>>, // <-- IMPORTANTE!
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AddressModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub student_id: Option<Uuid>,
    pub guardian_id: Option<Uuid>,
    pub street: String,
    pub city: String,
    pub state: String,
    pub zip_code: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PhoneModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub student_id: Option<Uuid>,
    pub guardian_id: Option<Uuid>,
    pub number: String,
    pub phone_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AttendanceModel {
    pub id: Uuid,
    pub student_id: Uuid,
    pub date: NaiveDate,
    pub status: String,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct AttendanceWithStudent {
    pub id: Uuid,
    pub student_id: Uuid,
    pub student_name: String,
    pub student_group_name: Option<String>, // 👈 aqui
    pub attendance_date: NaiveDate,
    pub status: String,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct VideoModel {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub thumbnail_path: Option<String>,
    pub slug: Option<String>,
    pub published_at: Option<NaiveDateTime>,
    pub is_published: Option<bool>,
    pub num_likes: Option<i32>,
    pub num_views: Option<i32>,
    pub author_id: Option<Uuid>,
    pub video_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct VideoMediaModel {
    pub id: Uuid,
    pub video_id: Uuid,
    pub video_path: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct MeusVideoModel {
    pub id: Uuid,
    pub student_id: Uuid,
    pub filename: String,
    pub description: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PhotoModel {
    pub id: Uuid,
    pub student_id: Uuid,
    pub filename: String,
    pub description: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct FileMetadataModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub file_type: String,
    pub filename: String,
    pub description: Option<String>,
    pub uploaded_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct DocumentModel {
    pub id: Uuid,
    pub student_id: Uuid,
    pub doc_type: String,
    pub filename: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TaskModel {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LogModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub action: String,
    pub description: Option<String>,
    pub timestamp: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TagModel {
    pub id: Uuid,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct VideoTagModel {
    pub video_id: Uuid,
    pub tag_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct WarningModel {
    pub id: Uuid,
    pub student_id: Uuid,
    pub reason: String,
    pub warning_date: Option<DateTime<Utc>>,
}

#[derive(sqlx::FromRow, serde::Serialize)]
pub struct GroupModel {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ChatRoomModel {
    pub id: Uuid,
    pub name: Option<String>,
    pub is_group: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct MessageModel {
    pub id: Uuid,
    pub room_id: Uuid,
    pub sender_id: Uuid,
    pub content: String,
    pub sent_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ScheduleChangeModel {
    pub id: Uuid,
    pub group_id: Option<Uuid>,
    pub old_date: Option<NaiveDateTime>,
    pub new_date: Option<NaiveDateTime>,
    pub reason: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}
