#!/usr/bin/env bash
# Prints the npm dist-tag to publish VERSION under, given LATEST, the
# version the "latest" dist-tag points at now (empty if unknown).
#
#   prerelease                        -> alpha / beta / next
#   stable, newer than LATEST         -> latest
#   stable, older major than LATEST   -> latest-<major>        (e.g. latest-1)
#   stable, older but same major      -> latest-<major>.<minor> (e.g. latest-1.2)
#
# So "latest" never moves backwards. Fails closed for stable releases when
# LATEST is not a plain x.y.z version, as we cannot tell which way it moves.
# (npm rejects tag names that are semver ranges, such as "v1" or "1.2".)
set -euo pipefail

VERSION=${1:?usage: npm-dist-tag.sh VERSION LATEST}
LATEST=${2-}
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
