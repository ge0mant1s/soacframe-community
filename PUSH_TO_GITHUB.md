
# How to Update Your GitHub Repository

This guide will help you push the SOaC Framework Community Edition to your GitHub repository at https://github.com/ge0mant1s/soacframe-community

---

## 🚀 Quick Start (Automated)

```bash
# Run the automated push script
./push-to-github.sh
```

---

## 📋 Manual Steps

If you prefer to push manually or the script doesn't work, follow these steps:

### Step 1: Navigate to Community Package

```bash
cd /home/ubuntu/soacframe-community-prep
```

### Step 2: Initialize Git (if not already initialized)

```bash
# Check if git is initialized
if [ ! -d ".git" ]; then
  git init
fi
```

### Step 3: Configure Git

```bash
# Set your Git username and email
git config user.name "ge0mant1s"
git config user.email "your-email@example.com"
```

### Step 4: Add Remote Repository

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/ge0mant1s/soacframe-community.git

# Or if already exists, update it
git remote set-url origin https://github.com/ge0mant1s/soacframe-community.git
```

### Step 5: Stage All Files

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

### Step 6: Create Commit

```bash
git commit -m "Release: SOaC Framework Community Edition v3.0

Features:
- Core security operations platform
- AI Hub with daily limits (10 queries/day)
- Security dashboard and real-time monitoring
- Alert and incident management (full lifecycle)
- Device tracking (up to 50 devices)
- Basic reporting capabilities (CSV/JSON export)
- 5 security playbooks included
- Multi-user support (up to 5 users)
- Role-based access control (Admin/Analyst/Viewer)
- Audit logging and activity tracking
- Integration framework (up to 5 integrations)
- AWS S3 file storage support
- Complete documentation

Limitations (Community Edition):
- No subscription system
- Limited AI queries (10/day)
- No advanced analytics
- No custom dashboards
- No workflow automation
- No threat intelligence feeds
- No Google SSO
- Community support only

Tech Stack:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS + shadcn/ui
- NextAuth.js
- AWS S3

License: MIT with IP Protection
Documentation: Complete setup and usage guides included
Support: GitHub Issues and Discussions

For enterprise features, visit: https://soacframe.io
"
```

### Step 7: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main --force
```

**Note**: The `--force` flag is used because we're replacing the existing repository content. Use with caution!

---

## 🔑 Authentication Methods

### Method 1: HTTPS with Personal Access Token (Recommended)

1. **Generate a Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token"
   - Give it a name (e.g., "SOaC Community Push")
   - Select scopes: `repo` (Full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Use Token for Authentication**:
```bash
# When prompted for password, use your token instead
git push -u origin main

# Or set up credential helper to store it
git config --global credential.helper store
```

### Method 2: SSH (Alternative)

1. **Generate SSH Key** (if you don't have one):
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

2. **Add SSH Key to GitHub**:
```bash
# Copy your public key
cat ~/.ssh/id_ed25519.pub

# Go to GitHub Settings → SSH and GPG keys → New SSH key
# Paste the key and save
```

3. **Use SSH URL**:
```bash
git remote set-url origin git@github.com:ge0mant1s/soacframe-community.git
git push -u origin main
```

---

## ✅ Verification Checklist

After pushing, verify on GitHub:

- [ ] All files are present in the repository
- [ ] README.md displays correctly on the homepage
- [ ] LICENSE file is visible
- [ ] No .env files or secrets are committed
- [ ] No node_modules or build files are committed
- [ ] .gitignore is working correctly

---

## 🎯 Post-Push Steps

### 1. Configure Repository Settings

Visit: https://github.com/ge0mant1s/soacframe-community/settings

**General Settings**:
- [ ] Add repository description: "Open-source Security Operations Center platform with AI-powered automation"
- [ ] Add website URL: https://soacframe.io
- [ ] Add topics: `security`, `soc`, `security-operations`, `incident-response`, `threat-intelligence`, `open-source`, `nextjs`, `react`, `typescript`

**Features**:
- [x] Issues (Enable)
- [x] Discussions (Enable) 
- [ ] Wikis (Optional)
- [ ] Projects (Optional)
- [ ] Preserve this repository (Optional)

### 2. Enable GitHub Discussions

Go to: https://github.com/ge0mant1s/soacframe-community/discussions

Create categories:
- **General** - General discussions
- **Q&A** - Questions and answers
- **Ideas** - Feature requests and ideas
- **Show and Tell** - Share your projects

### 3. Create Initial Discussion/Announcement

Post an announcement:
```markdown
# 🎉 Welcome to SOaC Framework Community Edition!

We're excited to announce the release of SOaC Framework Community Edition v3.0!

## 🚀 What's New

- Complete open-source security operations platform
- AI-powered security automation (10 queries/day)
- Real-time monitoring and alerting
- Incident management workflows
- Device tracking (up to 50 devices)
- Basic reporting capabilities
- Multi-user collaboration (up to 5 users)

## 📚 Getting Started

Check out our [Installation Guide](./INSTALLATION.md) to get started in minutes!

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 💬 Join the Discussion

Have questions? Ideas? Share them here!

## 🌟 Star Us

If you find this project useful, please give us a star ⭐
```

### 4. Add Repository Badges to README

Update README.md with dynamic badges (already included):
- License badge
- Version badge
- Stars/forks/watchers
- Build status (when CI/CD is set up)

### 5. Create Issues Templates

Create `.github/ISSUE_TEMPLATE/` folder with templates for:
- Bug reports
- Feature requests
- Documentation improvements

### 6. Set Up GitHub Actions (Optional)

Create `.github/workflows/` for:
- Automated testing
- Lint checks
- Build verification
- Dependency updates (Dependabot)

---

## 🐛 Troubleshooting

### Error: "fatal: remote origin already exists"

```bash
# Remove existing remote
git remote remove origin

# Add it again
git remote add origin https://github.com/ge0mant1s/soacframe-community.git
```

### Error: "Authentication failed"

- **For HTTPS**: Use Personal Access Token instead of password
- **For SSH**: Ensure SSH key is added to GitHub

### Error: "Updates were rejected"

```bash
# Force push (CAUTION: This will overwrite remote)
git push -u origin main --force
```

### Error: "Large files detected"

```bash
# Check for large files
find . -type f -size +50M

# Remove them from git history if needed
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch PATH-TO-LARGE-FILE" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 📞 Need Help?

- **GitHub Issues**: https://github.com/ge0mant1s/soacframe-community/issues
- **Discussions**: https://github.com/ge0mant1s/soacframe-community/discussions
- **Email**: community@soacframe.io

---

## 🎉 Success!

Once pushed, your repository is live at:
**https://github.com/ge0mant1s/soacframe-community**

Share it with the security community! 🚀

---

**Last Updated**: November 2025
