import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app_pwd = os.environ.get("google_app_pwd")
sender = os.environ.get("from_email")

if not app_pwd or not sender:
    raise EnvironmentError(
        "Missing required environment variables: 'google_app_pwd' and/or 'from_email'. "
        "Set them in backend/.env (development) or via docker-compose environment section (production)."
    )
def send_email(to, subject, body):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender, app_pwd)
        server.send_message(msg)

send_email("boveyking@outlook.com", "Hello 2!", "This is a test email.")