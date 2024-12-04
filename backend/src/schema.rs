// src/schema.rs
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::NaiveDateTime;

/// Estrutura para representar os dados necessários ao criar um novo usuário
#[derive(Deserialize)]
pub struct CreateUserSchema {
    pub username: String,
    pub password_hash: String, // Altere para password
    pub role: String,
}

#[derive(Deserialize)]
pub struct UpdateUserSchema {
    pub username: Option<String>,
    pub password_hash: Option<String>, // Altere para password
    pub role: Option<String>,
}

/// Estrutura para criar um novo endereço
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAddressSchema {
    pub user_id: Option<Uuid>, 
    pub parent_id: Option<Uuid>,
    pub student_id: Option<Uuid>,  
    pub guardian_id: Option<Uuid>, 
    pub street: String,                 // Rua do endereço
    pub city: String,                   // Cidade do endereço
    pub state: String,                  // Estado do endereço
    pub zip_code: String,               // Código postal do endereço
}

/// Estrutura para atualizar um endereço existente
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateAddressSchema {
    pub user_id: Option<Uuid>, 
    pub parent_id: Option<Uuid>,
    pub student_id: Option<Uuid>,  
    pub guardian_id: Option<Uuid>, 
    pub street: Option<String>,         // Rua opcional do endereço
    pub city: Option<String>,           // Cidade opcional do endereço
    pub state: Option<String>,          // Estado opcional do endereço
    pub zip_code: Option<String>,       // Código postal opcional do endereço
}

/// Estrutura para criar um novo responsável
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateGuardianSchema {
    pub user_id: Option<Uuid>,                 // ID do usuário associado
    pub name: String,                   // Nome do responsável
    pub relationship: String,           // Relacionamento com o aluno
}

/// Estrutura para atualizar um responsável existente
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateGuardianSchema {
    pub user_id: Option<Uuid>,
    pub name: Option<String>,           // Nome opcional do responsável
    pub relationship: Option<String>,   // Relacionamento opcional com o aluno
}

/// Estrutura para representar os dados necessários ao criar um novo pai
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateParentSchema {
    pub user_id: Option<Uuid>,                 // ID do usuário associado
    pub name: String,                   // Nome do pai
    pub email: String,                  // Email do pai
}

/// Estrutura para representar os dados necessários ao atualizar um pai existente
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateParentSchema {
    pub user_id: Option<Uuid>, // Ensure this field is present
    pub name: Option<String>,
    pub email: Option<String>,
}

/// Estrutura para criar um novo telefone
#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePhoneSchema {
    pub user_id: Option<Uuid>,         // ID do usuário associado ao telefone (opcional)
    pub parent_id: Option<Uuid>,       // ID do parente associado ao telefone (opcional)
    pub student_id: Option<Uuid>,       // ID do aluno associado ao telefone (opcional)
    pub guardian_id: Option<Uuid>,     // ID do responsável associado ao telefone (opcional)
    pub number: String,                 // Número de telefone
    pub phone_type: Option<String>,         // Tipo de telefone
}

/// Estrutura para atualizar um telefone existente
#[derive(Debug, Deserialize)]
pub struct UpdatePhoneSchema {
    pub user_id: Option<Uuid>,
    pub student_id: Option<Uuid>,
    pub parent_id: Option<Uuid>,
    pub guardian_id: Option<Uuid>,
    pub number: Option<String>,     // String obrigatório
    pub phone_type: Option<String>,  // String obrigatório
}


/// Estrutura para representar os dados necessários ao criar um novo aluno
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateStudentSchema {
    pub user_id: Option<Uuid>,                // ID do usuário associado
    pub name: String,                   // Nome do aluno
    pub email: String,                  // Email do aluno
    pub parent_id: Option<Uuid>,        // ID do pai associado (opcional)
}

/// Estrutura para representar os dados necessários ao atualizar um aluno existente
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateStudentSchema {
    pub user_id: Option<Uuid>, 
    pub name: Option<String>,           // Nome do aluno (opcional para atualização)
    pub email: Option<String>,          // Email do aluno (opcional para atualização)
    pub parent_id: Option<Uuid>,        // ID do pai associado (opcional para atualização)
}

/// Estrutura para representar os dados necessários ao criar uma nova tag
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTagSchema {
    pub name: String,                   // Nome da tag
}

