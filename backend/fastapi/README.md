# 🚀 FastAPI Backend FileForge


## 🐳 Running with Docker

### ✅ Step 1: Build and run the container

bash
```
cd fastapi/app
```

```bash
docker-compose up --build
```

This will:

* Build the Docker image using the `Dockerfile`
* Start the FastAPI app on `http://localhost:8000`

### 🛑 Step 2: Stop the container

```bash
docker-compose down
```

Access the interactive API docs at:

* Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

| Purpose                            | Command             |
| ---------------------------------- | ------------------- |
| List all databases                 | `\l`                |
| Connect to a database              | `\c db_name`        |
| List all tables in current DB      | `\dt`               |
| List all tables including system   | `\dt *.*`           |
| List tables in a specific schema   | `\dt schema_name.*` |
| View table structure (columns)     | `\d table_name`     |
| List all relations (tables, views) | `\d`                |
| Show all schemas                   | `\dn`               |
| Show all users/roles               | `\du`               |
| Quit `psql`                        | `\q`                |