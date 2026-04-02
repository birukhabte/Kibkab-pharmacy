# Quick Start Guide

## Prerequisites
- Go 1.23+ installed
- Node.js 18+ installed
- Supabase account (free at https://supabase.com)

## Setup in 5 Minutes

### 1. Create Supabase Database (2 min)
1. Go to https://supabase.com and sign up
2. Create new project, set a password (save it!)
3. Wait for project to initialize
4. Go to Settings > Database
5. Copy your connection details

### 2. Configure Backend (1 min)
Edit `backend/.env`:
```env
DB_USER=postgres
DB_PASSWORD=YOUR_SUPABASE_PASSWORD
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_SSLMODE=require
JWT_SECRET=generate_random_string_here
PORT=8080
FRONTEND=http://localhost:5173
FRONTEND2=http://localhost:3000
```

### 3. Enable Migrations (30 sec)
Edit `backend/cmd/server/main.go`, uncomment this line:
```go
db.MigrateTables()  // Remove the // at the start
```

### 4. Start Backend (1 min)
```bash
cd backend
go mod tidy
make run
```

### 5. Start Frontend (30 sec)
```bash
cd client
npm run dev
```

### 6. Open App
Go to http://localhost:5173

## That's it! 🎉

For detailed instructions, see `SUPABASE_SETUP.md`

## Troubleshooting

**Backend won't start?**
- Check your Supabase password in `.env`
- Make sure `DB_SSLMODE=require`

**Frontend shows "Loading..."?**
- Make sure backend is running on port 8080
- Check `client/.env` has correct API URL

**Need help?**
Read the full guide in `SUPABASE_SETUP.md`
