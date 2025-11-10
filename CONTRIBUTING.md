# Contributing to Zerolync Passkey SDK

Thank you for your interest in contributing to Zerolync Passkey SDK! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9.0.0
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/zerolync-passkey-sdk.git
   cd zerolync-passkey-sdk
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/zerolync/zerolync-passkey-sdk.git
   ```

4. Install dependencies:
   ```bash
   pnpm install
   ```

5. Build all packages:
   ```bash
   pnpm build
   ```

## Development Workflow

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Running Development Servers

```bash
# Run demo app
pnpm dev

# Run portal service
cd services/portal
pnpm dev

# Watch build for SDK packages
pnpm --filter @zero-lync/passkey-solana dev
pnpm --filter @zero-lync/passkey-sui dev
```

## Project Structure

```
zerolync-passkey-sdk/
├── sdk/                    # SDK packages for npm
│   ├── core/              # @zero-lync/passkey-core
│   ├── solana/            # @zero-lync/passkey-solana
│   └── sui/               # @zero-lync/passkey-sui
├── services/              # Backend services
│   └── portal/            # Signing portal UI
├── apps/                  # Example applications
│   └── demo/              # Demo app
└── docs/                  # Documentation (if applicable)
```

### Package Responsibilities

- **sdk/core**: Core utilities, types, and storage
- **sdk/solana**: Solana-specific React hooks and providers
- **sdk/sui**: Sui-specific React hooks and providers
- **services/portal**: Portal signing interface
- **apps/demo**: Demo application showcasing SDK usage

## Making Changes

### Guidelines

1. **Keep changes focused**: One feature or fix per PR
2. **Write clear commit messages**: Use conventional commits format
3. **Update documentation**: Keep README files in sync with code changes
4. **Add tests**: Include tests for new features (when test infrastructure is available)
5. **Follow code style**: Use TypeScript, follow existing patterns

### Conventional Commits

We use conventional commits for clear commit messages:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes (formatting, etc.)
refactor: code refactoring
test: adding or updating tests
chore: maintenance tasks
```

Examples:
```bash
git commit -m "feat(solana): add support for custom RPC endpoints"
git commit -m "fix(sui): resolve transaction signing error"
git commit -m "docs: update Solana SDK README with new examples"
```

### Making Code Changes

1. Make your changes in your feature branch
2. Build and test locally:
   ```bash
   pnpm build
   pnpm --filter demo dev
   ```

3. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. Keep your branch up to date:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Testing

### Manual Testing

1. Build the packages:
   ```bash
   pnpm build
   ```

2. Run the demo app:
   ```bash
   pnpm dev
   ```

3. Test your changes in the browser

### Future: Automated Tests

We're working on adding automated tests. When available:

```bash
# Run tests for all packages
pnpm test

# Run tests for specific package
pnpm --filter @zero-lync/passkey-solana test
```

## Submitting Changes

### Before Submitting

- [ ] Code builds without errors (`pnpm build`)
- [ ] Demo app runs correctly (`pnpm dev`)
- [ ] README and documentation updated
- [ ] Commit messages follow conventional commits
- [ ] Changes are focused and atomic

### Creating a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the GitHub repository and create a Pull Request

3. Fill out the PR template with:
   - Clear description of changes
   - Motivation and context
   - Screenshots (if UI changes)
   - Related issues (if applicable)

4. Wait for review and address feedback

### PR Review Process

- Maintainers will review your PR
- You may be asked to make changes
- Once approved, your PR will be merged

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define explicit types, avoid `any`
- Export types that consumers might need
- Use interfaces for object shapes

### React

- Use functional components
- Use hooks for state and side effects
- Keep components focused and small
- Extract reusable logic into custom hooks

### Naming Conventions

- **Files**: `kebab-case.ts`, `PascalCase.tsx` for components
- **Variables**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Components**: `PascalCase`

### Example Code Style

```typescript
// Good
interface WalletConfig {
  rpcUrl: string;
  portalUrl: string;
}

export function useWallet(config: WalletConfig) {
  const [address, setAddress] = useState<string | null>(null);

  const connect = useCallback(async () => {
    // Implementation
  }, []);

  return { address, connect };
}

// Avoid
export function useWallet(config: any) {
  const [address, setAddress] = useState(null);

  const connect = async () => {
    // Implementation
  };

  return { address, connect };
}
```

## Package-Specific Guidelines

### SDK Packages (core, solana, sui)

- Keep zero runtime dependencies (except peer dependencies)
- Export only public API
- Document all public functions and types
- Follow semantic versioning

### Portal Service

- Keep UI responsive and accessible
- Support dark/light themes if applicable
- Test across different browsers
- Optimize bundle size

### Demo App

- Keep examples simple and focused
- Add comments explaining key concepts
- Ensure mobile responsiveness
- Update when SDK changes

## Questions?

- Open an issue for bugs or feature requests
- Join our Discord for discussions
- Check existing issues and PRs first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Zerolync Passkey SDK!
