
# 🛡️ SOaC Framework - Community Edition

<div align="center">

![SOaC Framework](https://img.shields.io/badge/SOaC-Community-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-3.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**Open-Source Security Operations Center Platform**

Transform your security operations with AI-powered automation, real-time threat intelligence, and comprehensive incident management.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 What is SOaC Framework?

SOaC (Security Operations as Code) Community Edition is a free, open-source security operations platform that provides:

- **🤖 AI-Powered Security** - 10 AI queries per day for rule generation, policy analysis, and compliance checking
- **🔍 Real-Time Monitoring** - Track alerts, incidents, and device health (up to 50 devices)
- **📊 Security Dashboard** - Visualize security metrics with interactive charts
- **🚨 Alert & Incident Management** - Full incident response workflow
- **📈 Basic Reporting** - Generate security reports in CSV/JSON format
- **👥 Team Collaboration** - Support for up to 5 users

Perfect for individuals, students, researchers, and small security teams!

---

## ✨ Features

### 🤖 AI Intelligence Hub (Limited)
- **Rule Generator**: Convert natural language to detection rules (10 queries/day)
- **Policy Analyzer**: Upload and analyze security policies
- **Compliance Checker**: Validate against SOC2, ISO 27001, NIST, PCI-DSS
- **Threat Intelligence**: Analyze threat descriptions with MITRE mapping
- **Security Advisor**: 24/7 AI assistant for security questions

### 🛡️ Security Operations
- **Security Dashboard**: Real-time command center with key metrics
- **Alert Management**: Track and investigate security alerts
- **Incident Management**: Full lifecycle incident tracking
- **Device Monitoring**: Monitor up to 50 endpoints
- **Audit Logging**: Activity tracking and compliance trails

### 📊 Reporting (Basic)
- **Security Reports**: Generate basic security reports
- **Export Formats**: CSV and JSON
- **Scheduled Reports**: Automate report generation (up to 2)

### 👥 User Management
- **Multi-User Support**: Up to 5 users
- **Role-Based Access**: Admin, Analyst, Viewer roles
- **Activity Tracking**: Monitor user actions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- PostgreSQL 14+
- AWS S3 account (for file storage - free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ge0mant1s/soacframe-community.git
cd soacframe-community
```

2. **Install dependencies**
```bash
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/soacframe"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# AWS S3 (Free tier available)
AWS_BUCKET_NAME="your-bucket-name"
AWS_FOLDER_PREFIX="soacframe/"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"

# Abacus AI (For AI features)
ABACUSAI_API_KEY="your-api-key"
```

4. **Set up the database**
```bash
yarn prisma generate
yarn prisma db push
yarn prisma db seed
```

5. **Start the development server**
```bash
yarn dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- **Default Admin**: admin@soacframe.com / Admin123!
- **Test User**: analyst@soacframe.com / Analyst123!

---

## 📚 Documentation

For detailed documentation, visit the [docs folder](./docs) or check out:

- **[Installation Guide](./docs/INSTALLATION.md)** - Detailed setup instructions
- **[Configuration Guide](./docs/CONFIGURATION.md)** - Environment variables
- **[Features Documentation](./docs/FEATURES.md)** - Complete feature walkthrough
- **[Community Setup](./docs/COMMUNITY_SETUP.md)** - Community-specific information

---

## 🆚 Community vs Premium

| Feature | Community (Free) | Premium (Paid) |
|---------|------------------|----------------|
| **AI Queries** | 10/day | Unlimited |
| **Devices** | 50 max | Unlimited |
| **Users** | 5 max | Unlimited |
| **Workflows** | 3 max | Unlimited |
| **Playbooks** | 5 max | Unlimited |
| **Reports** | Security only | All 7 types |
| **Export Formats** | CSV, JSON | CSV, JSON, PDF, HTML |
| **Data Retention** | 30 days | Unlimited |
| **Advanced Analytics** | ❌ | ✅ |
| **Custom Dashboards** | ❌ | ✅ |
| **Workflow Automation** | ❌ | ✅ |
| **Threat Intel Feeds** | ❌ | ✅ |
| **API Access** | ❌ | ✅ |
| **Google SSO** | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ |
| **Price** | Free | From $199/month |

### ⬆️ Upgrade Options

Need more features?
- **Premium SaaS**: https://soacframe.io (Starting at $199/month)
- **Enterprise**: Contact enterprise@soacframe.io for custom deployments

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL + Prisma ORM
- **File Storage**: AWS S3
- **AI/ML**: Abacus.AI APIs

---

## 🤝 Contributing

We welcome contributions from the security community! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions
- 🎨 UI/UX enhancements

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a pull request.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with tests
4. Commit: `git commit -m 'Add my feature'`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License with IP Protection** - see the [LICENSE](./LICENSE) file for details.

### Key License Terms:
- ✅ Free for personal and internal business use
- ✅ Modify and adapt for your needs
- ❌ Cannot create competing SaaS product
- ❌ Cannot rebrand and distribute commercially
- ✅ Must include attribution
- ⚠️ Commercial use at scale (>100 users) requires license

---

## 🙏 Acknowledgments

- **MITRE ATT&CK Framework** - Threat taxonomy
- **OWASP** - Security best practices
- **Abacus.AI** - AI capabilities
- **Security Community** - Continuous feedback

---

## 📞 Support

### Community Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/ge0mant1s/soacframe-community/issues)
- **Discussions**: [Join community discussions](https://github.com/ge0mant1s/soacframe-community/discussions)

### Enterprise Support
- **Email**: enterprise@soacframe.io
- **Premium Support**: Available with paid tiers

---

## 🌟 Star Us!

If you find this project useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=ge0mant1s/soacframe-community&type=Date)](https://star-history.com/#ge0mant1s/soacframe-community&Date)

---

<div align="center">

**Built with ❤️ by the Security Community**

[Website](https://soacframe.io) • [GitHub](https://github.com/ge0mant1s/soacframe-community) • [Documentation](./docs)

</div>
