#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  dcp.sh - Delta deploy to remote server (macOS / Linux).
#
#  Packs changed files (since last deploy) into one tar.gz,
#  uploads it, and extracts remotely with sudo - directory
#  structure preserved automatically.
#
#  Usage:
#    ./dcp.sh            Deploy delta files only
#    ./dcp.sh full       Deploy ALL files (ignore marker)
#    ./dcp.sh deploy     Deploy delta files, then run deploy.sh
#    ./dcp.sh full deploy
# ============================================================

# === Server Configuration ===
SSH_HOST="54.169.214.129"
SSH_USER="dev"
APP="bking"
SSH_PASS="pwd"
REMOTE_WEB_DIR="/var/www/${APP}"
REMOTE_TMP="/home/${SSH_USER}/${APP}_deploy.tar.gz"

ROOT="$(cd "$(dirname "$0")" && pwd)"
ARCHIVE="${ROOT}/deploy.tar.gz"
MARKER="${ROOT}/.dcp_marker"
EXCLUDE="${ROOT}/dc-exclude.txt"

# === Parse args (order-independent: full / deploy) ===
FULL=0
RUN_DEPLOY=0
for arg in "$@"; do
    case "$(echo "$arg" | tr '[:upper:]' '[:lower:]')" in
        full)   FULL=1 ;;
        deploy) RUN_DEPLOY=1 ;;
    esac
done

# === SSH helper (key auth or sshpass) ===
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
    echo "  macOS:  brew install hudochenkov/sshpass/sshpass"
    echo "  Ubuntu: sudo apt install sshpass"
    echo "  Or set up SSH keys: ssh-copy-id ${SSH_USER}@${SSH_HOST}"
    exit 1
fi

# === 1. Pack delta files ===
echo "Detecting delta files..."

# Load exclude substrings (skip comments / blank lines)
PATTERNS=()
if [[ -f "$EXCLUDE" ]]; then
    while IFS= read -r line; do
        line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
        [[ -z "$line" || "$line" == \#* ]] && continue
        PATTERNS+=("$(echo "$line" | tr '\\' '/' | tr '[:upper:]' '[:lower:]')")
    done < "$EXCLUDE"
fi
# Always exclude deploy artifacts
PATTERNS+=("deploy.tar.gz" ".dcp_marker" "filelist.txt")

# Create a temp reference file whose mtime matches the marker timestamp
TMPREF=""
if [[ $FULL -eq 0 && -f "$MARKER" ]]; then
    TMPREF="$(mktemp)"
    STAMP_STR="$(tr -d '\r\n ' < "$MARKER")"
    python3 -c "
import os, datetime
try:
    dt = datetime.datetime.fromisoformat('${STAMP_STR}')
    ts = dt.timestamp()
except Exception:
    ts = 0
os.utime('${TMPREF}', (ts, ts))
"
fi

# Collect delta files into a filelist (one relative path per line)
FILELIST="${ROOT}/filelist.txt"
: > "$FILELIST"

while IFS= read -r -d '' f; do
    rel="${f#${ROOT}/}"
    rl="$(echo "$rel" | tr '[:upper:]' '[:lower:]' | tr '\\' '/')"

    skip=0
    for p in "${PATTERNS[@]}"; do
        if [[ "$rl" == *"$p"* ]]; then skip=1; break; fi
    done
    [[ $skip -eq 1 ]] && continue

    printf '%s\n' "$rel" >> "$FILELIST"
done < <(
    if [[ -n "$TMPREF" ]]; then
        find "$ROOT" -type f -newer "$TMPREF" -print0
    else
        find "$ROOT" -type f -print0
    fi
)

[[ -n "$TMPREF" ]] && rm -f "$TMPREF"

COUNT="$(wc -l < "$FILELIST" | tr -d ' ')"

if [[ "$COUNT" -eq 0 ]]; then
    rm -f "$FILELIST"
    echo "No delta files to deploy."
else
    echo "Packed ${COUNT} file(s) into deploy.tar.gz"

    # === 2. Record timestamp BEFORE upload (so concurrent edits aren't missed) ===
    STAMP="$(python3 -c "from datetime import datetime, timezone; print(datetime.now(timezone.utc).isoformat())")"

    # === Pack ===
    [[ -f "$ARCHIVE" ]] && rm -f "$ARCHIVE"
    tar -czf "$ARCHIVE" -C "$ROOT" -T "$FILELIST"
    rm -f "$FILELIST"

    # === 3. Upload the single archive ===
    echo "Uploading archive..."
    remote_scp "$ARCHIVE" "${SSH_USER}@${SSH_HOST}:${REMOTE_TMP}"
    if [[ $? -ne 0 ]]; then
        echo "ERROR: upload failed."
        exit 1
    fi

    # === 4. Extract remotely (sudo), preserving structure; clean up temp ===
    echo "Extracting on remote..."
    remote_ssh "echo '${SSH_PASS}' | sudo -S mkdir -p '${REMOTE_WEB_DIR}' \
        && echo '${SSH_PASS}' | sudo -S tar -xzf '${REMOTE_TMP}' -C '${REMOTE_WEB_DIR}' \
        && rm -f '${REMOTE_TMP}'"
    if [[ $? -ne 0 ]]; then
        echo "ERROR: remote extract failed. Marker NOT updated."
        exit 1
    fi

    # === 5. Success: advance marker and clean local archive ===
    printf '%s\n' "$STAMP" > "$MARKER"
    rm -f "$ARCHIVE"
    echo "Deploy complete."
fi

# === 6. Optional: run deploy.sh ===
if [[ $RUN_DEPLOY -eq 1 ]]; then
    echo ""
    echo "Running deploy.sh in ${REMOTE_WEB_DIR}..."
    remote_ssh "cd '${REMOTE_WEB_DIR}' && echo '${SSH_PASS}' | sudo -S bash deploy.sh"
fi
