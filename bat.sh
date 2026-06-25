#!/bin/bash
TARGET_DIR="/d/vpn-deployment"
echo "========================================"
echo "Copying deployment files to $TARGET_DIR"
echo "========================================"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy files excluding development/build artifacts
# rsync flags:
#   -a    archive mode (recursive, preserves permissions, timestamps, symlinks, etc.)
#   -v    verbose
#   --delete  remove files from target that no longer exist in source
#   --exclude-from  read exclude patterns from file
rsync -av --delete --exclude-from="dc-exclude-rsync.txt" ./ "$TARGET_DIR/"