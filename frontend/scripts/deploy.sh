#!/usr/bin/env bash
# Build the Expo web PWA and deploy it to the EC2 box over rsync.
# Usage: ./scripts/deploy.sh
set -euo pipefail

HOST=ubuntu@18.225.181.125
REMOTE=/home/ubuntu/liaison/frontend-web

cd "$(dirname "$0")/.."

# Expo/Metro export needs Node 20+ (Node 18 lacks Array.prototype.toReversed).
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 20

rm -rf dist
npm run build:web
rsync -az --delete dist/ "$HOST:$REMOTE/"

echo "Deploy OK -> http://18.225.181.125/"
