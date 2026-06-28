#!/usr/bin/env bash
# Compila el AAB de release FIRMADO de NEON EXODUS 2087 para Google Play.
#
# Requisitos (ya presentes en esta Mac):
#   - JDK 17  (Homebrew: brew install openjdk@17)
#   - Android SDK con platforms;android-35 y build-tools;35.0.0
#   - Firma en android/keystore/key.properties (FUERA del repo; ver keystore/info.md)
#
# Uso:  npm run android:aab     (o)   bash scripts/android-build.sh
set -euo pipefail
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

npm run build            # sincroniza www/ + regenera el standalone
npx cap sync android     # copia web + plugins al proyecto Android
cd android
./gradlew :app:bundleRelease --no-daemon "$@"

echo ""
echo "✅ AAB firmado: $DIR/android/app/build/outputs/bundle/release/app-release.aab"
