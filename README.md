# SchemaSync

<p align="center">
  <img src="https://img.shields.io/badge/OpenAPI-Sync-FF6B6B?style=for-the-badge&logo=swagger&logoColor=white" alt="OpenAPI">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

> 🔄 **OpenAPI/Swagger Generator** - Auto-generates API specs from code implementation. Keeps docs in sync via CI/CD.

## ✨ Features

### Code to Spec
- 🦅 **Express/Fastify** - Auto-generate from route handlers
- 🐍 **FastAPI** - Import directly from decorators
- ☕ **Spring Boot** - Parse annotations
- 🔷 **.NET** - Analyze C# controllers

### Sync Features
- 🔔 **Webhooks** - Notify on changes
- 📊 **Diff** - Show what changed
- 🚫 **Breaking Change** - Detect breaking changes
- ✅ **CI/CD** - Auto-verify in pipelines

## 📦 Installation

```bash
npm install -g schemasync
schemasync init
```

## 🚀 Usage

```bash
# Generate OpenAPI from Express app
schemasync generate --input ./src/routes --output ./api.yaml

# Watch mode
schemasync watch --input ./src --output ./docs/api.yaml

# Validate in CI
schemasync validate --spec ./api.yaml
```

## 📄 License

MIT License
