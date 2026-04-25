import * as fs from 'fs-extra';
import * as path from 'path';
import { glob as globSync } from 'glob';
import * as yaml from 'yaml';

export interface GeneratorOptions {
  title?: string;
  version?: string;
  description?: string;
  baseUrl?: string;
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  parameters?: Parameter[];
}

export interface Operation {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: Record<string, Response>;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required?: boolean;
  schema?: SchemaObject;
  description?: string;
}

export interface RequestBody {
  required?: boolean;
  content?: Record<string, MediaType>;
}

export interface MediaType {
  schema?: SchemaObject;
}

export interface Response {
  description?: string;
  content?: Record<string, MediaType>;
}

export interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  enum?: unknown[];
  description?: string;
  format?: string;
  $ref?: string;
}

export class Generator {
  private options: Required<GeneratorOptions>;

  constructor(options: GeneratorOptions = {}) {
    this.options = {
      title: options.title ?? 'My API',
      version: options.version ?? '1.0.0',
      description: options.description ?? '',
      baseUrl: options.baseUrl ?? 'http://localhost:3000',
    };
  }

  async generate(inputPath: string): Promise<OpenAPISpec> {
    const files = await this.findSourceFiles(inputPath);
    const paths: Record<string, PathItem> = {};
    const schemas: Record<string, SchemaObject> = {};

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const parsed = this.parseSourceFile(content, file);
      
      Object.assign(paths, parsed.paths);
      Object.assign(schemas, parsed.schemas);
    }

