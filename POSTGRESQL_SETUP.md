# PostgreSQL Setup Guide

## What Changed

The project has been converted from MySQL to PostgreSQL:

- Updated `backend/db/connect.go` to use PostgreSQL driver
- Updated `backend/go.mod` to use `gorm.io/driver/postgres`
- Converted all UUID types from `char(36)` to native `uuid` type
- Converted MySQL-specific types (tinyint, enum, datetime) to PostgreSQL equivalents
- Updated frontend `.env` to point to localhost backend

## Prerequisites

1. **Install PostgreSQL**
   - Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
   - macOS: `brew install postgresql`
   - Or use PostgreSQL cloud service (Neon, Supabase, etc.)

2. **Install Go** (if not already installed)
   - Download from https://golang.org/dl/

## Setup Steps

### 1. Create PostgreSQL Database

```bash
# Start PostgreSQL service (if local)
sudo service postgresql start

# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE pharmacy_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO postgres;
\q
```

### 2. Configure Environment Variables

Edit `backend/.env` with your PostgreSQL credentials:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmacy_db
DB_SSLMODE=disable
JWT_SECRET=your_secure_jwt_secret_here
PORT=8080
FRONTEND=http://localhost:5173
FRONTEND2=http://localhost:3000
```

### 3. Install Backend Dependencies

```bash
cd backend
go mod tidy
```

### 4. Run Database Migrations

Uncomment the migration line in `backend/cmd/server/main.go`:

```go
func init() {
    // config.LoadEnvVariable()  // Uncomment if you want strict env validation
    db.ConnectToDb()
    db.MigrateTables()  // Uncomment this line
}
```

### 5. Start the Backend

```bash
cd backend
make run
```

The backend will start on http://localhost:8080

### 6. Start the Frontend

```bash
cd client
npm install  # if not already done
npm run dev
```

The frontend will start on http://localhost:5173

## Using Cloud PostgreSQL (Recommended)

Instead of local PostgreSQL, you can use a cloud service:

### Option 1: Neon (Free tier available)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `.env`:
   ```env
   DB_USER=your_neon_user
   DB_PASSWORD=your_neon_password
   DB_HOST=your-project.neon.tech
   DB_PORT=5432
   DB_NAME=neondb
   DB_SSLMODE=require
   ```

### Option 2: Supabase (Free tier available)
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy connection details
5. Update `.env` accordingly

### Option 3: Railway (Free tier available)
1. Sign up at https://railway.app
2. Create PostgreSQL database
3. Copy connection details
4. Update `.env` accordingly

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `sudo service postgresql status`
- Verify database exists: `psql -U postgres -l`
- Check `.env` file has correct credentials
- Look at backend logs for specific errors

### Frontend shows "Loading..."
- Ensure backend is running on port 8080
- Check browser console for errors
- Verify `client/.env` has `VITE_API_BASE_URL=http://localhost:8080/api`
- Restart frontend after changing `.env`

### Database connection errors
- For local: Use `DB_SSLMODE=disable`
- For cloud: Use `DB_SSLMODE=require`
- Check firewall settings
- Verify credentials are correct

## Next Steps

After successful setup:
1. Create initial admin user (you may need to add seed data)
2. Test login functionality
3. Explore the pharmacy management features
