#!/bin/bash
set -euo pipefail

# === Server Configuration ===
SSH_HOST="UPDATE_THIS_WITH_REAL_PWD"
SSH_USER="dev"
APP="vpn"
SSH_PASS="UPDATE_THIS_WITH_REAL_PWD"
REMOTE_VPN_DIR="/home/${SSH_USER}/${APP}"
REMOTE_WEB_DIR="/var/www/${APP}"

# === SSH helper functions ===
USE_SSHPASS=""

remote_ssh() {
    if [[ -n "$USE_SSHPASS" ]]; then
        sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$@"
    else
        ssh "$SSH_USER@$SSH_HOST" "$@"
    fi
}

remote_scp() {
    if [[ -n "$USE_SSHPASS" ]]; then
        sshpass -p "$SSH_PASS" scp -o StrictHostKeyChecking=no "$@"
    else
        scp "$@"
    fi
}

# === Detect SSH connection method ===
if ssh -o BatchMode=yes -o ConnectTimeout=5 "$SSH_USER@$SSH_HOST" true 2>/dev/null; then
    echo "Using SSH key-based authentication."
elif command -v sshpass &>/dev/null; then
    USE_SSHPASS=1
    echo "Using password-based authentication via sshpass."
else
    echo "ERROR: Cannot connect via SSH key and sshpass is not installed."
    echo "Install sshpass: sudo apt install sshpass"
    echo "Or set up SSH keys: ssh-copy-id ${SSH_USER}@${SSH_HOST}"
    exit 1
fi

# 1. Extract TARGET_DIR from bat.sh dynamically
TARGET_DIR=$(grep '^TARGET_DIR=' bat.sh | head -1 | cut -d'=' -f2- | tr -d '"')

if [[ -z "$TARGET_DIR" ]]; then
    echo "ERROR: Could not detect TARGET_DIR from bat.sh"
    exit 1
fi
echo "Detected target dir: $TARGET_DIR"

# 2. Run bat.sh and output console result to file ttt
echo "Running bat.sh to copy deployment files..."
bash bat.sh > ttt
cat ttt

# 3. Collect files to upload into a temporary file
echo "Collecting files to upload..."
> upload_list.txt

while IFS= read -r line; do
    # Skip empty lines and rsync metadata/summary lines
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^(sending|sent |total ) ]] && continue

    # rsync -v outputs relative file paths; directories end with /
    # Skip directories (ending with /) and non-file entries
    [[ "$line" == */ ]] && continue

    # Verify it's an actual file in the target directory
    if [[ -f "${TARGET_DIR}/${line}" ]]; then
        echo "$line" >> upload_list.txt
    fi
done < ttt

# 4. Process the collected files
echo "Processing collected files for upload..."
while IFS= read -r src_file; do
    [[ -z "$src_file" ]] && continue

    echo "Processing ${src_file}..."

    # Create remote directory structure first
    remote_ssh "mkdir -p '${REMOTE_VPN_DIR}/$(dirname "${src_file}")'"

    # Upload file via SCP
    echo "Uploading ${src_file} to ${REMOTE_VPN_DIR}/${src_file}..."
    remote_scp "${TARGET_DIR}/${src_file}" "${SSH_USER}@${SSH_HOST}:${REMOTE_VPN_DIR}/${src_file}"

done < upload_list.txt

# 5. Clean up temporary file
rm -f upload_list.txt

echo ""
echo "Checking if files were uploaded..."
remote_ssh "ls -la ${REMOTE_VPN_DIR}"

echo ""
echo "Copying remote folder tree ${REMOTE_VPN_DIR}/ to ${REMOTE_WEB_DIR}/..."
remote_ssh "sudo cp -rf ${REMOTE_VPN_DIR}/* ${REMOTE_WEB_DIR}/ 2>/dev/null || echo 'No files to copy or copy failed'"
remote_ssh "sudo rm -rf ${REMOTE_VPN_DIR}/* 2>/dev/null || echo 'No files to clean up'"

RUN_DEPLOY=0
if [[ "${1:-}" == "deploy" ]]; then
    RUN_DEPLOY=1
fi

if [[ "$RUN_DEPLOY" == "1" ]]; then
    echo ""
    echo "Running deploy.sh in ${REMOTE_WEB_DIR}..."
    remote_ssh "cd ${REMOTE_WEB_DIR} && sudo bash deploy.sh"
fi