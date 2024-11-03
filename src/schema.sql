-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'parent', 'student', 'guardian')),
    users_date TIMESTAMP DEFAULT NOW()
);

-- Tabela de Vídeos
CREATE TABLE videos (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_path VARCHAR(255),
    slug VARCHAR(100) UNIQUE,
    published_at TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    num_likes INTEGER DEFAULT 0,
    num_views INTEGER DEFAULT 0,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    video_date TIMESTAMP DEFAULT NOW()
);

-- Tabela de Pais (Parentes)
CREATE TABLE parents (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
    parents_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Alunos
CREATE TABLE students (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL
    students_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Responsáveis
CREATE TABLE guardians (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    guardians_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Telefones
-- Tabela de Telefones
CREATE TABLE phones (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,        -- Associa o telefone a um usuário
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,    -- Ou a um parente
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,  -- Ou a um aluno
    guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE, -- Ou a um responsável
    number VARCHAR(15) NOT NULL,  -- Número de telefone
    phone_type VARCHAR(20) CHECK (phone_type IN ('home', 'work', 'mobile'))  -- Tipo de telefone (residencial, trabalho, móvel)
);

-- Tabela de Endereços
CREATE TABLE addresses (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- Associa o endereço a um usuário
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,  -- Ou a um parente
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,  -- Ou a um aluno
    guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,  -- Ou a um responsável
    street VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL
);


-- Tabela de Mídia dos Vídeos
CREATE TABLE videomedias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL,
    video_path VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    FOREIGN KEY (video_id) REFERENCES videos(id)
);

-- Tabela de Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Tabela de Relacionamento Vídeo-Tags
CREATE TABLE video_tags (
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);
