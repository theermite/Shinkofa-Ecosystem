# My CLI Tool (TypeScript)

Production-ready CLI tool template built with TypeScript + Commander.

## Features

- ✅ TypeScript with strict mode
- ✅ Commander.js for command parsing
- ✅ Chalk for colored output
- ✅ Ora for spinners
- ✅ Inquirer for interactive prompts
- ✅ Vitest for testing
- ✅ ESLint + Prettier
- ✅ Environment configuration

## Installation

```bash
npm install
```

## Development

```bash
# Run in dev mode
npm run dev

# Build
npm run build

# Run built CLI
npm start
```

## Commands

### `mycli init`

Initialize a new project.

```bash
mycli init --name my-project
mycli init --name my-project --dir /path/to/parent
mycli init -y  # Skip prompts
```

### `mycli deploy`

Deploy application.

```bash
mycli deploy --env production
mycli deploy --env staging --dry-run
```

### `mycli db`

Database management.

```bash
mycli db migrate
mycli db migrate --rollback
mycli db seed
mycli db status
```

## Testing

```bash
# Run tests
npm test

# With coverage
npm run test:coverage
```

## Code Quality

```bash
# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check

# Type check
npm run type-check
```

## Project Structure

```
src/
├── index.ts              # Entry point
├── commands/             # Command implementations
│   ├── init.ts
│   ├── deploy.ts
│   └── db.ts
└── core/                 # Core utilities
    ├── config.ts         # Configuration
    └── logger.ts         # Logging
```

## Publishing

```bash
# Build
npm run build

# Publish to npm
npm publish
```

After publishing, users can install globally:

```bash
npm install -g mycli
```

## License

MIT
