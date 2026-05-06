#!/usr/bin/env bash
# generate.sh <slug>
#
# Wrapper that hands a tool spec to Claude Code (in this same repo) for
# end-to-end generation. Run from repo root:
#
#   ./pipeline/scripts/generate.sh my-new-tool
#
# This script just prepares the input — Claude Code itself reads the spec
# and the prompts in pipeline/prompts/ and writes the output files.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <slug>"
  exit 1
fi

SLUG="$1"
SPEC="pipeline/specs/${SLUG}.yaml"

if [[ ! -f "$SPEC" ]]; then
  echo "error: spec not found at $SPEC"
  echo "       copy pipeline/specs/_template.yaml and fill it in first."
  exit 1
fi

cat <<EOF
Spec ready: $SPEC

Run inside Claude Code:

  Read $SPEC, then follow:
    1. pipeline/prompts/01_implement.md
    2. pipeline/prompts/02_seo.md
    3. pipeline/prompts/03_translate.md  (for each locale in spec.locales)

  After all files are written, run:
    cd site && npm run validate && npm run build

EOF
