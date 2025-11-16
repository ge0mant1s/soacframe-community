
#!/bin/bash

# SOaC Framework Community Edition - GitHub Push Script
# This script automates pushing the community edition to GitHub

set -e  # Exit on error

echo "=================================================="
echo "SOaC Framework Community Edition - GitHub Push"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/ge0mant1s/soacframe-community.git"
BRANCH="main"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found${NC}"
    echo "Please run this script from the soacframe-community-prep directory"
    exit 1
fi

echo -e "${GREEN}✓${NC} In correct directory"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    echo "Please install git first"
    exit 1
fi

echo -e "${GREEN}✓${NC} Git is installed"
echo ""

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
    echo -e "${GREEN}✓${NC} Git repository initialized"
else
    echo -e "${GREEN}✓${NC} Git repository already initialized"
fi
echo ""

# Configure git user (prompt for input)
echo "Git Configuration:"
read -p "Enter your GitHub username [ge0mant1s]: " git_username
git_username=${git_username:-ge0mant1s}

read -p "Enter your GitHub email: " git_email

if [ -z "$git_email" ]; then
    echo -e "${RED}Error: Email is required${NC}"
    exit 1
fi

git config user.name "$git_username"
git config user.email "$git_email"
echo -e "${GREEN}✓${NC} Git configured"
echo ""

# Add or update remote
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}Updating existing remote...${NC}"
    git remote set-url origin "$REPO_URL"
else
    echo -e "${YELLOW}Adding remote repository...${NC}"
    git remote add origin "$REPO_URL"
fi
echo -e "${GREEN}✓${NC} Remote repository configured"
echo ""

# Show what will be committed
echo -e "${YELLOW}Files to be committed:${NC}"
echo ""

# Stage all files
git add .

# Show status
git status --short

echo ""
read -p "Continue with commit? (y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Aborted by user"
    exit 0
fi

# Create commit
echo ""
echo -e "${YELLOW}Creating commit...${NC}"
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

For enterprise features, visit: https://soacframe.io"

echo -e "${GREEN}✓${NC} Commit created"
echo ""

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
echo ""
echo "Repository: $REPO_URL"
echo "Branch: $BRANCH"
echo ""
echo -e "${RED}WARNING: This will force push and overwrite the remote repository!${NC}"
read -p "Are you sure you want to continue? (yes/no): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    echo "Push cancelled"
    exit 0
fi

echo ""
echo "Pushing..."
git branch -M "$BRANCH"

# Try to push with credentials prompt
if git push -u origin "$BRANCH" --force; then
    echo ""
    echo -e "${GREEN}=================================================="
    echo "✓ Successfully pushed to GitHub!"
    echo "==================================================${NC}"
    echo ""
    echo "Your repository is now live at:"
    echo "https://github.com/ge0mant1s/soacframe-community"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository and verify all files are present"
    echo "2. Configure repository settings (description, topics, etc.)"
    echo "3. Enable GitHub Discussions"
    echo "4. Create an announcement post"
    echo "5. Share with the community!"
    echo ""
    echo "For detailed post-push steps, see: PUSH_TO_GITHUB.md"
else
    echo ""
    echo -e "${RED}=================================================="
    echo "✗ Push failed!"
    echo "==================================================${NC}"
    echo ""
    echo "Common issues:"
    echo "1. Authentication failed - Use Personal Access Token instead of password"
    echo "2. Permission denied - Ensure you have write access to the repository"
    echo "3. Network issues - Check your internet connection"
    echo ""
    echo "For detailed troubleshooting, see: PUSH_TO_GITHUB.md"
    exit 1
fi
