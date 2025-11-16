
# SOaC Framework Community Edition - Installation Guide

Complete guide to install and configure SOaC Framework Community Edition on your system.

---

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Detailed Setup](#detailed-setup)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [First Run](#first-run)
- [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Minimum Requirements

- **OS**: Linux, macOS, or Windows (WSL2 recommended)
- **Node.js**: 18.0 or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 5GB free space
- **Database**: PostgreSQL 14+

### Recommended Setup

- **OS**: Ubuntu 22.04 LTS or macOS Monterey+
- **Node.js**: 20.x LTS
- **RAM**: 8GB
- **Storage**: 10GB SSD
- **Database**: PostgreSQL 15+

### Prerequisites Software

1. **Node.js & Yarn**
```bash
# Install Node.js 20.x (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Yarn
npm install -g yarn
```

2. **PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql@15
```

3. **Git**
```bash
# Ubuntu/Debian
sudo apt-get install git

# macOS
brew install git
```

---

## 📦 Installation Methods

### Method 1: From GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/ge0mant1s/soacframe-community.git

# Navigate to directory
cd soacframe-community

# Install dependencies
yarn install
```

### Method 2: Download ZIP

1. Go to https://github.com/ge0mant1s/soacframe-community
2. Click "Code" → "Download ZIP"
3. Extract the archive
4. Navigate to extracted folder
5. Run `yarn install`

---

## 🔧 Detailed Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/ge0mant1s/soacframe-community.git
cd soacframe-community
```

### Step 2: Install Dependencies

```bash
# Install all Node.js dependencies
yarn install

# This will install:
# - Next.js framework
# - React and React DOM
# - Prisma ORM
# - Authentication libraries
# - UI components
# - And more...
```

### Step 3: Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit with your favorite editor
nano .env
# or
vim .env
# or
code .env
```

**Required Environment Variables:**

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/soacframe"

# Authentication Secret (Generate with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# AWS S3 (For file storage)
AWS_BUCKET_NAME="your-bucket-name"
AWS_FOLDER_PREFIX="soacframe/"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"

# Abacus AI (For AI features)
ABACUSAI_API_KEY="your-api-key"
```

---

## 💾 Database Setup

### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
postgres=# CREATE DATABASE soacframe;
postgres=# CREATE USER soacuser WITH ENCRYPTED PASSWORD 'your-password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE soacframe TO soacuser;
postgres=# \q
```

### Initialize Prisma

```bash
# Generate Prisma Client
yarn prisma generate

# Push schema to database
yarn prisma db push

# Seed database with default data
yarn prisma db seed
```

**What gets seeded:**
- Admin user (admin@soacframe.com / Admin123!)
- Test analyst (analyst@soacframe.com / Analyst123!)
- Sample security alerts
- Sample incidents
- Report templates
- Security playbooks

---

## ⚙️ Configuration

### AWS S3 Setup (Free Tier Available)

1. **Create AWS Account**
   - Go to https://aws.amazon.com
   - Sign up for free tier

2. **Create S3 Bucket**
   ```bash
   # Using AWS CLI
   aws s3 mb s3://your-bucket-name --region us-east-1
   ```

3. **Create IAM User**
   - Go to IAM Console
   - Create new user with programmatic access
   - Attach `AmazonS3FullAccess` policy
   - Save access keys

4. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/YOUR-USER"
         },
         "Action": "s3:*",
         "Resource": [
           "arn:aws:s3:::your-bucket-name",
           "arn:aws:s3:::your-bucket-name/*"
         ]
       }
     ]
   }
   ```

### Abacus AI Setup

1. **Get API Key**
   - Visit https://abacus.ai
   - Sign up for account
   - Navigate to API Keys
   - Generate new key

2. **Add to Environment**
   ```env
   ABACUSAI_API_KEY="your-api-key-here"
   ```

---

## 🚀 First Run

### Start Development Server

```bash
# Start the server
yarn dev

# Server will start on http://localhost:3000
```

### Access the Application

1. **Open Browser**
   - Navigate to http://localhost:3000

2. **Login**
   - Email: admin@soacframe.com
   - Password: Admin123!

3. **Explore Features**
   - Security Dashboard: /admin/security-dashboard
   - AI Hub: /admin/ai-hub
   - Alerts: /admin/alerts
   - Incidents: /admin/incidents
   - Devices: /admin/devices
   - Reports: /admin/reports

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL if not running
sudo service postgresql start

# Verify connection
psql -U soacuser -d soacframe -h localhost
```

#### 2. Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
yarn dev -p 3001
```

#### 3. Prisma Client Generation Failed

**Error:** `Prisma Client could not be generated`

**Solution:**
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate client
yarn prisma generate

# Push schema again
yarn prisma db push
```

#### 4. AWS S3 Access Denied

**Error:** `Access Denied when uploading to S3`

**Solution:**
- Verify AWS credentials in .env
- Check IAM user permissions
- Verify bucket policy
- Check bucket region matches AWS_REGION

#### 5. Missing Environment Variables

**Error:** `Missing required environment variable`

**Solution:**
```bash
# Copy example file again
cp .env.example .env

# Fill in all required variables
# Generate NEXTAUTH_SECRET:
openssl rand -base64 32
```

### Performance Issues

**Slow Initial Load:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
yarn build

# Restart dev server
yarn dev
```

**High Memory Usage:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Then start server
yarn dev
```

### Getting Help

- **GitHub Issues**: https://github.com/ge0mant1s/soacframe-community/issues
- **Discussions**: https://github.com/ge0mant1s/soacframe-community/discussions
- **Email**: community@soacframe.io

---

## 🎉 Success!

Your SOaC Framework Community Edition is now installed and running!

### Next Steps:

1. **Customize Settings** - Configure integrations
2. **Add Users** - Invite team members
3. **Connect Data Sources** - Integrate security tools
4. **Create Playbooks** - Automate incident response
5. **Generate Reports** - Track security metrics

### Useful Commands:

```bash
# Development
yarn dev            # Start dev server
yarn build          # Build for production
yarn start          # Start production server

# Database
yarn prisma studio  # Open Prisma Studio
yarn prisma generate # Regenerate Prisma Client
yarn prisma db push # Push schema changes

# Maintenance
yarn lint           # Run ESLint
yarn format         # Format code with Prettier
```

---

**Questions?** Check our [documentation](./docs) or [open an issue](https://github.com/ge0mant1s/soacframe-community/issues)!
