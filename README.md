# FileForge - Distributed File Management System

FileForge is a modern, secure, and distributed file management system built using **FastAPI** and **ReactJS**. It allows users to upload, organize, and manage files and folders in a structured hierarchy, with full support for **JWT authentication** and **Google OAuth login**. The system stores files in **MinIO (S3-compatible object storage)** and file metadata in **PostgreSQL**. 

All components are **fully containerized** with Docker for easy development and deployment.

---

## 🧱 Tech Stack

###  Backend (FastAPI)
- **FastAPI** – blazing fast Python web framework for APIs
- **SQLAlchemy** – ORM for PostgreSQL integration
- **PostgreSQL** – for storing file metadata (filename, size, MIME type, folder nesting, ownership)
- **MinIO** – S3-compatible object storage for uploaded files
- **JWT Authentication** – secure user login using access tokens
- **Google OAuth** – social login integration via Google
- **Docker + Docker Compose** – containerized infrastructure
- **Pydantic + pydantic-settings** – robust configuration and data validation

###  Frontend (React + Vite)
- **ReactJS** – component-based SPA architecture
- **Vite** – ultra-fast dev server and bundler
- **Axios** – API communication layer
- **JWT** – used in frontend to persist authentication session
- **Google Sign-In** – seamless OAuth login with redirect flow

---

### 🖼️ Schema Diagram

The diagram illustrates the relational structure connecting users, folders, and files. It highlights key associations such as folder nesting (`parent_id`) and file-folder linkage (`folder_id`), forming the backbone of the file management system.
![Database Schema](https://github.com/saketjha34/FileForge/blob/main/asset/images/database-schema.png)

## 📦 Features

### 🔐 Authentication
- User registration and login using **username/password**
- **Google OAuth** login integration
- JWT-based access tokens with secure headers

### 📁 Folder System
- Create nested folders (parent-child hierarchy)
- Rename, delete, and manage folders recursively
- Real-time folder `date_modified` tracking

### 🗂️ File Management
- Upload files into any folder
- Track file metadata: MIME type, size, upload time
- Display files with metadata in UI
- Automatically update folder timestamps on file operations

### 🐳 Deployment
- Fully containerized with **Docker**
- `docker-compose` handles backend, PostgreSQL, and MinIO services
- `.env` file support for all secrets and configuration

---

## 🧪 API Highlights

### 🔐 Authentication

| Method | Endpoint    | Description                        |
| ------ | ----------- | ---------------------------------- |
| POST   | `/register` | Register a new user                |
| POST   | `/login`    | Log in using username and password |


### 📁 Folder Management

| Method | Endpoint                       | Description                                          |
| ------ | ------------------------------ | ---------------------------------------------------- |
| GET    | `/folders/`                    | Retrieve all folders owned by the authenticated user |
| POST   | `/folders/`                    | Create a new folder (supports nested folders)        |
| GET    | `/folders/{folder_id}/details` | Retrieve details and nested structure of a folder    |
| POST   | `/folders/rename`              | Rename an existing folder                            |
| DELETE | `/folders/{folder_id}`         | Delete a folder and all of its contents              |


### 🗂️ File Management

| Method | Endpoint                      | Description                                           |
| ------ | ----------------------------- | ----------------------------------------------------- |
| POST   | `/upload_files`               | Upload a file (optionally into a specific folder)     |
| GET    | `/myfiles/`                   | Retrieve all files uploaded by the authenticated user |
| GET    | `/myfiles/{file_id}`          | Get details of a file by its `file_id`                |
| POST   | `/myfiles/rename`             | Rename a file                                         |
| DELETE | `/myfiles/delete/{file_id}`   | Delete a file by its `file_id`                        |
| GET    | `/myfiles/download/{file_id}` | Download a file by its `file_id`                      |


---

## ✨ Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

---

## 📜 License

This project is licensed under the MIT License.

---

## 📸 Screenshots 

---

## 🙌 Acknowledgements

* [FastAPI](https://fastapi.tiangolo.com/)
* [MinIO](https://min.io/)
* [PostgreSQL](https://www.postgresql.org/)
* [Docker](https://www.docker.com/)
* [ReactJS](https://reactjs.org/)
* [Vite](https://vitejs.dev/)
