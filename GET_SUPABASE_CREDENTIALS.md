# How to Get Your Supabase Credentials

## Step 1: Create Supabase Account (1 minute)

1. Open https://supabase.com in your browser
2. Click "Start your project" 
3. Sign up with GitHub, Google, or email
4. Verify your email if needed

## Step 2: Create New Project (2 minutes)

1. Click "New Project" button
2. Fill in:
   - **Name**: `pharmacy-app`
   - **Database Password**: Create a strong password
     - **IMPORTANT**: Copy this password immediately! You'll need it.
     - Example: `MyStr0ng!Pass2024`
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Select "Free"
3. Click "Create new project"
4. Wait 2-3 minutes while Supabase sets up your database

## Step 3: Get Connection Details (30 seconds)

1. Once project is ready, you'll see the dashboard
2. Click the **Settings** icon (⚙️) in the left sidebar
3. Click **Database** in the settings menu
4. Scroll down to **Connection string** section
5. You'll see something like:

```
Host: db.abcdefghijklmnop.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [YOUR-PASSWORD]
```

## Step 4: Update Your .env File

Open `backend/.env` and update these lines:

```env
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_FROM_STEP_2
DB_HOST=db.abcdefghijklmnop.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_SSLMODE=require
```

**Example with real values:**
```env
DB_USER=postgres
DB_PASSWORD=MyStr0ng!Pass2024
DB_HOST=db.xyzabcdefghijk.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_SSLMODE=require
JWT_SECRET=my_super_secret_jwt_key_12345
PORT=8080
FRONTEND=http://localhost:5173
FRONTEND2=http://localhost:3000
```

## Step 5: You're Done!

Now run:
```bash
cd backend
go mod tidy
make run
```

Your backend will connect to Supabase and create all the tables automatically!

## Quick Copy Template

Copy this and fill in your values:

```env
DB_USER=postgres
DB_PASSWORD=
DB_HOST=db.
DB_PORT=5432
DB_NAME=postgres
DB_SSLMODE=require
JWT_SECRET=
PORT=8080
FRONTEND=http://localhost:5173
FRONTEND2=http://localhost:3000
```

## Need Help?

If you get stuck:
1. Make sure you copied the password correctly (no extra spaces)
2. Check the host starts with `db.` and ends with `.supabase.co`
3. Keep `DB_SSLMODE=require` (don't change to disable)
4. Generate JWT_SECRET with: `openssl rand -base64 32`
