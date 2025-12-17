# Vestitus Backend

## Architecture Overview

This is a **NestJS v11 TypeScript backend** with a modular, decorator-based architecture. The project follows NestJS conventions with modules, controllers, and services for dependency injection and clear separation of concerns.

- **Framework**: NestJS 11 with Express
- **Language**: TypeScript 5.7 (strict mode enabled)
- **Port**: Default 3000 (configurable via `PORT` env var)
- **Module structure**: `src/app.module.ts` is the root module that imports controllers and providers

## Key Development Commands

**Development & debugging**:

```bash
yarn dev                    # Watch mode (nest start --watch)
yarn start:debug           # Debug mode with inspector
yarn build                 # Compile to dist/
```

**Testing**:

```bash
yarn test                  # Unit tests (jest, src/**/*.spec.ts)
yarn test:watch           # Watch mode
yarn test:e2e             # Integration tests (test/jest-e2e.json)
yarn test:cov             # Coverage report
yarn test:debug           # Debug with node inspector
```

**Code quality**:

```bash
yarn lint                 # ESLint with --fix
yarn format              # Prettier format
```

## Project Structure

```
src/
  main.ts              # Bootstrap entry (NestFactory.create)
  app.module.ts        # Root DI module @Module()
  app.controller.ts    # HTTP handlers @Controller()
  app.service.ts       # Business logic @Injectable()
  *.spec.ts            # Unit tests (co-located)
test/
  app.e2e-spec.ts      # E2E tests (creates full app)
  jest-e2e.json        # Separate E2E config
```

## Critical Patterns & Conventions

### NestJS Dependency Injection

- Use `@Injectable()` on services for DI container
- Constructor inject dependencies (not property decorators)
- Modules export providers via `providers` array
- Controllers depend only on services, not other controllers

**Example from codebase** ([src/app.service.ts](src/app.service.ts) → [src/app.controller.ts](src/app.controller.ts)):

```typescript
// Service decorated with @Injectable()
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

// Controller injects via constructor
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

### Testing Conventions

- **Unit tests**: Use `@nestjs/testing` `Test.createTestingModule()` to compile modules
- **E2E tests**: Import root `AppModule`, call `createNestApplication()`, init before each test
- Co-locate specs with source files (`.spec.ts` next to implementation)
- Always clean up: `beforeEach` setup, no global state between tests

**Test pattern** ([src/app.controller.spec.ts](src/app.controller.spec.ts)):

```typescript
const app = await Test.createTestingModule({
  controllers: [AppController],
  providers: [AppService],
}).compile();
```

### TypeScript Configuration

- **Strict mode enabled**: `strictNullChecks`, `noImplicitAny`, `forceConsistentCasingInFileNames`
- Decorator metadata required: `experimentalDecorators`, `emitDecoratorMetadata` enabled
- Output: ES2023 with source maps to `dist/`
- Incremental compilation enabled for dev speed

## Common Tasks

### Adding a new endpoint

1. Create/update controller in `src/` with `@Controller()` and route decorator (`@Get()`, `@Post()`, etc.)
2. Inject required services in constructor
3. Add service method with business logic
4. Add unit test in `.spec.ts` file using `Test.createTestingModule()`
5. (Optional) Add E2E test in `test/app.e2e-spec.ts` using `supertest` for HTTP assertions

### Running in production

```bash
yarn build && yarn start:prod  # Compiles to dist/ and runs dist/main.js
```

## Build & Compilation Details

- **Hot reload**: Enabled in watch mode via `nest start --watch`
- **Output**: `dist/main.js` (NestJS CLI manages compilation with ts-loader by default)
- **Jest config**: Located in `package.json`, rootDir is `src/`, transforms with `ts-jest`
- **ESLint**: Flat config in `eslint.config.mjs` (v9+), includes Prettier integration

## External Dependencies

- **@nestjs/core, @nestjs/common, @nestjs/platform-express**: Core NestJS framework
- **reflect-metadata**: Required for decorator support (imported in bootstrap)
- **rxjs**: Reactive utilities (included with NestJS)
- **@types/express, @types/jest, @types/node**: TypeScript definitions
- **ts-jest, ts-loader**: TypeScript compilation for Jest and Webpack

## Environment

- **Node version**: Check `.nvmrc` or infer from dev dependencies (v22+ recommended)
- **Package manager**: yarn (see package.json scripts)
- **Port configuration**: Via `process.env.PORT ?? 3000` in [src/main.ts](src/main.ts)
