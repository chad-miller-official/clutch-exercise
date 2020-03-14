#!/bin/bash

PROJECT_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)/.."

npx babel \
    --watch "$PROJECT_ROOT_DIR/app/assets/javascripts" \
    --out-dir "$PROJECT_ROOT_DIR/public/javascripts" \
    --presets react-app/prod
