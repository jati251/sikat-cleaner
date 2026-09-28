#!/usr/bin/env bash
set -euo pipefail

# Configuration
KEY_PATH="${TAURI_SIGNING_PRIVATE_KEY_PATH:-}"
if [ -z "$KEY_PATH" ] && [ -f "../cekcok-draw/cekcok-draw.key" ]; then
  KEY_PATH="../cekcok-draw/cekcok-draw.key"
fi
KEY_PASSWORD="${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}"
MINIO_ALIAS="${MINIO_ALIAS:-public-minio}"
MINIO_BUCKET="${MINIO_BUCKET:-cekcok-releases}"
MINIO_PUBLIC_URL="${MINIO_PUBLIC_URL:-https://releases.cekcok.my.id/cekcok-releases}"

echo "🧹 === Deploying Sikat Cleaner to MinIO ($MINIO_ALIAS/$MINIO_BUCKET) ==="

# 1. Build frontend
echo "📦 Step 1: Building Frontend..."
pnpm run build

# 2. Build Tauri desktop bundle with signing key
echo "🦀 Step 2: Compiling Tauri release bundle & signing updater artifacts..."
if [ -f "$KEY_PATH" ]; then
  export TAURI_SIGNING_PRIVATE_KEY="$(cat "$KEY_PATH")"
  export TAURI_PRIVATE_KEY="$(cat "$KEY_PATH")"
  export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$KEY_PASSWORD"
  export TAURI_KEY_PASSWORD="$KEY_PASSWORD"
  pnpm tauri build || true
else
  echo "⚠️ Private key not found at $KEY_PATH, running build with existing env..."
  pnpm tauri build || true
fi

VERSION=$(node -p "require('./package.json').version")
BUNDLE_DIR="src-tauri/target/release/bundle"
PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 3. Locate Artifacts
DMG_FILE=$(find "$BUNDLE_DIR/dmg" -name "*.dmg" 2>/dev/null | head -n 1)
UPDATER_FILE=$(find "$BUNDLE_DIR" -name "*.app.tar.gz" 2>/dev/null | head -n 1)

if [ -z "$DMG_FILE" ] || [ ! -f "$DMG_FILE" ]; then
  echo "❌ Error: DMG not found in $BUNDLE_DIR/dmg"
  exit 1
fi

if [ -z "$UPDATER_FILE" ] || [ ! -f "$UPDATER_FILE" ]; then
  echo "❌ Error: Updater archive (.app.tar.gz) not found in $BUNDLE_DIR"
  exit 1
fi

UPDATER_SIG="${UPDATER_FILE}.sig"
if [ ! -f "$UPDATER_SIG" ]; then
  echo "✍️ Signing updater archive manually..."
  pnpm tauri signer sign -f "$KEY_PATH" -p "$KEY_PASSWORD" --app-version "$VERSION" "$UPDATER_FILE"
fi

DMG_NAME=$(basename "$DMG_FILE")
UPDATER_NAME=$(basename "$UPDATER_FILE")
SIG_CONTENT=$(cat "$UPDATER_SIG")

echo "🚀 Step 3: Uploading artifacts via MinIO Client (mc)..."

# Upload DMG
mc cp "$DMG_FILE" "$MINIO_ALIAS/$MINIO_BUCKET/$DMG_NAME"
mc cp "$DMG_FILE" "$MINIO_ALIAS/$MINIO_BUCKET/SikatCleaner-macos.dmg"
mc cp "$DMG_FILE" "$MINIO_ALIAS/$MINIO_BUCKET/SikatCleaner.dmg"

# Upload Updater archive (.app.tar.gz & .sig)
mc cp "$UPDATER_FILE" "$MINIO_ALIAS/$MINIO_BUCKET/$UPDATER_NAME"
mc cp "$UPDATER_SIG" "$MINIO_ALIAS/$MINIO_BUCKET/${UPDATER_NAME}.sig"

# Upload normalized alias without spaces
NORMALIZED_UPDATER="SikatCleaner.app.tar.gz"
if [ "$UPDATER_NAME" != "$NORMALIZED_UPDATER" ]; then
  mc cp "$UPDATER_FILE" "$MINIO_ALIAS/$MINIO_BUCKET/$NORMALIZED_UPDATER"
  mc cp "$UPDATER_SIG" "$MINIO_ALIAS/$MINIO_BUCKET/${NORMALIZED_UPDATER}.sig"
fi

# 4. Generate & Upload sikat-latest.json
echo "📝 Step 4: Updating updater manifest (sikat-latest.json)..."
TMP_MANIFEST="/tmp/sikat-latest-$VERSION.json"
mc cp "$MINIO_ALIAS/$MINIO_BUCKET/sikat-latest.json" "$TMP_MANIFEST" 2>/dev/null || echo "{}" > "$TMP_MANIFEST"

export SIG_CONTENT
export VERSION
export PUB_DATE
export NORMALIZED_UPDATER
export MINIO_PUBLIC_URL
export TMP_MANIFEST

node -e "
  const fs = require('fs');
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(process.env.TMP_MANIFEST, 'utf8'));
  } catch (e) {
    data = {};
  }

  data.version = process.env.VERSION;
  data.notes = 'Sikat Cleaner v' + process.env.VERSION + ' release with interactive Space Lens, Full Disk Access support, and safe system cleaning.';
  data.pub_date = process.env.PUB_DATE;
  data.platforms = data.platforms || {};
  data.platforms['darwin-aarch64'] = {
    signature: process.env.SIG_CONTENT,
    url: process.env.MINIO_PUBLIC_URL + '/' + process.env.NORMALIZED_UPDATER
  };

  fs.writeFileSync(process.env.TMP_MANIFEST, JSON.stringify(data, null, 2));
"

mc cp "$TMP_MANIFEST" "$MINIO_ALIAS/$MINIO_BUCKET/sikat-latest.json"
rm -f "$TMP_MANIFEST"

echo "✅ SUCCESS! Sikat Cleaner v$VERSION deployed to MinIO successfully!"
echo "🔗 Download DMG: $MINIO_PUBLIC_URL/SikatCleaner.dmg"
echo "🔗 Version DMG: $MINIO_PUBLIC_URL/$DMG_NAME"
echo "🔗 Updater Manifest: $MINIO_PUBLIC_URL/sikat-latest.json"
