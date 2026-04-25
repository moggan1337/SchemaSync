import { Generator } from '../src/generator';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('Generator', () => {
  let generator: Generator;
  let tempDir: string;

  beforeEach(() => {
    generator = new Generator({
      title: 'Test API',
      version: '1.0.0',
      description: 'A test API',
    });
    tempDir = path.join(__dirname, 'temp-' + Date.now());
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('constructor', () => {
    it('should create a generator with default options', () => {
      const gen = new Generator();
      expect(gen).toBeInstanceOf(Generator);
    });

    it('should create a generator with custom options', () => {
      const gen = new Generator({
        title: 'Custom API',
        version: '2.0.0',
        description: 'Custom description',
      });
      expect(gen).toBeInstanceOf(Generator);
    });
  });

  describe('generate', () => {
    it('should generate a valid OpenAPI spec for TypeScript routes', async () => {
      const testFile = path.join(tempDir, 'routes.ts');
      await fs.ensureDir(tempDir);
      await fs.writeFile(testFile, `
        @Get('/users')
        getUsers() {}

        @Post('/users')
        createUser() {}

        interface User {
          id: number;
          name: string;
        }
      `);

      const spec = await generator.generate(tempDir);

      expect(spec.openapi).toBe('3.0.3');
      expect(spec.info.title).toBe('Test API');
      expect(spec.info.version).toBe('1.0.0');
      expect(spec.info.description).toBe('A test API');
      expect(spec.paths['/users']).toBeDefined();
      expect(spec.paths['/users'].get).toBeDefined();
      expect(spec.paths['/users'].post).toBeDefined();
    });

    it('should parse TypeScript interfaces as schemas', async () => {
      const testFile = path.join(tempDir, 'types.ts');
      await fs.ensureDir(tempDir);
      await fs.writeFile(testFile, `
        interface User {
          id: number;
          name: string;
          email?: string;
        }
      `);

      const spec = await generator.generate(tempDir);

      expect(spec.components?.schemas?.User).toBeDefined();
      expect(spec.components?.schemas?.User.type).toBe('object');
      expect(spec.components?.schemas?.User.properties?.id?.type).toBe('number');
      expect(spec.components?.schemas?.User.properties?.name?.type).toBe('string');
      expect(spec.components?.schemas?.User.properties?.email?.type).toBe('string');
    });

    it('should handle Go structs', async () => {
      const testFile = path.join(tempDir, 'models.go');
      await fs.ensureDir(tempDir);
      await fs.writeFile(testFile, `
        type User struct {
          ID   int
          Name string
        }
      `);

      const spec = await generator.generate(tempDir);

      expect(spec.components?.schemas?.User).toBeDefined();
      expect(spec.components?.schemas?.User.properties?.ID?.type).toBe('integer');
      expect(spec.components?.schemas?.User.properties?.Name?.type).toBe('string');
    });

    it('should handle Go Gin routes', async () => {
      const testFile = path.join(tempDir, 'handlers.go');
      await fs.ensureDir(tempDir);
      await fs.writeFile(testFile, `
        func main() {
          r := gin.Default()
          r.GET("/hello", helloHandler)
          r.POST("/items", createItem)
        }
      `);

      const spec = await generator.generate(tempDir);

      expect(spec.paths['/hello']).toBeDefined();
      expect(spec.paths['/hello'].get).toBeDefined();
      expect(spec.paths['/items']).toBeDefined();
      expect(spec.paths['/items'].post).toBeDefined();
    });

    it('should handle Python FastAPI/Flask routes', async () => {
      const testFile = path.join(tempDir, 'app.py');
      await fs.ensureDir(tempDir);
      await fs.writeFile(testFile, `
        @app.route('/items', methods=['GET'])
        def get_items():
          pass

        @app.route('/items', methods=['POST'])
        def create_item():
          pass
      `);

      const spec = await generator.generate(tempDir);

      expect(spec.paths['/items']).toBeDefined();
      expect(spec.paths['/items'].get).toBeDefined();
      expect(spec.paths['/items'].post).toBeDefined();
    });

    it('should handle Pydantic models', async () => {
      const testFile = path.join(tempDir, 'schemas.py');
      await fs.ensureDir(tempDir);
      await fs.writeFile(testFile, `
        class User(BaseModel):
          id: int
          name: str
          email: Optional[str]
      `);

      const spec = await generator.generate(tempDir);

      expect(spec.components?.schemas?.User).toBeDefined();
      expect(spec.components?.schemas?.User.type).toBe('object');
      expect(spec.components?.schemas?.User.properties?.id?.type).toBe('integer');
      expect(spec.components?.schemas?.User.properties?.name?.type).toBe('string');
    });

    it('should process a single file', async () => {
      const testFile = path.join(tempDir, 'single.ts');
      await fs.ensureDir(tempDir);
      await fs.writeFile(testFile, `
        @Get('/single')
        singleRoute() {}
      `);

      const spec = await generator.generate(testFile);

      expect(spec.paths['/single']).toBeDefined();
      expect(spec.paths['/single'].get).toBeDefined();
    });

    it('should return basic spec for empty directory', async () => {
      await fs.ensureDir(tempDir);

      const spec = await generator.generate(tempDir);

      expect(spec.openapi).toBe('3.0.3');
      expect(spec.info.title).toBe('Test API');
      expect(spec.paths).toEqual({});
    });
  });

  describe('toYaml', () => {
    it('should convert spec to YAML', async () => {
      await fs.ensureDir(tempDir);
      const spec = await generator.generate(tempDir);
      const yaml = generator.toYaml(spec);

      expect(yaml).toContain('openapi: 3.0.3');
      expect(yaml).toContain('title: Test API');
    });
  });
});