/// Estrutura para representar os dados necessários ao atualizar uma tag existente
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTagSchema {
    pub name: Option<String>,           // Nome da tag (opcional para atualização)
}
/*
/// Estrutura para criar um novo vídeo
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateVideoSchema {
    pub title: String,
    pub description: Option<String>,
    pub thumbnail_path: Option<String>,
    pub slug: String,
    pub published_at: Option<NaiveDateTime>,
    pub is_published: Option<bool>,
    pub num_likes: Option<i32>,
    pub num_views: Option<i32>,
    pub author_id: Uuid,
   // pub video_date: Option<NaiveDateTime>,
}
   */
   #[derive(Debug, Serialize, Deserialize)]
   pub struct CreateVideoSchema {
       pub title: String,
       pub description: Option<String>,        // Alterado para opcional
       pub thumbnail_path: Option<String>,     // Alterado para opcional
       pub slug: Option<String>,               // Alterado para opcional
       pub published_at: Option<NaiveDateTime>,// Alterado para opcional
       pub is_published: Option<bool>,         // Alterado para opcional
       pub num_likes: Option<i32>,             // Alterado para opcional
       pub num_views: Option<i32>,             // Alterado para opcional
       pub author_id: Option<Uuid>,            // Já era opcional
   }

/// Estrutura para atualizar um vídeo existente
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateVideoSchema {
    pub title: Option<String>,          // Título do vídeo
    pub description: Option<String>,    // Descrição opcional
    pub thumbnail_path: Option<String>, // Caminho para a miniatura
    pub slug: Option<String>,           // Slug opcional
    pub published_at: Option<NaiveDateTime>, // Data de publicação
    pub is_published: Option<bool>,     // Status de publicação
    pub author_id: Option<Uuid>,        // ID do autor
    pub num_likes: Option<i32>,         // Número de likes
    pub num_views: Option<i32>,         // Número de visualizações
}

/// Estrutura para criação de mídia de vídeo
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateVideoMediaSchema {
    pub video_id: Uuid,
    pub video_path: String,
    pub status: String,                 // Status do processamento/transcodificação
}

/// Estrutura para atualização de mídia de vídeo
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateVideoMediaSchema {
    pub video_path: Option<String>,
    pub video_id: Option<Uuid>,
    pub status: Option<String>,
}

/// Estrutura para criar uma associação entre vídeo e tag
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateVideoTagSchema {
    pub video_id: Uuid,
    pub tag_id: Uuid,
}

/// Estrutura para atualizar a associação entre vídeo e tag
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateVideoTagSchema {
    pub video_id: Option<Uuid>,
    pub tag_id: Option<Uuid>,
}

#[derive(Deserialize)]
pub struct CreateMeusVideoSchema {
    pub student_id: Uuid,
    pub filename: String,
    pub description: String,
}

#[derive(Deserialize)]
pub struct UpdateMeusVideoSchema {
    pub student_id: Option<Uuid>,
    pub filename: Option<String>,
    pub description: Option<String>,
}

/// Estrutura para opções de filtro
#[derive(Debug, Serialize, Deserialize)]
pub struct FilterOptions {
    pub page: Option<usize>,
    pub limit: Option<usize>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateTaskSchema {
    pub title: String,
    pub content: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateDocumentSchema {
    pub student_id: Uuid, // Altere aqui de user_id para student_id
    pub doc_type: String,
    pub filename: String, // Adicionado para corresponder à criação de documentos
}

#[derive(Deserialize)]
pub struct CreatePhotoSchema {
    pub student_id: Uuid,
    pub filename: String,
    pub description: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateFileMetadataSchema {
    pub user_id: Uuid, // Pode ser opcional se o arquivo não estiver associado a um usuário
    pub file_type: String,     // Deve ser 'video' ou 'photo'
    pub filename: String,
    pub description: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateLogSchema {
    pub user_id: Uuid, // Pode ser opcional se o arquivo não estiver associado a um usuário
    pub action: String,     // Deve ser 'video' ou 'photo'
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateTaskSchema {
    pub title: Option<String>,
    pub content: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)] // Adicionado Serialize para consistência
pub struct UpdateDocumentSchema {
    pub student_id: Option<Uuid>, // Altere aqui de user_id para student_id
    pub doc_type: Option<String>,
    pub filename: Option<String>, // Adicionado para permitir atualização do filename
}

#[derive(Deserialize)]
pub struct UpdatePhotoSchema {
    pub student_id: Option<Uuid>,
    pub filename: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateFileMetadataSchema {
    pub user_id: Option<Uuid>, // Pode ser opcional se o arquivo não estiver associado a um usuário
    pub file_type: Option<String>,     // Deve ser 'video' ou 'photo'
    pub filename: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateLogSchema {
    pub user_id: Option<Uuid>, // Pode ser opcional se o arquivo não estiver associado a um usuário
    pub action: Option<String>,     // Deve ser 'video' ou 'photo'
    pub description: Option<String>,
}