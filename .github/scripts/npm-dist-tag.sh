#!/usr/bin/env bash
# Usage: npm-dist-tag.sh VERSION LATEST (LATEST: current "latest" on npm).
# The rules are documented in CONTRIBUTING.md ("Releasing") and pinned by
# tests/unit/npm-dist-tag.spec.js. Fails closed for stable releases when
# LATEST is not a plain x.y.z version, as we cannot tell whether "latest"
# would move backwards.
# (npm rejects tag names that are semver ranges, such as "v1" or "1.2".)
set -euo pipefail

# Build metadata ("+...") does not affect precedence or the channel, so
# 1.3.0+ci-alpha is a stable release.
VERSION=${1:?usage: npm-dist-tag.sh VERSION LATEST}
VERSION=${VERSION%%+*}
LATEST=${2-}
LATEST=${LATEST%%+*}
SEMVER='^([0-9]+)\.([0-9]+)\.([0-9]+)$'

case "$VERSION" in
	*-alpha*) echo alpha; exit 0 ;;
	*-beta*) echo beta; exit 0 ;;
	*-*) echo next; exit 0 ;;
esac

if ! [[ "$VERSION" =~ $SEMVER ]]; then
	echo "Version '${VERSION}' is not a plain x.y.z version" >&2
	exit 1
fi
MAJOR=$((10#${BASH_REMATCH[1]}))
MINOR=$((10#${BASH_REMATCH[2]}))
PATCH=$((10#${BASH_REMATCH[3]}))

if ! [[ "$LATEST" =~ $SEMVER ]]; then
	echo "Could not read the current latest version (got '${LATEST}')" >&2
	exit 1
fi
L_MAJOR=$((10#${BASH_REMATCH[1]}))
L_MINOR=$((10#${BASH_REMATCH[2]}))
L_PATCH=$((10#${BASH_REMATCH[3]}))

if [ "$MAJOR" -lt "$L_MAJOR" ]; then
	echo "latest-${MAJOR}"
elif [ "$MAJOR" -eq "$L_MAJOR" ] && { [ "$MINOR" -lt "$L_MINOR" ] ||
	{ [ "$MINOR" -eq "$L_MINOR" ] && [ "$PATCH" -lt "$L_PATCH" ]; }; }; then
	echo "latest-${MAJOR}.${MINOR}"
else
	echo latest
fi
