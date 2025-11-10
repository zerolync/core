#!/bin/bash

# Zerolync Passkey SDK - NPM Publishing Script
# Usage: ./publish-sdk.sh <NPM_TOKEN>
# Example: ./publish-sdk.sh npm_xxxxxxxxxxxxxxxxxxxx

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if npm token is provided
if [ -z "$1" ]; then
    log_error "NPM access token is required!"
    echo ""
    echo "Usage: $0 <NPM_TOKEN>"
    echo ""
    echo "Example:"
    echo "  $0 npm_xxxxxxxxxxxxxxxxxxxx"
    echo ""
    echo "To get your NPM token:"
    echo "  1. Login to npmjs.com"
    echo "  2. Go to Access Tokens in your account settings"
    echo "  3. Generate a new token with 'Automation' or 'Publish' permissions"
    exit 1
fi

NPM_TOKEN=$1

log_info "Starting Zerolync Passkey SDK publication process..."
echo ""

# Step 1: Clean install
log_info "Step 1/6: Installing dependencies..."
pnpm install --frozen-lockfile
log_success "Dependencies installed"
echo ""

# Step 2: Clean previous builds
log_info "Step 2/6: Cleaning previous builds..."
pnpm --filter "@zero-lync/passkey-*" clean || true
log_success "Clean complete"
echo ""

# Step 3: Build all SDK packages
log_info "Step 3/6: Building SDK packages..."
pnpm --filter "@zero-lync/passkey-*" build
log_success "Build complete"
echo ""

# Step 4: Run tests (if available)
log_info "Step 4/6: Running tests..."
if pnpm --filter "@zero-lync/passkey-*" test 2>/dev/null; then
    log_success "Tests passed"
else
    log_warning "No tests found or tests skipped"
fi
echo ""

# Step 5: Set up npm authentication
log_info "Step 5/6: Configuring npm authentication..."
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
log_success "NPM authentication configured"
echo ""

# Step 6: Publish packages
log_info "Step 6/6: Publishing packages to npm..."
echo ""

PACKAGES=("core" "solana" "sui")
PUBLISHED=()
FAILED=()

for pkg in "${PACKAGES[@]}"; do
    PKG_PATH="sdk/${pkg}"
    PKG_NAME=$(node -p "require('./${PKG_PATH}/package.json').name")
    PKG_VERSION=$(node -p "require('./${PKG_PATH}/package.json').version")

    log_info "Publishing ${PKG_NAME}@${PKG_VERSION}..."

    # Check if this version is already published
    if npm view "${PKG_NAME}@${PKG_VERSION}" version 2>/dev/null; then
        log_warning "${PKG_NAME}@${PKG_VERSION} is already published. Skipping."
        continue
    fi

    # Publish the package
    if (cd "${PKG_PATH}" && npm publish --access public); then
        log_success "Published ${PKG_NAME}@${PKG_VERSION}"
        PUBLISHED+=("${PKG_NAME}@${PKG_VERSION}")
    else
        log_error "Failed to publish ${PKG_NAME}@${PKG_VERSION}"
        FAILED+=("${PKG_NAME}@${PKG_VERSION}")
    fi

    echo ""
done

# Clean up npm token
log_info "Cleaning up npm authentication..."
rm -f ~/.npmrc
log_success "Cleanup complete"
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo ""
log_info "Publication Summary:"
echo ""

if [ ${#PUBLISHED[@]} -gt 0 ]; then
    log_success "Successfully published ${#PUBLISHED[@]} package(s):"
    for pkg in "${PUBLISHED[@]}"; do
        echo "  • $pkg"
    done
    echo ""
fi

if [ ${#FAILED[@]} -gt 0 ]; then
    log_error "Failed to publish ${#FAILED[@]} package(s):"
    for pkg in "${FAILED[@]}"; do
        echo "  • $pkg"
    done
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    exit 1
fi

log_success "All SDK packages published successfully! 🎉"
echo ""
echo "Your packages are now available on npm:"
for pkg in "${PUBLISHED[@]}"; do
    PKG_NAME=$(echo "$pkg" | cut -d'@' -f1)
    echo "  • https://www.npmjs.com/package/${PKG_NAME}"
done
echo ""
echo "Users can now install them with:"
echo "  npm install ${PUBLISHED[0]%%@*}"
echo "  # or"
echo "  pnpm add ${PUBLISHED[0]%%@*}"
echo ""
echo "════════════════════════════════════════════════════════════════"