    return {
      openapi: '3.0.3',
      info: {
        title: this.options.title,
        version: this.options.version,
        description: this.options.description || undefined,
      },
      paths,
      components: {
        schemas: Object.keys(schemas).length > 0 ? schemas : undefined,
      },
    };
  }

  private async findSourceFiles(inputPath: string): Promise<string[]> {
    const stats = await fs.stat(inputPath);
    
    if (stats.isFile()) {
      return [inputPath];
    }
    
    if (stats.isDirectory()) {
      const patterns = [
        '**/*.ts',
        '**/*.js',
        '**/*.go',
        '**/*.py',
        '**/*.java',
        '**/*.cs',
      ];
      
      const files: string[] = [];
      for (const pattern of patterns) {
        const matches = await globSync(pattern, { cwd: inputPath, absolute: true });
        files.push(...matches);
      }
      return files;
    }
    
    return [];
  }

  private parseSourceFile(
    content: string,
    filePath: string
  ): { paths: Record<string, PathItem>; schemas: Record<string, SchemaObject> } {
    const ext = path.extname(filePath).toLowerCase();
    const paths: Record<string, PathItem> = {};
    const schemas: Record<string, SchemaObject> = {};

    switch (ext) {
      case '.ts':
      case '.js':
        this.parseTypeScript(content, paths, schemas);
        break;
      case '.go':
        this.parseGo(content, paths, schemas);
        break;
      case '.py':
        this.parsePython(content, paths, schemas);
        break;
      default:
        break;
    }

    return { paths, schemas };
  }

  private parseTypeScript(
    content: string,
    paths: Record<string, PathItem>,
    schemas: Record<string, SchemaObject>
  ): void {
    // Parse route decorators: @Get('/path'), @Post('/path'), etc.
    const routeRegex = /@(Get|Post|Put|Patch|Delete|Options|Head)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      const method = match[1].toLowerCase() as keyof PathItem;
      const routePath = match[2];
      
      if (!paths[routePath]) {
        paths[routePath] = {};
      }
      
      (paths[routePath] as Record<string, unknown>)[method] = {
        summary: `Handle ${method.toUpperCase()} ${routePath}`,
        responses: {
          '200': {
            description: 'Successful response',
          },
        },
      };
    }

    // Parse TypeScript interfaces for schemas
    const interfaceRegex = /interface\s+(\w+)\s*\{([^}]+)\}/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];
      schemas[name] = this.parseInterfaceBody(body);
    }

    // Parse type definitions
    const typeRegex = /type\s+(\w+)\s*=\s*\{([^}]+)\}/g;
    while ((match = typeRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];
      schemas[name] = this.parseInterfaceBody(body);
    }
  }

  private parseInterfaceBody(body: string): SchemaObject {
    const properties: Record<string, SchemaObject> = {};
    const propRegex = /(\w+)(\??):\s*([^;]+);/g;
    
    let propMatch;
    while ((propMatch = propRegex.exec(body)) !== null) {
      const propName = propMatch[1];
      const isOptional = propMatch[2] === '?';
      const typeStr = propMatch[3].trim();
      
      properties[propName] = {
        ...this.mapType(typeStr),
        description: undefined,
      };
    }

    return {
      type: 'object',
      properties,
    };
  }

  private mapType(typeStr: string): SchemaObject {
    const trimmed = typeStr.replace(/\[\]/g, '');
    const isArray = typeStr.includes('[]');
    
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'integer': 'integer',
      'object': 'object',
      'any': 'object',
      'void': 'void',
      'null': 'null',
      'Date': 'string',
      'DateTime': 'string',
    };

    const formatMap: Record<string, string> = {
      'Date': 'date',
      'DateTime': 'date-time',
    };

    const baseType = typeMap[trimmed] || 'object';
    const schema: SchemaObject = {
      type: isArray ? 'array' : baseType,
    };

    if (formatMap[trimmed]) {
      schema.format = formatMap[trimmed];
    }

    if (isArray) {
      schema.items = { type: baseType };
    }

    return schema;
  }

  private parseGo(
    content: string,
    paths: Record<string, PathItem>,
    schemas: Record<string, SchemaObject>
  ): void {
    // Parse Gin/Echo handlers: gin.GET("/path", ...), etc.
    const routeRegex = /\w+\.(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*\(\s*"([^"]+)"\s*,/g;
    
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      const method = match[1].toLowerCase() as keyof PathItem;
      const routePath = match[2];
      
      if (!paths[routePath]) {
        paths[routePath] = {};
      }
      
      (paths[routePath] as Record<string, unknown>)[method] = {
        summary: `Handle ${method.toUpperCase()} ${routePath}`,
        responses: {
          '200': {
            description: 'Successful response',
          },
        },
      };
    }

    // Parse Go structs
    const structRegex = /type\s+(\w+)\s+struct\s*\{([^}]+)\}/g;
    let structMatch;
    while ((structMatch = structRegex.exec(content)) !== null) {
      const name = structMatch[1];
      const body = structMatch[2];
      schemas[name] = this.parseGoStruct(body);
    }
  }

  private parseGoStruct(body: string): SchemaObject {
    const properties: Record<string, SchemaObject> = {};
    const propRegex = /(\w+)\s+(\w+)\s*(?:`[^`]*`)?/g;
    
    let propMatch;
    while ((propMatch = propRegex.exec(body)) !== null) {
      const fieldName = propMatch[1];
      const fieldType = propMatch[2];
      
      properties[fieldName] = this.mapGoType(fieldType);
    }

    return {
      type: 'object',
      properties,
    };
  }

  private mapGoType(typeStr: string): SchemaObject {
    const isSlice = typeStr.startsWith('[]');
    const baseType = isSlice ? typeStr.slice(2) : typeStr;
    const isPointer = baseType.startsWith('*');
    const cleanType = isPointer ? baseType.slice(1) : baseType;

    const typeMap: Record<string, string> = {
      'string': 'string',
      'int': 'integer',
      'int32': 'integer',
      'int64': 'integer',
      'float32': 'number',
      'float64': 'number',
      'bool': 'boolean',
      'byte': 'string',
      'rune': 'string',
    };

    const base = typeMap[cleanType] || 'object';
    
    return isSlice
      ? { type: 'array', items: { type: base } }
      : { type: base };
  }

  private parsePython(
    content: string,
    paths: Record<string, PathItem>,
    schemas: Record<string, SchemaObject>
  ): void {
    // Parse Flask/FastAPI routes: @app.route('/path', methods=['GET']), etc.
    const routeRegex = /@(?:app|router)\.route\s*\(\s*['"]([^'"`]+)['"`]\s*(?:,\s*methods\s*=\s*\[([^\]]+)\])?/g;
    
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      const routePath = match[1];
      const methodsStr = match[2] || 'GET';
      const methods = methodsStr
        .split(',')
        .map((m) => m.trim().toLowerCase().replace(/['"]/g, ''))
        .filter((m) => ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(m));

      if (!paths[routePath]) {
        paths[routePath] = {};
      }

      for (const method of methods) {
        (paths[routePath] as Record<string, unknown>)[method] = {
          summary: `Handle ${method.toUpperCase()} ${routePath}`,
          responses: {
            '200': {
              description: 'Successful response',
            },
          },
        };
      }
    }

    // Parse Pydantic models
    const classRegex = /class\s+(\w+)\s*\(\s*(?:BaseModel|Schema)\s*\):/g;
    let classMatch;
    while ((classMatch = classRegex.exec(content)) !== null) {
      const name = classMatch[1];
      const classBody = this.extractPythonClassBody(content, classMatch.index);
      schemas[name] = this.parsePythonClass(classBody);
    }
  }

  private extractPythonClassBody(content: string, startIndex: number): string {
    const lines = content.slice(startIndex).split('\n');
    let body = '';
    let indent = -1;
    
    for (const line of lines.slice(1)) {
      if (line.trim() === '') continue;
      
      const lineIndent = line.search(/\S/);
      
      if (indent === -1 && lineIndent > 0) {
        indent = lineIndent;
        body = line + '\n';
      } else if (lineIndent >= indent && indent > 0) {
        body += line + '\n';
      } else if (lineIndent < indent || line.trim() === '') {
        break;
      }
    }
    
    return body;
  }

  private parsePythonClass(body: string): SchemaObject {
    const properties: Record<string, SchemaObject> = {};
    const propRegex = /(\w+)\s*:\s*(\w+)/g;
    
    let propMatch;
    while ((propMatch = propRegex.exec(body)) !== null) {
      const propName = propMatch[1];
      const typeStr = propMatch[2];
      
      if (propName === 'class' || propName === 'def') continue;
      
      properties[propName] = this.mapPythonType(typeStr);
    }

    return {
      type: 'object',
      properties,
    };
  }

  private mapPythonType(typeStr: string): SchemaObject {
    const isOptional = typeStr.includes('Optional[');
    const isList = typeStr.includes('List[');
    const isDict = typeStr.includes('Dict[');
    
    let cleanType = typeStr
      .replace('Optional[', '')
      .replace('List[', '')
      .replace('Dict[', '')
      .replace(/[\[\]]/g, '');

    const typeMap: Record<string, string> = {
      'str': 'string',
      'int': 'integer',
      'float': 'number',
      'bool': 'boolean',
      'bytes': 'string',
      'datetime': 'string',
      'date': 'string',
    };

    const baseType = typeMap[cleanType] || 'object';
    
    if (isDict) {
      return { type: 'object' };
    }
    
    if (isList) {
      return { type: 'array', items: { type: baseType } };
    }
    
    return { type: baseType };
  }

  toYaml(spec: OpenAPISpec): string {
    return yaml.stringify(spec, { indent: 2 });
  }
}
