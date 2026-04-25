# SchemaSync

<p align="center">
  <img src="https://img.shields.io/badge/OpenAPI-3.0-FF6B6B?style=for-the-badge&logo=swagger&logoColor=white" alt="OpenAPI 3.0">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.5">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

> 🔄 **OpenAPI Schema Generator** — Automatically generate OpenAPI/Swagger specifications from Python code. Keep your API documentation in sync with your implementation via CI/CD.

## About

**SchemaSync** analyzes Python source code to automatically generate comprehensive OpenAPI 3.0 specifications. It parses function signatures, type hints, and docstrings to create accurate, specification-compliant API documentation.

### Who It's For

- **Backend Developers** — Generate API docs without writing OpenAPI by hand
- **API Teams** — Ensure specs stay in sync with implementation
- **DevOps Engineers** — Automate spec generation in CI/CD pipelines
- **Technical Writers** — Start with machine-generated specs and refine

## ✨ Features

### 🔍 Code Analysis
- **Type Hints Extraction** — Full support for Python type annotations
- **Docstring Parsing** — Google, Sphinx, and NumPy docstring formats
- **Decorator Recognition** — Understands FastAPI, Flask, and custom decorators
- **Default Values** — Preserves parameter defaults in schema

### 📤 Output Formats
- **JSON** — Standard JSON OpenAPI 3.0 output
- **YAML** — Human-readable YAML format
- **Swagger UI** — Interactive documentation in browser
- **ReDoc** — Alternative documentation viewer

### 🔗 Framework Support
| Framework | Support Level |
|-----------|--------------|
| **FastAPI** | ✅ First-class (direct import from decorators) |
| **Flask** | ✅ Full support via route analysis |
| **Express/Fastify** | ✅ TypeScript route handlers |
| **Spring Boot** | ✅ Java annotation parsing |
| **.NET** | ✅ C# controller analysis |
| **Generic Python** | ✅ Function signature analysis |

### ⚡ Automation Features
- **Watch Mode** — Auto-regenerate on file changes
- **Diff Generation** — Show what changed between versions
- **Breaking Change Detection** — Alert on incompatible changes
- **CI/CD Integration** — Fail builds on breaking changes
- **Webhook Notifications** — Alert external services on changes

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          SchemaSync                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                         CLI Layer                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │   │
│  │  │ generate │  │  watch   │  │ validate │  │   serve     │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Parser Layer                               │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │   │
│  │  │  Python    │  │ Docstring  │  │  Type      │             │   │
│  │  │  AST/Regex │  │  Parser    │  │  Analyzer  │             │   │
│  │  └────────────┘  └────────────┘  └────────────┘             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Schema Generator                            │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │  OpenAPI 3.0 Spec Builder                            │    │   │
│  │  │  • paths: /users, /posts, etc.                        │    │   │
│  │  │  • components: schemas, parameters, responses        │    │   │
│  │  │  • security: OAuth2, API keys, JWT                    │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Output Layer                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐   │   │
│  │  │   JSON   │  │   YAML   │  │ Swagger  │  │   Diff      │   │   │
│  │  │          │  │          │  │    UI    │  │  Report     │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Installation

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm or yarn
- Python 3.9+ (for Python source analysis)

### Standard Installation

```bash
# Clone the repository
git clone https://github.com/moggan1337/SchemaSync.git
cd SchemaSync

# Install globally via npm
npm install -g .

# Or install locally
npm install

# Verify installation
schemasync --version
```

### Using npx (No Install)

```bash
npx schemasync generate --input ./src/routes --output ./api.yaml
```

## 🚀 Quick Start

### 1. Generate OpenAPI Schema

```bash
# Basic generation
schemasync generate --input ./src/app.py --output ./api.yaml

# Specify format
schemasync generate --input ./app.py --output ./api.json --format json

# Recursive directory scan
schemasync generate --input ./src --output ./api.yaml --recursive
```

### 2. View Generated Schema

```bash
# Start documentation server
schemasync serve ./api.yaml

# Open http://localhost:8080
```

### 3. Validate Schema

```bash
# Validate against OpenAPI spec
schemasync validate --spec ./api.yaml

# Check for breaking changes
schemasync diff --old ./old-api.yaml --new ./new-api.yaml
```

### 4. Watch Mode

```bash
# Auto-regenerate on changes
schemasync watch --input ./src --output ./api.yaml
```

## 📚 CLI Reference

