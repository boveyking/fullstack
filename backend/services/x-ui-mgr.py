#!/usr/bin/env python3
import requests
import uuid
import argparse
import socket
import json
import time
from datetime import datetime, timedelta

class XUISession:
    def __init__(self, panel_url, username, password):
        self.panel_url = panel_url.rstrip("/")
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.session_cookie = None
        self.session_expiry = 0  # Unix timestamp

    def _is_session_valid(self):
        return self.session_cookie and time.time() < self.session_expiry

    def _login(self):
        """Login and update session"""
        login_url = f"{self.panel_url}/login"
        payload = {"username": self.username, "password": self.password}
        r = self.session.post(login_url, json=payload, timeout=10)
        r.raise_for_status()
        
        session_cookie = r.cookies.get("session")
        if not session_cookie:
            raise Exception("Login failed: no session cookie received")
        
        # Set 24h expiry (X-UI default)
        self.session_cookie = session_cookie
        self.session_expiry = time.time() + 24 * 3600
        print(f"✅ Logged in to {self.panel_url} | Session valid until {datetime.fromtimestamp(self.session_expiry):%Y-%m-%d %H:%M}")

    def _ensure_login(self):
        """Ensure valid session — re-login if needed"""
        if not self._is_session_valid():
            print("🔁 Session expired or missing — re-authenticating...")
            self._login()

    def _request(self, method, path, **kwargs):
        """Wrapper for authenticated requests with auto-retry"""
        self._ensure_login()
        
        url = f"{self.panel_url}{path}"
        headers = {"Cookie": f"session={self.session_cookie}"}
        if "headers" in kwargs:
            headers.update(kwargs.pop("headers"))
        
        for attempt in range(3):
            try:
                r = self.session.request(method, url, headers=headers, timeout=15, **kwargs)
                
                # Handle session expiration
                if r.status_code == 403 and "login" in r.text.lower():
                    print("⚠️  Session rejected by server — clearing and retrying...")
                    self.session_cookie = None
                    self.session_expiry = 0
                    continue  # retry after re-login
                
                r.raise_for_status()
                return r
            
            except requests.exceptions.RequestException as e:
                if attempt == 2:
                    raise
                print(f"⚠️  Request failed (attempt {attempt+1}/3): {e}")
                time.sleep(1)
        
        raise Exception("Max retries exceeded")

    def create_inbound(self, sni, dest):
        """Create Reality inbound with auto-reauth"""
        # Resolve dest if domain
        if ":" not in dest:
            try:
                ip = socket.gethostbyname(dest)
            except:
                ip = "17.253.126.201"  # fallback Apple IP
            dest = f"{ip}:443"

        # Set SNI-specific config
        if sni == "apple.com":
            server_names = ["www.apple.com", "apple.com"]
            fingerprint = "safari"
            short_id = "a0d1abdf"
        else:
            server_names = [sni]
            fingerprint = "chrome"
            short_id = "a0d1abdf"

        inbound_data = {
            "listen": "",
            "port": 39705,
            "protocol": "vless",
            "settings": json.dumps({"clients": [], "decryption": "none"}),
            "streamSettings": {
                "network": "tcp",
                "security": "reality",
                "realitySettings": {
                    "show": False,
                    "dest": dest,
                    "serverNames": server_names,
                    "shortIds": [short_id],
                    "settings": json.dumps({
                        "fingerprint": fingerprint,
                        "serverName": server_names[0],
                        "shortId": short_id,
                        "spiderX": "/"
                    })
                }
            },
            "sniffing": {"enabled": True, "destOverride": ["http", "tls", "quic"]}
        }

        r = self._request("POST", "/panel/api/inbounds/add", json=inbound_data)
        result = r.json()
        if not result.get("success"):
            raise Exception(f"Inbound creation failed: {result}")
        
        inbound_id = int(result["msg"])
        print(f"✅ Reality inbound created (ID: {inbound_id}, port: 39705)")
        return inbound_id

    def add_user(self, inbound_id, user_name, expiry_days, total_gb, down_mbps):
        """Add user with auto-reauth"""
        total_bytes = int(total_gb * 1024**3)
        down_bytes = int(down_mbps * 1024**2)
        expiry_time = int((datetime.now() + timedelta(days=expiry_days)).timestamp() * 1000)

        user_data = {
            "inbounds": [inbound_id],
            "email": user_name,
            "uuid": str(uuid.uuid4()),
            "flow": "xtls-rprx-vision",
            "enable": True,
            "expiryTime": expiry_time,
            "totalGB": total_bytes,
            "up": 0,
            "down": down_bytes
        }

        r = self._request("POST", "/panel/api/users/add", json=user_data)
        result = r.json()
        if not result.get("success"):
            raise Exception(f"User creation failed: {result}")
        
        print(f"✅ User '{user_name}' added (expires in {expiry_days} days, quota: {total_gb} GB)")
        return user_data["uuid"]

def main():
    parser = argparse.ArgumentParser(description="Create X-UI Reality inbound + user (with auto-reauth)")
    parser.add_argument("--sni", default="apple.com", help="SNI domain (default: apple.com)")
    parser.add_argument("--dest", default="apple.com", help="Dest IP:port or domain")
    parser.add_argument("--x-ui-host", default="127.0.0.1", help="X-UI panel host")
    parser.add_argument("--x-ui-port", type=int, default=22181, help="X-UI panel port")
    parser.add_argument("--user-name", required=True, help="User email/name")
    parser.add_argument("--expiry-time", type=int, default=30, help="Expiry in days")
    parser.add_argument("--total-GB", type=int, default=100, help="Total traffic quota in GB")
    parser.add_argument("--down", type=int, default=100, help="Download limit in MB")
    parser.add_argument("--x-ui-user", required=True, help="X-UI panel username")
    parser.add_argument("--x-ui-pass", required=True, help="X-UI panel password")

    args = parser.parse_args()
    panel_url = f"http://{args.x_ui_host}:{args.x_ui_port}"

    try:
        # Initialize session manager
        xui = XUISession(panel_url, args.x_ui_user, args.x_ui_pass)
        
        # Create inbound
        inbound_id = xui.create_inbound(args.sni, args.dest)
        
        # Add user
        user_uuid = xui.add_user(
            inbound_id=inbound_id,
            user_name=args.user_name,
            expiry_days=args.expiry_time,
            total_gb=args.total_GB,
            down_mbps=args.down
        )
        
        print(f"\n🎉 Success! UUID: {user_uuid[:8]}...")
        print(f"🔗 Subscription URL: {panel_url}/sub/... (check X-UI Users tab)")
        
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        exit(1)

if __name__ == "__main__":
    main()