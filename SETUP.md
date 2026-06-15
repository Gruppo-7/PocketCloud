# PocketCloud Setup Guide

## Requirements

Before starting, make sure the following software is installed:

* Docker Desktop
* Git
* Node.js (only required for mobile development)

Check installation:

```bash
docker --version
git --version
```

---

## Project Structure

PocketCloud uses a Dockerized architecture:

```text
PocketCloud/
├── mobile/
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── database/
│   │   └── schema.sql
│   └── utils/
├── docker/
│   └── nginx/
│       └── nginx.conf
├── docker-compose.yml
├── .env.example
├── SETUP.md
```

Architecture:

```text
Mobile App
        ↓
Nginx (Port 80)
        ↓
Node/Express Server (Port 3000)
        ↓
PostgreSQL
```

---

## Environment Setup

### 1. Create root environment file

Copy:

```text
.env.example
```

Rename to:

```text
.env
```

Edit values if needed:

```env
DB_USER=PocketCloud_User
DB_PASSWORD=12345
DB_NAME=PocketCloud
```

---

### 2. Create backend environment file

Go to:

```text
server/
```

Copy:

```text
.env.example
```

Rename to:

```text
.env
```

Example:

```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=PocketCloud_User
DB_PASSWORD=12345
DB_NAME=PocketCloud

PORT=3000
```

---

## Run PocketCloud

From the project root:

```bash
docker compose up --build
```

On first startup Docker will:

* Create PostgreSQL container
* Initialize PostgreSQL schema
(including encryption-ready user metadata)
* Start Node server
* Start Nginx reverse proxy

Expected containers:

```text
pocketcloud-postgres
pocketcloud-server
pocketcloud-nginx
```

---

## Access PocketCloud

Find your local IP address.

Example:

```text
192.168.1.55
```

PocketCloud server:

```text
http://YOUR_LOCAL_IP
```

Health endpoint:

```text
http://YOUR_LOCAL_IP/health
```

Expected response:

```json
{
  "status": "online",
  "database": "connected"
}
```

---

## Useful Docker Commands

Start containers:

```bash
docker compose up
```

Rebuild containers:

```bash
docker compose up --build
```

Stop containers:

```bash
docker compose down
```

View logs:

```bash
docker compose logs
```

View specific container logs:

```bash
docker compose logs pocketcloud-server
```

List running containers:

```bash
docker ps
```

---

## Storage Persistence

PocketCloud uses Docker volumes for persistence.

Persistent data:

* PostgreSQL database
* Uploaded files
* Encrypted file metadata
* Sharing metadata

Data survives:

* `docker compose down`
* container rebuilds
* machine restart

---

## Troubleshooting

### App cannot connect to server

Check containers:

```bash
docker ps
```

Verify health endpoint:

```text
http://YOUR_LOCAL_IP/health
```

---

### Database connection issues

Check logs:

```bash
docker compose logs pocketcloud-postgres
```

Expected message:

```text
database system is ready to accept connections
```

---

### Server issues

Check backend logs:

```bash
docker compose logs pocketcloud-server
```

---

## Notes

PocketCloud currently runs locally over HTTP inside trusted LAN environments.

Optional client-side encryption is already supported for sensitive files.

## Security

PocketCloud supports optional client-side encryption.

Encrypted files:

* are encrypted locally on-device
* use AES-256-CBC encryption
* never expose plaintext to the server
* remain encrypted at rest

Master key security:

* derived using PBKDF2-SHA256
* stored securely on-device
* never transmitted to the server
* protected through password-based encryption

Shared encrypted files use local re-encryption, meaning the server never gains access to decrypted file content.