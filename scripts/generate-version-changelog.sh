#!/bin/bash

# Get the current version from package.json
VERSION=$(node -p "require('./package.json').version")
OUTPUT_FILE="docs/changelogs/v$VERSION.md"

# Ensure the output directory exists
mkdir -p docs/changelogs

# Use sed to extract content from the first '## [' header up to (but not including) the next '## [' header.
# Logic: Find the first match of '## ['. Print it. Continue printing lines until the next '## [' is encountered, then quit.
sed -n '/^## \[/{p; :a; n; /^## \[/q; p; ba;}' CHANGELOG.md > "$OUTPUT_FILE"

echo "Changelog for v$VERSION generated at $OUTPUT_FILE"
