// src/schema.rs
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{NaiveDate, NaiveDateTime};

/// USERS
#[derive(Debug, Deserialize)]
pub struct CreateUserSchema {
    pub username: String,
    pub password_hash: String,  // ou 'password' se for texto puro (veja nota)
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserSchema {
    pub username: Option<String>,
    pub password_hash: Option<String>,
    pub role: Option<String>,
}


/// PARENTS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateParentSchema {
    pub user_id: Option<Uuid>,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateParentSchema {
    pub user_id: Option<Uuid>,
    pub name: Option<String>,
    pub email: Option<String>,
}

/// GUARDIANS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateGuardianSchema {
    pub user_id: Option<Uuid>,
    pub name: String,
    pub relationship: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateGuardianSchema {
    pub user_id: Option<Uuid>,
    pub name: Option<String>,
    pub relationship: Option<String>,
}

/// STUDENTS
#[derive(Debug, Deserialize)]
pub struct CreateStudentSchema {
    pub user_id: Uuid,
    pub name: String,
    pub email: String,
    pub age: i32,
    pub birth_date: Option<NaiveDate>,
    pub shirt_size: Option<String>,
    pub parent_id: Option<Uuid>,
    pub group_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStudentSchema {
    pub user_id: Option<Uuid>,
    pub name: Option<String>,
    pub email: Option<String>,
    pub age: Option<i32>,
    pub birth_date: Option<NaiveDate>,
    pub shirt_size: Option<String>,
    pub parent_id: Option<Uuid>,
    pub group_id: Option<Uuid>,
}

/// ADDRESSES
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAddressSchema {
    pub user_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub student_id: Option<Uuid>,
    pub guardian_id: Option<Uuid>,
    pub street: String,
    pub city: String,
    pub state: String,
    pub zip_code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateAddressSchema {
    pub user_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub student_id: Option<Uuid>,
    pub guardian_id: Option<Uuid>,
    pub street: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub zip_code: Option<String>,
}

/// PHONES
#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePhoneSchema {
    pub user_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub student_id: Option<Uuid>,
    pub guardian_id: Option<Uuid>,
    pub number: String,
    pub phone_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePhoneSchema {
    pub user_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub student_id: Option<Uuid>,
    pub guardian_id: Option<Uuid>,
    pub number: Option<String>,    // deve ser Option<String>
    pub phone_type: Option<String>,
}

/// ATTENDANCES
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAttendanceSchema {
    pub student_id: Uuid,
    pub date: NaiveDate,
    pub status: String,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateAttendanceSchema {
    pub student_id: Option<Uuid>,
    pub date: Option<NaiveDate>,
    pub status: Option<String>,
    pub notes: Option<String>,  // <-- adicione essa linha
}

/// VIDEOS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateVideoSchema {
    pub title: String,
    pub description: Option<String>,
    pub thumbnail_path: Option<String>,
    pub slug: Option<String>,
    pub published_at: Option<NaiveDateTime>,
    pub is_published: Option<bool>,
    pub num_likes: Option<i32>,
    pub num_views: Option<i32>,
    pub author_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateVideoSchema {
    pub title: Option<String>,
    pub description: Option<String>,
    pub thumbnail_path: Option<String>,
    pub slug: Option<String>,
    pub published_at: Option<NaiveDateTime>,
    pub is_published: Option<bool>,
    pub num_likes: Option<i32>,
    pub num_views: Option<i32>,
    pub author_id: Option<Uuid>,
}

/// VIDEO MEDIA
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateVideoMediaSchema {
    pub video_id: Uuid,
    pub video_path: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateVideoMediaSchema {
    pub video_id: Option<Uuid>,
    pub video_path: Option<String>,
    pub status: Option<String>,
}

/// TAGS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTagSchema {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTagSchema {
    pub name: Option<String>,
}

/// VIDEO TAGS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateVideoTagSchema {
    pub video_id: Uuid,
    pub tag_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateVideoTagSchema {
    pub video_id: Option<Uuid>,
    pub tag_id: Option<Uuid>,
}

/// GROUPS
#[derive(serde::Deserialize)]
pub struct CreateGroupSchema {
    pub name: String,
    pub description: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct UpdateGroupSchema {
    pub name: Option<String>,
    pub description: Option<String>,
}

/// WARNINGS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateWarningSchema {
    pub student_id: Uuid,
    pub reason: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateWarningSchema {
    pub student_id: Option<Uuid>,
    pub reason: Option<String>,
}

/// CHAT ROOMS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateChatRoomSchema {
    pub name: Option<String>,
    pub is_group: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateChatRoomSchema {
    pub name: Option<String>,
    pub is_group: Option<bool>,
}

/// MESSAGES
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateMessageSchema {
    pub room_id: Uuid,
    pub sender_id: Uuid,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateMessageSchema {
    pub content: Option<String>,
}

/// SCHEDULE CHANGES
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateScheduleChangeSchema {
    pub group_id: Option<Uuid>,
    pub old_date: Option<NaiveDateTime>,
    pub new_date: Option<NaiveDateTime>,
    pub reason: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateScheduleChangeSchema {
    pub group_id: Option<Uuid>,
    pub old_date: Option<NaiveDateTime>,
    pub new_date: Option<NaiveDateTime>,
    pub reason: Option<String>,
}

/// DOCUMENTS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateDocumentSchema {
    pub student_id: Uuid,
    pub doc_type: String,
    pub filename: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDocumentSchema {
    pub student_id: Option<Uuid>,
    pub doc_type: Option<String>,
    pub filename: Option<String>,
}

/// FILE METADATA
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateFileMetadataSchema {
    pub user_id: Option<Uuid>,
    pub file_type: String,
    pub filename: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateFileMetadataSchema {
    pub user_id: Option<Uuid>,
    pub file_type: Option<String>,
    pub filename: Option<String>,
    pub description: Option<String>,
}

/// TASKS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTaskSchema {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTaskSchema {
    pub title: Option<String>,
    pub content: Option<String>,
}

/// PHOTOS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePhotoSchema {
    pub student_id: Uuid,
    pub filename: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePhotoSchema {
    pub student_id: Option<Uuid>,
    pub filename: Option<String>,
    pub description: Option<String>,
}

/// MEUS VÍDEOS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateMeusVideoSchema {
    pub student_id: Uuid,
    pub filename: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateMeusVideoSchema {
    pub student_id: Option<Uuid>,
    pub filename: Option<String>,
    pub description: Option<String>,
}

/// LOGS
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLogSchema {
    pub user_id: Option<Uuid>,
    pub action: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateLogSchema {
    pub user_id: Option<Uuid>,
    pub action: Option<String>,
    pub description: Option<String>,
}

/// FILTROS
#[derive(Debug, Serialize, Deserialize)]
pub struct FilterOptions {
    pub limit: Option<usize>,
    pub page: Option<usize>,
}
