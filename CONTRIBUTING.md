
# Contributing to SOaC Framework Community Edition

Thank you for your interest in contributing to the SOaC Framework! 🎉

We welcome contributions from the security community and appreciate your help in making this project better.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Community Guidelines](#community-guidelines)

---

## 📜 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@soacframe.io.

---

## 🚀 How to Contribute

### Reporting Bugs

Found a bug? Help us fix it!

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, versions)
   - Screenshots if applicable

### Suggesting Features

Have an idea? We'd love to hear it!

1. **Check GitHub Discussions** for similar suggestions
2. **Open a discussion** in the "Ideas" category
3. Explain:
   - The problem you're trying to solve
   - Your proposed solution
   - Why it benefits the community
   - Any alternatives you've considered

### Improving Documentation

Documentation improvements are always welcome!

- Fix typos or clarify confusing sections
- Add examples or tutorials
- Translate documentation
- Update outdated information

---

## 💻 Development Setup

### Prerequisites

- Node.js 18+
- Yarn package manager
- PostgreSQL 14+
- Git
- AWS S3 account (free tier)

### Setup Steps

1. **Fork the repository**
```bash
# Click the "Fork" button on GitHub
```

2. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/soacframe-community.git
cd soacframe-community
```

3. **Add upstream remote**
```bash
git remote add upstream https://github.com/ge0mant1s/soacframe-community.git
```

4. **Install dependencies**
```bash
yarn install
```

5. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your local credentials
```

6. **Setup database**
```bash
yarn prisma generate
yarn prisma db push
yarn prisma db seed
```

7. **Start development server**
```bash
yarn dev
```

8. **Access the application**
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- Login: admin@soacframe.com / Admin123!

---

## 📝 Coding Standards

### General Principles

- **Write clean, readable code**
- **Follow existing patterns** in the codebase
- **Comment complex logic**
- **Keep functions small and focused**
- **Use meaningful variable names**

### TypeScript

```typescript
// ✅ Good
interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

// ❌ Bad
interface Alert {
  a: string;
  b: string;
  c: string;
  d: any;
}
```

### React Components

```typescript
// ✅ Good - Functional components with TypeScript
interface Props {
  alertId: string;
  onDismiss: () => void;
}

export function AlertCard({ alertId, onDismiss }: Props) {
  // Component logic
}

// ❌ Bad - No types, unclear props
export function AlertCard({ id, onClick }) {
  // Component logic
}
```

### File Organization

```
app/
├── admin/              # Admin pages
├── api/                # API routes
├── (auth)/             # Auth pages
components/
├── ui/                 # Reusable UI components
├── sections/           # Page sections
lib/
├── db.ts               # Database utilities
├── auth.ts             # Auth config
```

### Naming Conventions

- **Components**: PascalCase (`AlertCard.tsx`)
- **Files**: kebab-case (`alert-card.tsx`)
- **Variables**: camelCase (`alertCount`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ALERTS`)
- **Types/Interfaces**: PascalCase (`SecurityAlert`)

### Code Style

- Use **Prettier** for formatting
- Use **ESLint** for linting
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multi-line

```bash
# Format code
yarn prettier --write .

# Lint code
yarn lint

# Fix lint issues
yarn lint --fix
```

---

## 📤 Submitting Changes

### Creating a Pull Request

1. **Create a feature branch**
```bash
git checkout -b feature/my-awesome-feature
```

2. **Make your changes**
```bash
# Write code
# Add tests
# Update documentation
```

3. **Commit your changes**
```bash
git add .
git commit -m "feat: add awesome feature

- Implemented X
- Fixed Y
- Updated Z"
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

4. **Push to your fork**
```bash
git push origin feature/my-awesome-feature
```

5. **Open a Pull Request**
- Go to GitHub
- Click "New Pull Request"
- Fill in the PR template
- Link related issues

### PR Checklist

Before submitting, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is up-to-date with main
- [ ] No merge conflicts
- [ ] PR description explains changes
- [ ] Related issues are linked

### Code Review Process

1. **Automated checks** run (tests, linting)
2. **Maintainers review** your code
3. **Address feedback** if requested
4. **Approval** from maintainers
5. **Merge** into main branch

---

## 🤝 Community Guidelines

### Be Respectful

- Be kind and welcoming
- Respect different viewpoints
- Accept constructive criticism
- Focus on what's best for the community

### Be Helpful

- Help others learn
- Share your knowledge
- Answer questions
- Review pull requests

### Be Patient

- Remember maintainers are volunteers
- Complex changes take time to review
- Not all suggestions will be accepted
- Provide context for your decisions

### Quality Over Quantity

- One well-tested feature > many incomplete features
- Clear documentation > clever code
- Working solution > perfect solution

---

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security@soacframe.io
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. Wait for acknowledgment before disclosure

We take security seriously and will respond promptly.

---

## 📜 License

By contributing, you agree to license your contributions under the same license as the project (MIT with IP Protection).

---

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## 📞 Questions?

- **General Questions**: GitHub Discussions
- **Bug Reports**: GitHub Issues
- **Security**: security@soacframe.io
- **Other**: community@soacframe.io

---

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

Happy coding! 🚀

---

**Maintainers**: @ge0mant1s  
**Last Updated**: November 2025
