 
import time
import re
import json
import os
import sys
import logging

email_token="0711dd477c989432dcf8c90f762936ea"
from utils.feishu_email import send_email
 
sender_email="no_reply@familys.ai"
accept_invitation_template="""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Sparbot</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
        }}
        .logo {{
            max-width: 120px;
            height: auto;
            margin-bottom: 10px;
        }}
        .header h1 {{
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }}
        .content {{
            padding: 40px 30px;
            text-align: center;
        }}
        .greeting {{
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }}
        .message {{
            font-size: 16px;
            color: #666666;
            margin-bottom: 30px;
            line-height: 1.8;
        }}
        .verify-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #000000;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }}
        .verify-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }}
        .alternative-link {{
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }}
        .alternative-link p {{
            color: #666666;
            font-size: 14px;
            margin-bottom: 10px;
        }}
        .alternative-link a {{
            color: #667eea;
            word-break: break-all;
            text-decoration: none;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            color: #999999;
            font-size: 14px;
            margin: 5px 0;
        }}
        .security-note {{
            margin-top: 20px;
            padding: 15px;
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
            text-align: left;
        }}
        .security-note p {{
            color: #856404;
            font-size: 14px;
            margin: 0;
        }}
        @media only screen and (max-width: 600px) {{
            .container {{
                margin: 10px;
                border-radius: 5px;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .header {{
                padding: 20px 15px;
            }}
            .verify-button {{
                padding: 12px 30px;
                font-size: 14px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
       
        
        <div class="content">
            <div class="greeting">
                Hello {username}! 👋
            </div>
            
            <div class="message">
                You are invited to join  FAMILyS! To complete your registration and secure your account, 
                please accept the invitation by clicking the button below.
            </div>
            
            <a href="{domain}/register/{link}" class="verify-button">
                Accept FAMILyS Invitation
            </a>
            
            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="{domain}/register/{link}">{domain}/register/{link}</a>
            </div>
            
            <div class="security-note">
                <p><strong>Security Note:</strong> This verification link will expire in 24 hours for your security. 
                If you didn't create an account with FAMILyS, please ignore this email.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>FAMILyS Team</strong></p>
            <p>Family Alliance for Multi-generational International Legacy and Sustainability</p>
            <p>© 2025 FAMILyS. All rights reserved.</p>
           </div>
    </div>
</body>
</html>
"""
email_activation_template="""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Sparbot</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
        }}
        .logo {{
            max-width: 120px;
            height: auto;
            margin-bottom: 10px;
        }}
        .header h1 {{
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }}
        .content {{
            padding: 40px 30px;
            text-align: center;
        }}
        .greeting {{
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }}
        .message {{
            font-size: 16px;
            color: #666666;
            margin-bottom: 30px;
            line-height: 1.8;
        }}
        .verify-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #000000;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }}
        .verify-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }}
        .alternative-link {{
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }}
        .alternative-link p {{
            color: #666666;
            font-size: 14px;
            margin-bottom: 10px;
        }}
        .alternative-link a {{
            color: #667eea;
            word-break: break-all;
            text-decoration: none;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            color: #999999;
            font-size: 14px;
            margin: 5px 0;
        }}
        .security-note {{
            margin-top: 20px;
            padding: 15px;
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
            text-align: left;
        }}
        .security-note p {{
            color: #856404;
            font-size: 14px;
            margin: 0;
        }}
        @media only screen and (max-width: 600px) {{
            .container {{
                margin: 10px;
                border-radius: 5px;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .header {{
                padding: 20px 15px;
            }}
            .verify-button {{
                padding: 12px 30px;
                font-size: 14px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
       
        
        <div class="content">
            <div class="greeting">
                Hello {username}! 👋
            </div>
            
            <div class="message">
                Good news! Your FAMILyS account for {organization} has been activated. You can now login and start using your account.
            </div>
            
            <a href="{domain}/login" class="verify-button">
                Login to FAMILyS
            </a>
            
            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="{domain}/login">{domain}/login</a>
            </div>
            
            <div class="security-note">
                <p><strong>Security Note:</strong> This verification link will expire in 24 hours for your security. 
                If you didn't create an account with FAMILyS, please ignore this email.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>FAMILyS Team</strong></p>
            <p>Family Alliance for Multi-generational International Legacy and Sustainability</p>
            <p>© 2025 FAMILyS. All rights reserved.</p>
           </div>
    </div>
</body>
</html>
"""
email_reset_password_template="""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - FAMILyS</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
        }}
        .logo {{
            max-width: 120px;
            height: auto;
            margin-bottom: 10px;
        }}
        .header h1 {{
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }}
        .content {{
            padding: 40px 30px;
            text-align: center;
        }}
        .greeting {{
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }}
        .message {{
            font-size: 16px;
            color: #666666;
            margin-bottom: 30px;
            line-height: 1.8;
        }}
        .verify-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #000000;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }}
        .verify-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }}
        .alternative-link {{
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }}
        .alternative-link p {{
            color: #666666;
            font-size: 14px;
            margin-bottom: 10px;
        }}
        .alternative-link a {{
            color: #667eea;
            word-break: break-all;
            text-decoration: none;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            color: #999999;
            font-size: 14px;
            margin: 5px 0;
        }}
        .security-note {{
            margin-top: 20px;
            padding: 15px;
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
            text-align: left;
        }}
        .security-note p {{
            color: #856404;
            font-size: 14px;
            margin: 0;
        }}
        @media only screen and (max-width: 600px) {{
            .container {{
                margin: 10px;
                border-radius: 5px;
            }}
            .content {{
                padding: 30px 20px;
            }}
            .header {{
                padding: 20px 15px;
            }}
            .verify-button {{
                padding: 12px 30px;
                font-size: 14px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
       
        
        <div class="content">
          
            
            <div class="message">
                 If you did not request a password reset, please ignore this email. If you did, please click the button below to reset your password.
            </div>
            
            <a href="{domain}/reset-password/{token}" class="verify-button">
                Reset Password
            </a>
            
                <div class="alternative-link">
                    <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                    <a href="{domain}/reset-password/{token}">{domain}/reset-password/{token}</a>
                </div>
            
            <div class="security-note">
                <p><strong>Security Note:</strong> This verification link will expire in 24 hours for your security. 
                If you didn't create an account with FAMILyS, please ignore this email.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>FAMILyS Team</strong></p>
            <p>Family Alliance for Multi-generational International Legacy and Sustainability</p>
            <p>© 2025 FAMILyS. All rights reserved.</p>
           </div>
    </div>
</body>
</html>
"""
def send_activation_email(email_to:str, to_name:str,  organization:str):
        try:
                # Debug: Get raw value first
                dev_mode_raw = os.getenv("dev_mode")
                print(f"[DEBUG send_activation_email] dev_mode raw: {repr(dev_mode_raw)}")
                
                dev_mode = (dev_mode_raw or "").lower().strip()
                print(f"[DEBUG send_activation_email] dev_mode processed: {repr(dev_mode)}")
                
                domain = "http://localhost:3000" if dev_mode == 'yes' else "https://familys.ai"
                print(f"[DEBUG send_activation_email] Selected domain: {domain}")
                
                holder={
                        "username":to_name,
                                 
                        "domain":  domain    ,          

                       
                        "organization":organization,
                }
                content=email_activation_template.format(**holder)
               
                send_email(email_to, "Your FAMILyS account has been activated", content)
                print(f"Email sent to {email_to}")
        except Exception as e: 
                logging.error(f"Error sending email to {email_to}: {e}")
