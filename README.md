# FileForge - Distributed File Management System

FileForge is a modern, secure, and distributed file management system built using **FastAPI** and **ReactJS**. It allows users to upload, organize, and manage files and folders in a structured hierarchy, with full support for **JWT authentication** and **Google OAuth login**. The system stores files in **MinIO (S3-compatible object storage)** and file metadata in **PostgreSQL**. 

All components are **fully containerized** with Docker for easy development and deployment.


## 🧱 Tech Stack

### Backend (FastAPI)
- **FastAPI** – blazing fast Python web framework for APIs
- **SQLAlchemy** – ORM for PostgreSQL integration
- **PostgreSQL** – for storing file metadata (filename, size, MIME type, folder nesting, ownership)
- **MinIO** – S3-compatible object storage for uploaded files
- **JWT Authentication** – secure user login using access tokens
- **Google OAuth** – social login integration via Google
- **Docker + Docker Compose** – containerized infrastructure
- **Pydantic + pydantic-settings** – robust configuration and data validation

### Frontend (React + Vite)
- **ReactJS** – component-based SPA architecture
- **Vite** – ultra-fast dev server and bundler
- **Axios** – API communication layer
- **JWT** – used in frontend to persist authentication session


### 🖼️ Schema Diagram

The diagram illustrates the relational structure connecting users, folders, and files. It highlights key associations such as folder nesting (`parent_id`) and file-folder linkage (`folder_id`), forming the backbone of the file management system.

![Database Schema](https://github.com/saketjha34/FileForge/blob/main/asset/images/database-schema.png)


## 📦 Features

### 🔐 Authentication
- User registration and login using **username/password**
- **OAuth** login integration
- JWT-based access tokens with secure headers

### 📁 Folder System
- Create nested folders (parent-child hierarchy)
- Rename, delete, and manage folders recursively
- Real-time folder `date_modified` tracking
- Download entire folders (with contents) as ZIP

### 🗂️ File Management
- Track file metadata: MIME type, size, upload time
- Display files with metadata in UI
- Automatically update folder timestamps on file operations
- Rename and delete files
- Download individual files

### ⬆️ Uploads
- **Upload Single Files** into any folder
- **Upload Folders**: recursively extract and store full folder structures from ZIP files

### 🌟 Favorites
- Mark **files or folders** as favorite
- Unmark favorites
- Retrieve a list of all favorites (files + folders)


## 🧪 API Highlights

### 🔐 Authentication

| Method | Endpoint    | Description                        |
| ------ | ----------- | ---------------------------------- |
| POST   | `/register` | Register a new user                |
| POST   | `/login`    | Log in using username and password |


### 📁 Folder Management

| Method | Endpoint                       | Description                                          |
|--------|--------------------------------|------------------------------------------------------|
| GET    | `/folders/`                    | Retrieve all folders owned by the authenticated user |
| POST   | `/folders/`                    | Create a new folder (supports nested folders)        |
| GET    | `/folders/{folder_id}/details` | Retrieve details and nested structure of a folder    |
| POST   | `/folders/rename`              | Rename an existing folder                            |
| DELETE | `/folders/{folder_id}`         | Delete a folder and all of its contents              |


### 🗂️ File Management

| Method | Endpoint                      | Description                                           |
|--------|-------------------------------|-------------------------------------------------------|
| POST   | `/upload_file`                | Upload a single file (optionally into a folder)       |
| POST   | `/upload_folder`              | Upload a ZIP containing nested folders and files      |
| GET    | `/myfiles/`                   | Retrieve all files uploaded by the authenticated user |
| GET    | `/myfiles/{file_id}`          | Get details of a file by its `file_id`                |
| POST   | `/myfiles/rename`             | Rename a file                                         |
| DELETE | `/myfiles/delete/{file_id}`   | Delete a file by its `file_id`                        |
| GET    | `/myfiles/download/{file_id}` | Download a file by its `file_id`                      |


### 🌟 Favorites

You can mark **any item (file or folder)** as a favorite for quick access.

| Method | Endpoint                            | Description                                           |
|--------|-------------------------------------|-------------------------------------------------------|
| POST   | `/favorites/`                       | Mark a file or folder as favorite                     |
| DELETE | `/favorites/}`                      | Unmark a file or folder from favorites                |
| GET    | `/favorites/`                       | List all favorite files and folders                   |



## ✨ Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.


## 📜 License



## 📸 Screenshots

_coming soon_


## 🙌 Acknowledgements

* [FastAPI](https://fastapi.tiangolo.com/)
* [MinIO](https://min.io/)
* [PostgreSQL](https://www.postgresql.org/)
* [Docker](https://www.docker.com/)
* [ReactJS](https://reactjs.org/)
* [Vite](https://vitejs.dev/)
