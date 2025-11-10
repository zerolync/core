# Publishing Zerolync Passkey SDK to NPM

This guide explains how to publish the SDK packages to npm registry.

## Prerequisites

1. **NPM Account**: You need an npm account with publishing permissions
2. **Access Token**: Generate an automation token from npmjs.com
3. **Package Scope**: Ensure you have access to publish under the `@zero-lync` organization scope

## Getting Your NPM Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click on your profile picture → **Access Tokens**
3. Click **Generate New Token**
4. Choose **Automation** or **Publish** type
5. Copy the token (it will look like: `npm_xxxxxxxxxxxxxxxxxxxx`)

**Important**: Keep your token secure! Never commit it to git.

## Pre-Publishing Checklist

Before publishing, ensure:

- [ ] All code changes are committed to git
- [ ] Version numbers are updated in all `package.json` files
- [ ] README files are up to date
- [ ] CHANGELOG.md is updated with release notes
- [ ] All builds pass locally (`pnpm build`)
- [ ] No hardcoded values or secrets in the code

## Publishing

To publish all SDK packages to npm, run:

```bash
./publish-sdk.sh npm_xxxxxxxxxxxxxxxxxxxx
```

Replace `npm_xxxxxxxxxxxxxxxxxxxx` with your actual NPM token.

The script will:
1. Install dependencies
2. Clean previous builds
3. Build all SDK packages
4. Run tests (if available)
5. Configure npm authentication
6. Publish each package to npm
7. Clean up credentials
8. Show summary of published packages

## What Gets Published

The following packages will be published:

1. **@zero-lync/passkey-core** - Core utilities and types
2. **@zero-lync/passkey-solana** - Solana integration
3. **@zero-lync/passkey-sui** - Sui integration

Each package includes:
- Compiled JavaScript (CJS and ESM)
- TypeScript declarations (.d.ts files)
- README.md
- package.json

## Version Management

### Updating Versions

Update versions manually in each `package.json`:

```bash
# For a patch release (0.1.0 -> 0.1.1)
# Update version in sdk/core/package.json
# Update version in sdk/solana/package.json
# Update version in sdk/sui/package.json
```

Or use npm version command:

```bash
cd sdk/core && npm version patch
cd ../solana && npm version patch
cd ../sui && npm version patch
```

### Version Types

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features, backwards compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):
- Breaking changes → Major version bump
- New features → Minor version bump
- Bug fixes → Patch version bump

## Git Tagging

After successful publishing, tag the release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Troubleshooting

### Error: "Version already exists"

**Solution**: Update the version number in the package.json files and try again.

### Error: "Authentication failed"

**Solution**:
- Check your NPM token is valid
- Ensure you have publish permissions for the package scope
- Generate a new token if needed

### Error: "Package scope not found"

**Solution**: The package scope (e.g., `zerolync-sdk`) must exist on npm. Either:
- Publish under a different scope you own
- Create the organization on npmjs.com
- Contact the scope owner for access

### Error: "Build failed"

**Solution**:
- Run `pnpm build` locally to see detailed errors
- Fix TypeScript errors
- Ensure all dependencies are installed

## Updating Published Packages

To update a published package:

1. Make your code changes
2. Update the version number in package.json
3. Update CHANGELOG.md
4. Run dry run: `./publish-sdk-dryrun.sh`
5. Publish: `./publish-sdk.sh YOUR_TOKEN`
6. Tag the release in git

## Unpublishing Packages

**Warning**: Unpublishing is discouraged and has restrictions.

To unpublish within 72 hours:

```bash
npm unpublish @zero-lync/passkey-core@0.1.0
```

After 72 hours, you can only deprecate:

```bash
npm deprecate @zero-lync/passkey-core@0.1.0 "This version has been deprecated"
```

## CI/CD Integration

For automated publishing via GitHub Actions or other CI/CD:

1. Store NPM token as a secret in your CI/CD platform
2. Create a workflow that runs `publish-sdk.sh` with the token
3. Only trigger on tagged releases or manual approval

Example GitHub Actions workflow:

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: chmod +x publish-sdk.sh
      - run: ./publish-sdk.sh ${{ secrets.NPM_TOKEN }}
```

## Package URLs

After publishing, your packages will be available at:

- https://www.npmjs.com/package/@zero-lync/passkey-core
- https://www.npmjs.com/package/@zero-lync/passkey-solana
- https://www.npmjs.com/package/@zero-lync/passkey-sui

## Support

For issues with publishing:
- Check [npm documentation](https://docs.npmjs.com/)
- Contact npm support for account/permission issues
- Review package.json configuration in each SDK package

## Security Notes

- Never commit npm tokens to version control
- Use automation tokens (not classic tokens) for CI/CD
- Rotate tokens periodically
- Use 2FA on your npm account
- Review what files are published (check `files` array in package.json)
