#!/usr/bin/env bash
# Export design tokens from designs/DESIGN.md into Tailwind v4 @theme CSS.
# Usage: ./scripts/export-tokens.sh
set -euo pipefail

cd "$(dirname "$0")/.."

npx -y -p @google/design.md designmd lint designs/DESIGN.md
npx -y -p @google/design.md designmd export --format css-tailwind designs/DESIGN.md > src/styles/tokens.css

echo "Exported designs/DESIGN.md -> src/styles/tokens.css"
