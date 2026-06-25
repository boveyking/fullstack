import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# 配置
SMTP_SERVER = "smtp.feishu.cn"
SMTP_PORT = 465  # SSL
SENDER_EMAIL = "no_reply@familys.ai"
SENDER_PASSWORD = "Q8wUU31NitYlri9z"  # ⚠️ 不是登录密码！
def send_email(to_email: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))
    try:
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True             
    except Exception as e:
        logging.error(f"Error sending email to {to_email}: {e}")
        return False
    
if __name__ == "__main__":
    import sys

    """  if len(sys.argv) < 4:
        print("Usage: python feishu_email.py <to_email> <subject> <body>")
        sys.exit(1)

    to_email = sys.argv[1]
    subject = sys.argv[2]
    body = sys.argv[3] """

    to_email = "boveyking@outlook.com"
    subject = "Test Email"
    body = "This is a test email sending from  Familys backend"
    success = send_email(to_email, subject, body)
    if success:
        print(f"Email successfully sent to {to_email}")
    else:
        print(f"Failed to send email to {to_email}")
