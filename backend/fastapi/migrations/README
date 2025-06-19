
## 📁 `Database Migrations`

### 🔄 Autogenerate a New Migration

```bash
docker compose run --rm web alembic revision --autogenerate -m "create tests table"
```

### ⬆️ Upgrade to Latest Revision

```bash
docker compose run --rm web alembic upgrade head
```

### ⬇️ Downgrade One Step Back

```bash
docker compose run --rm web alembic downgrade -1
```

### ⬇️ Downgrade to a Specific Revision

```bash
docker compose run --rm web alembic downgrade <revision_id>
```

##  Migration History

### Show Migration History

```bash
docker compose run --rm web alembic history
```

### Show Current Migration State

```bash
docker compose run --rm web alembic current
```

### Stamp the Current DB without Applying

```bash
docker compose run --rm web alembic stamp head
```