```bash
# Generate OpenAPI schema
schemasync generate [options]
  --input, -i          Input file or directory (required)
  --output, -o          Output file path (required)
  --format, -f          Output format: json|yaml (default: yaml)
  --recursive           Scan directories recursively
  --base-url            Base URL for API (default: /)
  --title               API title (default: Generated API)
  --version             API version (default: 1.0.0)
  --include             Patterns to include (default: *.py)
  --exclude             Patterns to exclude

# Watch for changes
schemasync watch [options]
  --input, -i           Input file or directory
  --output, -o          Output file path
  --debounce            Debounce delay in ms (default: 500)

# Validate schema
schemasync validate [options]
  --spec, -s            Path to OpenAPI spec

# Diff two schemas
schemasync diff [options]
  --old                 Previous schema version
  --new                 New schema version
  --output              Diff output file

# Serve documentation
schemasync serve [options]
  --spec, -s            Path to OpenAPI spec
  --port, -p            Port (default: 8080)
  --host                Host (default: localhost)

# Initialize project
schemasync init [options]
  --output, -o          Output path (default: schemasync.config.js)
```

## 📝 Input Code Example

### FastAPI Application

```python
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None

class CreateUserRequest(BaseModel):
    name: str
    email: str
    age: Optional[int] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

@app.post("/users", response_model=User, status_code=201)
async def create_user(request: CreateUserRequest):
    """
    Create a new user in the system.
    
    Args:
        request: User creation request body
    
    Returns:
        Created user object
    
    Raises:
        HTTPException: 400 if email already exists
        HTTPException: 500 if internal error occurs
    """
    # Implementation...
    return User(id=1, **request.model_dump())

@app.get("/users", response_model=List[User])
async def list_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(10, ge=1, le=100, description="Max users to return"),
    search: Optional[str] = Query(None, description="Search by name")
):
    """
    List all users with pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        search: Optional name search filter
    
    Returns:
        List of user objects
    """
    return []
```

### Generated OpenAPI Output

```yaml
openapi: 3.0.0
info:
  title: Generated API
  version: 1.0.0
paths:
  /users:
    post:
      summary: Create a new user
      operationId: create_user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: Created user object
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Email already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
    get:
      summary: List all users
      operationId: list_users
      parameters:
        - name: skip
          in: query
          schema:
            type: integer
            default: 0
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of user objects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
        age:
          type: integer
    CreateUserRequest:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
        email:
          type: string
        age:
          type: integer
    ErrorResponse:
      type: object
      properties:
        error:
          type: string
        detail:
          type: string
```

## 📂 Project Structure

```
SchemaSync/
├── src/
│   ├── cli.ts              # CLI command handlers
│   ├── generator.ts        # Schema generation logic
│   ├── parsers/
│   │   ├── python.ts       # Python code parser
│   │   ├── docstring.ts    # Docstring parser
│   │   └── types.ts        # Type analysis
│   ├── generators/
│   │   ├── openapi.ts      # OpenAPI spec builder
│   │   └── typescript.ts   # TypeScript types (future)
│   └── utils/
│       ├── file.ts         # File operations
│       └── validate.ts      # Schema validation
├── tests/
│   ├── generator.test.ts
│   └── parser.test.ts
├── examples/
│   ├── python/
│   │   └── fastapi_app.py
│   └── typescript/
│       └── express routes.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### `schemasync.config.js`

```javascript
module.exports = {
  // Input settings
  input: {
    path: './src',
    recursive: true,
    include: ['*.py', '*.ts'],
    exclude: ['test_*.py', '*_test.py', 'node_modules/**']
  },
  
  // Output settings
  output: {
    format: 'yaml',
    path: './api/openapi.yaml'
  },
  
  // API metadata
  api: {
    title: 'My API',
    version: '1.0.0',
    description: 'Auto-generated API documentation',
    baseUrl: '/api/v1'
  },
  
  // Framework detection
  framework: {
    type: 'auto', // auto, fastapi, flask, express
    detectDecorators: true
  },
  
  // Validation
  validation: {
    failOnBreaking: true,
    checkSchema: true
  },
  
  // Watch mode
  watch: {
    debounce: 500,
    ignored: ['**/node_modules/**', '**/*.test.*']
  }
}
```

## 🔗 CI/CD Integration

### GitHub Actions

```yaml
name: Schema Sync
on: [push, pull_request]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install SchemaSync
        run: npm install -g schemasync
        
      - name: Generate Schema
        run: schemasync generate -i ./src -o ./api.yaml
        
      - name: Validate Schema
        run: schemasync validate -s ./api.yaml
        
      - name: Check for Breaking Changes
        run: schemasync diff --old ${{ github.event.before }} --new ./api.yaml
```

### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: schemasync
        name: Generate OpenAPI Schema
        entry: schemasync generate -i ./src -o ./api.yaml
        language: system
        pass_filenames: false
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Setup

```bash
git clone https://github.com/moggan1337/SchemaSync.git
cd SchemaSync
npm install
npm run build
npm test
```

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for developers who value API documentation
</p>
