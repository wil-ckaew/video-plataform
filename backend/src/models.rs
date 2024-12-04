// src/models.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{NaiveDateTime, DateTime, Utc};

// Estrutura de exemplo do modelo do usuário
#[derive(Serialize, FromRow)]
pub struct UserModel {
    pub id: Uuid,
    pub username: String,
    pub password_hash: String,
    pub role: String,
    pub users_date: Option<DateTime<Utc>>, // Altere para DateTime<Utc>
}

/// Estrutura para representar um pai (parent)
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ParentModel {
    pub id: Uuid, 
    pub user_id: Option<Uuid>,  // Como este é obrigatório, deixe como Uuid
    pub name: String,
    pub email: String,
    pub parents_date: Option<DateTime<Utc>>,
}


/// Estrutura para representar um aluno (student)
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct StudentModel {
    pub id: Uuid,                  // ID único do aluno
    pub user_id: Option<Uuid>,          // ID do usuário associado
    pub name: String,              // Nome do aluno
    pub email: String,             // Email do aluno
    pub parent_id: Option<Uuid>,   // ID do pai associado (opcional)
    pub students_date: Option<DateTime<Utc>>, // Data de criação
}

/// Estrutura que representa um responsável
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct GuardianModel {
    pub id: Uuid,                // ID do responsável
    pub user_id: Option<Uuid>,         // ID do usuário associado
    pub name: String,           // Nome do responsável
    pub relationship: String,    // Relacionamento com o aluno
    pub guardians_date: Option<DateTime<Utc>>,
}

/// Estrutura que representa um endereço
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct AddressModel {
    pub id: Uuid,              // ID do endereço
    pub user_id: Option<Uuid>,          // ID do usuário associado
    pub parent_id: Option<Uuid>,   // ID do pai associado (opcional)
    pub student_id: Option<Uuid>, 
    pub guardian_id: Option<Uuid>, 
    pub street: String,        // Rua do endereço
    pub city: String,          // Cidade do endereço
    pub state: String,         // Estado do endereço
    pub zip_code: String,      // Código postal do endereço
}

/// Estrutura que representa um telefone
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PhoneModel {
    pub id: Uuid,                // ID do telefone
    pub user_id: Option<Uuid>,   // ID do usuário associado ao telefone (opcional)
    pub parent_id: Option<Uuid>, // ID do parente associado ao telefone (opcional)
    pub student_id: Option<Uuid>, // ID do aluno associado ao telefone (opcional)
    pub guardian_id: Option<Uuid>, // ID do responsável associado ao telefone (opcional)
    pub number: String,          // Número de telefone
    pub phone_type: Option<String>,      // Tipo de telefone (home, work, mobile)
}

/// Estrutura para representar um vídeo
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct VideoModel {
    pub id: Uuid,                              // ID único do vídeo
    pub title: String,                         // Título do vídeo
    pub description: Option<String>,           // Descrição opcional do vídeo
    pub thumbnail_path: Option<String>,        // Caminho para a miniatura do vídeo
    pub slug: Option<String>,                  // Slug opcional para URL amigável
    pub published_at: Option<NaiveDateTime>,   // Data de publicação
    pub is_published: Option<bool>,            // Status de publicação (opcional)
    pub num_likes: Option<i32>,                // Número de likes (opcional)
    pub num_views: Option<i32>,                // Número de visualizações (opcional)
    pub author_id: Option<Uuid>,               // ID do autor
    pub video_date: Option<DateTime<Utc>>, // Data de criação
    //pub video_date: Option<NaiveDateTime>,
}

#[derive(Debug, FromRow, Deserialize, Serialize)]
pub struct MeusVideoModel {
    pub id: Uuid,
    pub student_id: Uuid,
    pub filename: String,
    pub description: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(FromRow,Debug, Serialize, Deserialize)]
pub struct VideoMediaModel {
    pub id: Uuid,
    pub video_id: Uuid,
    pub video_path: String,
    pub status: String,
}
/// Estrutura para representar uma tag
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TagModel {
    pub id: Uuid,         // ID único da tag
    pub name: String,     // Nome da tag
}

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct VideoTagModel {
    pub video_id: Uuid,
    pub tag_id: Uuid,
}

#[derive(Debug, FromRow, Deserialize, Serialize)]
pub struct TaskModel {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, FromRow, Deserialize, Serialize)]
pub struct DocumentModel {
    pub id: Uuid,
    pub student_id: Uuid,  // Altere aqui de user_id para student_id
    pub doc_type: String,
    pub filename: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, FromRow, Deserialize, Serialize)]
pub struct FileMetadataModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub file_type: String,
    pub filename: String,
    pub description: Option<String>,
    pub uploaded_at: Option<DateTime<Utc>>,
}

#[derive(Debug, FromRow, Deserialize, Serialize)]
pub struct LogModel {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub action: String,
    pub description: Option<String>,
    pub timestamp: Option<DateTime<Utc>>,
}

#[derive(Debug, FromRow, Deserialize, Serialize)]
pub struct PhotoModel {
    pub id: Uuid,
    pub student_id: Uuid,
    pub filename: String,
    pub description: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}