#!/bin/bash

REPO="/Users/niallbell/Library/Mobile Documents/iCloud~md~obsidian/Documents/Niall's Cave v2"

cd "$REPO" || { echo "Could not find repo directory"; read -p "Press Enter to close..."; exit 1; }

git add -A

if git diff --cached --quiet; then
  echo "Nothing to commit."
  read -p "Press Enter to close..."
  exit 0
fi

git commit -m "Updated Website Content"

git push

echo ""
echo "Done! Committed and pushed successfully."
read -p "Press Enter to close..."