def send_invitation_email(email_to:str, to_name:str, message:str):
        try:
                # Force stderr output immediately
                sys.stderr.write("=" * 60 + "\n")
                sys.stderr.write("[DEBUG send_invitation_email] Starting email send\n")
                sys.stderr.flush()
                
                # Debug: Check all environment variables containing 'dev'
                dev_env_vars = {k: v for k, v in os.environ.items() if 'dev' in k.lower()}
                sys.stderr.write(f"[DEBUG] All env vars with 'dev': {dev_env_vars}\n")
                sys.stderr.flush()
                
                # Debug: Get raw value first
                dev_mode_raw = os.getenv("dev_mode")
                sys.stderr.write(f"[DEBUG] dev_mode raw value: {repr(dev_mode_raw)}\n")
                sys.stderr.flush()
                
                dev_mode = (dev_mode_raw or "").lower().strip()
                sys.stderr.write(f"[DEBUG] dev_mode processed: {repr(dev_mode)}\n")
                sys.stderr.flush()
                
                # EXPLICIT PRODUCTION MODE - only use localhost if dev_mode is exactly 'yes'
                # In production, dev_mode should be None or not set, so this will use production domain
                if dev_mode == 'yes':
                    domain = "http://localhost:3000"
                    sys.stderr.write(f"[DEBUG] Using LOCALHOST (dev_mode='yes')\n")
                else:
                    # PRODUCTION MODE - dev_mode is None, empty, or anything other than 'yes'
                    domain = "https://familys.ai"
                    sys.stderr.write(f"[DEBUG] Using PRODUCTION domain (dev_mode={repr(dev_mode)})\n")
                
                sys.stderr.flush()
                sys.stderr.write(f"[DEBUG] Final domain: {domain}\n")
                sys.stderr.flush()
                
                logging.info(f"dev_mode: {dev_mode} domain: {domain}")
                
                holder={
                        "username":to_name,
                        "link":  message    ,          
                        "domain":  domain    ,          

                        "message":message,
                }
                #content=accept_invitation_template.format(**holder)
                content=f"""
                <p>Hello {to_name}! 👋</p>
                 <p>You are invited to join FAMILyS. Please accept the invitation to join FAMILyS</p>
                 <a href="{domain}/register/{message}">Accept FAMILyS Invitation</a>
                
                """ 

                #send_email(email_to, "FAMILyS Invitation", content)   
                send_email(email_to, "You are invited to join FAMILyS", content)   
                sys.stderr.write(f"[DEBUG] Email sent to {email_to} with domain: {domain}\n")
                sys.stderr.flush()
                sys.stderr.write("=" * 60 + "\n")
                sys.stderr.flush()
        except Exception as e: 
                sys.stderr.write(f"[ERROR] Exception in send_invitation_email: {e}\n")
                import traceback
                sys.stderr.write(traceback.format_exc() + "\n")
                sys.stderr.flush()
                logging.error(f"Error sending email to {email_to}: {e}", exc_info=True)

def send_reset_password_email(email_to:str,   token:str):
        try:
                # Debug: Get raw value first
                dev_mode_raw = os.getenv("dev_mode")
                print(f"[DEBUG send_reset_password_email] dev_mode raw: {repr(dev_mode_raw)}")
                
                dev_mode = (dev_mode_raw or "").lower().strip()
                print(f"[DEBUG send_reset_password_email] dev_mode processed: {repr(dev_mode)}")
                
                domain = "http://localhost:3000" if dev_mode == 'yes' else "https://familys.ai"
                print(f"[DEBUG send_reset_password_email] Selected domain: {domain}")
                
                holder={
                        "token":  token    ,          
                        "domain":  domain    ,          
                }
                content=email_reset_password_template.format(**holder)
 
                send_email(email_to, "Reset Password for FAMILyS", content)   
                print(f"Email sent to {email_to}")
        except Exception as e: 
                logging.error(f"Error sending email to {email_to}: {e}")

