# NPM Publishing - Quick Start

## 🚀 Quick Publish

```bash
./publish-sdk.sh npm_YOUR_TOKEN_HERE
```

## 📦 Packages That Will Be Published

- `@zero-lync/passkey-core` - Core utilities and types
- `@zero-lync/passkey-solana` - Solana React hooks
- `@zero-lync/passkey-sui` - Sui React hooks

## 🔑 Getting Your NPM Token

1. Go to https://www.npmjs.com
2. Login to your account
3. Click Profile → **Access Tokens**
4. Click **Generate New Token** → **Automation**
5. Copy the token

## ✅ Pre-Publish Checklist

- [ ] Code builds without errors
- [ ] Version numbers updated in package.json
- [ ] README files are current
- [ ] No secrets or hardcoded values in code
- [ ] Changes committed to git

## 📖 Full Documentation

See [PUBLISHING.md](./PUBLISHING.md) for complete documentation.

## ⚠️ Important Notes

- The script will skip versions that already exist on npm
- Your npm token is temporary - it will be cleaned up after publishing
- First time publishing requires npm registry access for `@zero-lync` scope
- Run `pnpm build` locally first to catch any issues

## 🆘 Troubleshooting

**Build fails**: Run `pnpm build` locally to see detailed errors

**Authentication fails**: Check your npm token is valid and has publish permissions

**Scope access denied**: You need access to publish under `@zero-lync` scope on npm
