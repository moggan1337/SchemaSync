# SchemaSync

OpenAPI/Swagger generator from code. SchemaSync analyzes your source code and automatically generates OpenAPI 3.0 specifications.

## Features

- **Multi-language support**: TypeScript, Go, Python
- **Framework detection**: Express, Gin, Echo (Go), Flask, FastAPI
- **Schema extraction**: TypeScript interfaces, Go structs, Pydantic models
- **YAML & JSON output**: Flexible output formats
- **CLI interface**: Simple command-line usage

## Installation

```bash
npm install -g schemasync
```

Or install locally:

```bash
npm install
npm run build
```

## Usage

### CLI

```bash
schemasync generate --input ./src --output ./openapi.json --title "My API" --version "1.0.0"
```

Options:
- `-i, --input <path>` - Input source directory or file (required)
- `-o, --output <path>` - Output OpenAPI specification file (required)
- `-t, --title <title>` - API title (default: "My API")
- `-v, --version <version>` - API version (default: "1.0.0")
- `-d, --description <description>` - API description
- `-f, --format <format>` - Output format: json or yaml (default: json)

### Programmatic

```typescript
import { Generator } from 'schemasync';

const generator = new Generator({
  title: 'My API',
  version: '1.0.0',
  description: 'API description',
});

const spec = await generator.generate('./src');

// Output as JSON
import * as fs from 'fs-extra';
await fs.writeJson('openapi.json', spec, { spaces: 2 });

// Output as YAML
import * as yaml from 'yaml';
const yamlOutput = generator.toYaml(spec);
```

## Supported Patterns

### TypeScript/Express

```typescript
@Get('/users')
getUsers() {}

interface User {
  id: number;
  name: string;
}
```

### Go/Gin

```go
func main() {
    r := gin.Default()
    r.GET("/hello", helloHandler)
}

type User struct {
    ID   int
    Name string
}
```

### Python/Flask/FastAPI

```python
@app.route('/items', methods=['GET'])
def get_items():
    pass

class User(BaseModel):
    id: int
    name: str
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

## License

MIT
