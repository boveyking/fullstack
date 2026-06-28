#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  dev_setup.sh - Interactive project setup (macOS / Linux).
#  Replaces #placeholder# values across config files.
# ============================================================

echo "=== Project Setup ==="
echo ""

read -rp "app_name: "     app_name
read -rp "domain: "       domain
read -rp "unique_port: "  unique_port
read -rp "ssh_ip: "       ssh_ip
read -rp "ssh_user: "     ssh_user
read -rp "ssh_password: " ssh_password

echo ""
echo "Renaming .dev files..."

ROOT="$(cd "$(dirname "$0")" && pwd)"

for f in docker-compose.yml Dockerfile deploy.sh dcp.bat dcp.sh; do
    if [[ -f "${ROOT}/${f}.dev" ]]; then
        mv "${ROOT}/${f}.dev" "${ROOT}/${f}"
        echo "  ${f}.dev -> ${f}"
    fi
done
if [[ -f "${ROOT}/backend/fullstack.conf.dev" ]]; then
    mv "${ROOT}/backend/fullstack.conf.dev" "${ROOT}/backend/fullstack.conf"
    echo "  backend/fullstack.conf.dev -> backend/fullstack.conf"
fi

echo ""
echo "Applying values..."

# --- Helper: in-place replace, macOS (BSD sed) + Linux (GNU sed) compatible ---
replace() {
    local file="$1" old="$2" new="$3"
    # Escape special sed chars in old/new
    local esc_old esc_new
    esc_old="$(printf '%s' "$old" | sed 's/[[\.*^$()+?{|]/\\&/g')"
    esc_new="$(printf '%s' "$new" | sed 's/[&/\]/\\&/g')"
    sed -i.bak "s/${esc_old}/${esc_new}/g" "$file" && rm -f "${file}.bak"
}

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

# === dcp.sh ===
replace "${ROOT}/dcp.sh" "#app_name#"    "$app_name"
replace "${ROOT}/dcp.sh" "#ssh_password#" "$ssh_password"
replace "${ROOT}/dcp.sh" "#ssh_ip#"      "$ssh_ip"
replace "${ROOT}/dcp.sh" "#ssh_user#"    "$ssh_user"

# === dcp.bat (update even on Linux/Mac in case repo is shared) ===
if [[ -f "${ROOT}/dcp.bat" ]]; then
    replace "${ROOT}/dcp.bat" "#app_name#"    "$app_name"
    replace "${ROOT}/dcp.bat" "#ssh_password#" "$ssh_password"
    replace "${ROOT}/dcp.bat" "#ssh_ip#"      "$ssh_ip"
    replace "${ROOT}/dcp.bat" "#ssh_user#"    "$ssh_user"
fi

# === Rename fullstack.conf -> {app_name}.conf ===
if [[ -f "${ROOT}/backend/fullstack.conf" ]]; then
    mv "${ROOT}/backend/fullstack.conf" "${ROOT}/backend/${app_name}.conf"
    echo "Renamed backend/fullstack.conf to backend/${app_name}.conf"
fi

echo ""
echo "Setup complete."
