#!/usr/bin/env bash
# Temporary while @absmartly/javascript-sdk is a git dependency. npm installs a git
# dependency by running only its `prepare` script, not its `prepack` build, so after
# `npm ci` the package has no lib/es/dist. This builds the commit package-lock.json pins
# and installs it over node_modules/@absmartly/javascript-sdk like a registry release.
# Remove together with the git dependency once javascript-sdk 1.14.0 is published.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
resolved="$(node -p 'require(process.argv[1]).packages["node_modules/@absmartly/javascript-sdk"].resolved' "$root/package-lock.json")"
ref="${resolved##*#}"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

git clone --quiet https://github.com/absmartly/javascript-sdk.git "$work/javascript-sdk"
cd "$work/javascript-sdk"
git checkout --quiet "$ref"
npm ci --ignore-scripts
# `npm pack` runs the package's prepack script, which is its full build.
npm pack --pack-destination "$work" >/dev/null
tarball="$(ls "$work"/*.tgz)"

target="$root/node_modules/@absmartly/javascript-sdk"
rm -rf "$target"
mkdir -p "$target"
tar -xzf "$tarball" -C "$target" --strip-components=1
echo "Installed @absmartly/javascript-sdk from ${ref}"
