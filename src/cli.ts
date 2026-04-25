#!/usr/bin/env node

import { Command } from 'commander';
import { Generator } from './generator';
import * as fs from 'fs-extra';
import * as path from 'path';

const program = new Command();

program
  .name('schemasync')
  .description('OpenAPI/Swagger generator from code')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate OpenAPI specification from source files')
  .requiredOption('-i, --input <path>', 'Input source directory or file')
  .requiredOption('-o, --output <path>', 'Output OpenAPI specification file')
  .option('-t, --title <title>', 'API title', 'My API')
  .option('-v, --version <version>', 'API version', '1.0.0')
  .option('-d, --description <description>', 'API description', '')
  .option('-f, --format <format>', 'Output format (json/yaml)', 'json')
  .action(async (options) => {
    try {
      const generator = new Generator({
        title: options.title,
        version: options.version,
        description: options.description,
      });

      const spec = await generator.generate(options.input);
      
      const outputDir = path.dirname(options.output);
      await fs.ensureDir(outputDir);

      if (options.format === 'yaml') {
        await fs.writeFile(options.output, generator.toYaml(spec), 'utf8');
      } else {
        await fs.writeJson(options.output, spec, { spaces: 2 });
      }

      console.log(`✅ OpenAPI specification written to ${options.output}`);
    } catch (error) {
      console.error('❌ Error generating specification:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
