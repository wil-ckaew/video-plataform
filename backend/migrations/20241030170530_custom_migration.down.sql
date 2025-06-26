-- Drop tables na ordem inversa de dependência para evitar erro

DROP TABLE IF EXISTS schedule_changes;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chat_rooms;
DROP TABLE IF EXISTS warnings;
DROP TABLE IF EXISTS attendances;
DROP TABLE IF EXISTS video_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS file_metadata;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS meusvideos;
DROP TABLE IF EXISTS videomedias;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS phones;
DROP TABLE IF EXISTS guardians;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;
