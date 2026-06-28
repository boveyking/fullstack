#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  dev_setup.sh - Interactive project setup (macOS / Linux).
#  Copies *.dev templates to real files, then replaces
#  #placeholder# values with user input.
# ============================================================

ROOT="$(cd "$(dirname "$0")" && pwd)"

# --- copy <src> <dst> (only if src exists) ---
copydev() {
    if [[ -f "$1" ]]; then
        cp -f "$1" "$2"
        echo "  $(basename "$1") -> $(basename "$2")"
    else
        echo "  SKIP: $(basename "$1") not found"
    fi
}

# --- in-place LITERAL replace (no regex; safe for / & @ $ etc.) ---
replace() {
    local file="$1" old="$2" new="$3"
    local tmp line
    tmp="$(mktemp)"
    while IFS= read -r line || [[ -n "$line" ]]; do
        printf '%s\n' "${line//"$old"/"$new"}"
    done < "$file" > "$tmp"
    mv "$tmp" "$file"
}

echo "=== Copying .dev templates ==="
copydev "${ROOT}/docker-compose.yml.dev"     "${ROOT}/docker-compose.yml"
copydev "${ROOT}/Dockerfile.dev"             "${ROOT}/Dockerfile"
copydev "${ROOT}/deploy.sh.dev"              "${ROOT}/deploy.sh"
copydev "${ROOT}/backend/fullstack.conf.dev" "${ROOT}/backend/fullstack.conf"
copydev "${ROOT}/dcp.bat.dev"                "${ROOT}/dcp.bat"
copydev "${ROOT}/dcp.sh.dev"                 "${ROOT}/dcp.sh"
copydev "${ROOT}/backend/.env.dev"           "${ROOT}/backend/.env"

echo ""
echo "=== Project Setup ==="
read -rp "app_name: "     app_name
read -rp "domain: "       domain
read -rp "unique_port: "  unique_port
read -rp "ssh_ip: "       ssh_ip
read -rp "ssh_user: "     ssh_user
read -rp "ssh_password: " ssh_password

echo ""
echo "Applying values..."

# === docker-compose.yml ===
replace "${ROOT}/docker-compose.yml" "#unique_port#"    "$unique_port"
replace "${ROOT}/docker-compose.yml" "#container_name#" "$app_name"

# === Dockerfile ===
replace "${ROOT}/Dockerfile" "#app_name#" "$app_name"

# === deploy.sh ===
replace "${ROOT}/deploy.sh" "#DB_NAME#" "$app_name"

# === backend/.env ===
replace "${ROOT}/backend/.env" "#app_name#" "$app_name"

# === backend/fullstack.conf ===
replace "${ROOT}/backend/fullstack.conf" "#domain#"      "$domain"
replace "${ROOT}/backend/fullstack.conf" "#unique_port#" "$unique_port"

# === dcp.bat ===
replace "${ROOT}/dcp.bat" "#app_name#"     "$app_name"
replace "${ROOT}/dcp.bat" "#ssh_password#" "$ssh_password"
replace "${ROOT}/dcp.bat" "#ssh_ip#"       "$ssh_ip"
replace "${ROOT}/dcp.bat" "#ssh_user#"     "$ssh_user"

# === dcp.sh ===
replace "${ROOT}/dcp.sh" "#app_name#"     "$app_name"
replace "${ROOT}/dcp.sh" "#ssh_password#" "$ssh_password"
replace "${ROOT}/dcp.sh" "#ssh_ip#"       "$ssh_ip"
replace "${ROOT}/dcp.sh" "#ssh_user#"     "$ssh_user"

# === Copy fullstack.conf -> {app_name}.conf ===
if [[ -f "${ROOT}/backend/fullstack.conf" ]]; then
    cp -f "${ROOT}/backend/fullstack.conf" "${ROOT}/backend/${app_name}.conf"
    echo "Copied backend/fullstack.conf to backend/${app_name}.conf"
fi

echo ""
echo "Setup complete."
