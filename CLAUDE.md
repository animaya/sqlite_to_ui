# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Test, and Lint Commands

- Build: `deno task build` or `npm run build`
- Dev server: `deno task dev` or `npm run dev`
- Start server: `deno task start` or `npm run start`
- Setup database: `deno task setup-db`
- Run all tests: `deno task test`
- Run single test: `deno test --allow-net --allow-read --allow-write --allow-env path/to/test.ts`
- Lint: `deno lint` or `deno lint path/to/file.ts`
- Format: `deno fmt` or `deno fmt path/to/file.ts`
- Update dependencies: `deno task update`

## Code Style Guidelines

- **Formatting**: Follow deno fmt rules (2-space indent, 100-char line width, double quotes)
- **Naming**: Use camelCase for variables/functions, PascalCase for components/classes
- **Imports**: Group by standard library, external dependencies, then local imports
- **Types**: Use TypeScript types for all functions, parameters, and return values
- **Error Handling**: Propagate errors with context, use try/catch blocks appropriately
- **Components**: Follow React/Preact patterns, use functional components with hooks
- **State Management**: Use local state where possible, prop drilling for simple cases
- **File Structure**: Organize by feature (components, services, utils)