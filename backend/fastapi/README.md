# 🚀 FastAPI Backend – **FileForge**

This is a backend service built with **FastAPI** that supports user authentication, nested folder structures, and object storage using MinIO.

---

## 🐳 Running with Docker

### ✅ Step 1: Build and Run the Container

```bash
cd fastapi
docker-compose up --build
```

This will:

* 🔧 Build the Docker image using the `Dockerfile`
* 🧠 Start all services defined in `docker-compose.yml`
* 🚀 Launch the FastAPI app at `http://localhost:8000`

---

### 🔍 Step 2: Access API Documentation

* **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 🛑 Step 3: Stopping Containers

To gracefully shut down all running containers:

```bash
docker-compose down
```

This stops and removes the containers, but **preserves your data volumes** (like database and object storage contents).

---

### 🧼 Optional: Delete All Volumes (⚠️ Destroys Persistent Data)

To remove all containers **and** delete associated volumes:

```bash
docker-compose down -v
```

> ⚠️ **Warning**: This will permanently delete your PostgreSQL DB and MinIO bucket data.

---

## 🛠️ Advanced Usage

### 🧪 Run a Service Interactively (e.g., PostgreSQL Shell)

```bash
docker exec -it <container_name> /bin/bash
```

Then you can access the Postgres CLI:

```bash
psql -U <username> -d <database>
```

Example:

```bash
docker exec -it postgres_container /bin/bash
psql -U postgres -d fileforge_db
```


### 🧩 Key Components

The system is backed by a PostgreSQL database schema that models:

![Database Schema](https://github.com/saketjha34/FileForge/blob/main/asset/images/database-schema.png)

* **Users**: Registered individuals who can own files and folders.
* **Folders**: Hierarchical containers that support nesting via parent-child relationships.
* **Files**: Uploaded assets that are associated with specific folders and owners, storing metadata such as MIME type, size, and timestamps.

### 🗄️ Object Storage – MinIO

All actual file contents are stored in **MinIO**, a high-performance, S3-compatible object storage system.

* Files are uploaded to a **designated bucket** in MinIO.
* The relational database stores only the metadata (like filename, size, and location), while the file data itself resides in MinIO.
* This separation of metadata and actual storage ensures scalability and performance across distributed environments.

### 🖼️ Schema Diagram

The diagram illustrates the relational structure connecting users, folders, and files. It highlights key associations such as folder nesting (`parent_id`) and file-folder linkage (`folder_id`), forming the backbone of the file management system.



### 📜 Common PostgreSQL Commands (Inside Docker)

| Purpose                            | Command             | Docker Usage Notes                                           |
| ---------------------------------- | ------------------- | ------------------------------------------------------------ |
| List all databases                 | `\l`                | Run after entering `psql` shell inside the container         |
| Connect to a database              | `\c db_name`        | Switches to the specified database                           |
| List all tables in current DB      | `\dt`               | Shows user-defined tables only                               |
| List all tables including system   | `\dt *.*`           | Lists tables from all schemas including internal/system ones |
| List tables in a specific schema   | `\dt schema_name.*` | Useful when organizing tables under custom schemas           |
| View table structure (columns)     | `\d table_name`     | Displays table schema, indexes, foreign keys, etc.           |
| List all relations (tables, views) | `\d`                | Lists all relations including tables, sequences, views       |
| Show all schemas                   | `\dn`               | Lists all available schemas                                  |
| Show all users/roles               | `\du`               | Displays existing roles and their privileges                 |

---

### 🐳 How to Use These Commands in Docker

1. **Enter your PostgreSQL container:**

```bash
docker exec -it <container_name> psql -U <username> -d <database>
```


2. **Once inside the `psql` prompt**, you can use any of the `\` commands from the table above.

> 💡 Tip: Use `\?` in `psql` to see all available meta-commands.
