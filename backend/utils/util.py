import os
import random
 
import mailtrap as mt
import time
import re
import json
import logging
 
import shortuuid
import uuid

prod_url="http://v.w.1717001.xyz"
uid = uuid.uuid4().hex[:10]
 
def short_uid():


    return uuid.uuid4().hex[:10]
   
	
import requests
 
#glbal tmp_files
tmp_files=[]

 
email_token="0711dd477c989432dcf8c90f762936ea"
 

#mailtrap user email youxueusa@gmail.com
sender_email="no_reply@sparbot.ai"
email_verification_template="""
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
            color: black !important;
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
                color:black;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://sparbot.ai/assets/practice.png" alt="Sparbot Logo" class="logo">
            <h1>Verify your VPN Account</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello {username}! 👋
            </div>
            
            <div class="message">
                Thank you for joining us! To complete your registration and secure your account, 
                please verify your email address by clicking the button below.
            </div>
            
            <a href="{domain}/verify_user/{link}" class="verify-button">
                Verify My Email Address
            </a>
            
            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                    <a href="{domain}/verify_user/{link}">{domain}/verify_user/{link}</a>
            </div>
            
            <div class="security-note">
                <p><strong>Security Note:</strong> This verification link will expire in 24 hours for your security. 
                If you didn't create an account with Sparbot, please ignore this email.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>VPN Team</strong></p>
            <p>VPN Service</p>
            <p>© 2025 VPN. All rights reserved.</p>
           </div>
    </div>
</body>
</html>
"""

reset_password_template="""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Sparbot</title>
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
            background: linear-gradient(135deg, #4dabf7 0%, #4daba3 100%);
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
        .reset-button {{
            display: inline-block;
            background: linear-gradient(135deg, #4dabf7 0%, #4daba7 100%);
            color: black;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(77, 171, 247, 0.4);
        }}
        .reset-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(77, 171, 247, 0.6);
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
            color: #4dabf7;
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
        .warning-note {{
            margin-top: 20px;
            padding: 15px;
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            border-radius: 4px;
            text-align: left;
        }}
        .warning-note p {{
            color: #721c24;
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
            .reset-button {{
                padding: 12px 30px;
                font-size: 14px;
                color:black;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://sparbot.ai/assets/practice.png" alt="Sparbot Logo" class="logo">
            <h1>Reset Your Password</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello {username}! 🔒
            </div>
            
            <div class="message">
                We received a request to reset your password for your Sparbot account. 
                Click the button below to create a new password and regain access to your account.
            </div>
            
            <a href="{domain}/reset_password/{link}" class="reset-button">
                Reset My Password
            </a>
            
            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="{domain}/reset_password/{link}">{domain}/reset_password/{link}</a>
            </div>
            
            <div class="security-note">
                <p><strong>Security Note:</strong> This password reset link will expire in 1 hour for your security. 
                After clicking the link, you'll be prompted to create a new password.</p>
            </div>
            
            <div class="warning-note">
                <p><strong>Important:</strong> If you didn't request this password reset, please ignore this email 
                and consider changing your password immediately. Your account security is important to us.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>VPN Team</strong></p>
            <p>VPN Service</p>
            <p>© 2025 VPN. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

accounting_receipt_template="""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - Sparbot</title>
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
        }}
        .greeting {{
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
            text-align: center;
        }}
        .message {{
            font-size: 16px;
            color: #666666;
            margin-bottom: 30px;
            line-height: 1.8;
            text-align: center;
        }}
        .receipt-details {{
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }}
        .receipt-header {{
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #28a745;
        }}
        .receipt-header h2 {{
            color: #28a745;
            font-size: 22px;
            margin: 0;
            font-weight: 600;
        }}
        .receipt-row {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #dee2e6;
        }}
        .receipt-row:last-child {{
            border-bottom: none;
            font-weight: 600;
            font-size: 18px;
            color: #28a745;
            margin-top: 10px;
            padding-top: 20px;
            border-top: 2px solid #28a745;
        }}
        .receipt-label {{
            font-weight: 600;
            color: #495057;
            flex: 1;
        }}
        .receipt-value {{
            color: #212529;
            text-align: right;
            flex: 1;
        }}
        .plan-description {{
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 4px solid #28a745;
        }}
        .plan-description h4 {{
            margin: 0 0 8px 0;
            color: #155724;
            font-size: 16px;
        }}
        .plan-description p {{
            margin: 0;
            color: #155724;
            font-size: 14px;
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
        .support-note {{
            margin-top: 30px;
            padding: 15px;
            background-color: #d1ecf1;
            border-left: 4px solid #17a2b8;
            border-radius: 4px;
            text-align: left;
        }}
        .support-note p {{
            color: #0c5460;
            font-size: 14px;
            margin: 0;
        }}
        .download-section {{
            text-align: center;
            margin-top: 25px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }}
        .download-button {{
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: black !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
        }}
        .download-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6);
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
            .receipt-details {{
                padding: 20px 15px;
            }}
            .receipt-row {{
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }}
            .receipt-value {{
                text-align: left;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://sparbot.ai/assets/practice.png" alt="Sparbot Logo" class="logo">
            <h1>Payment Receipt</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Thank you for your payment! 💳
            </div>
            
            <div class="message">
                Your payment has been successfully processed. Below are the details of your transaction 
                for your records.
            </div>
            
            <div class="receipt-details">
                <div class="receipt-header">
                    <h2>Receipt Details</h2>
                </div>
                
                <div class="receipt-row">
                    <div class="receipt-label">Receipt #:</div>
                    <div class="receipt-value">{receipt_number}</div>
                </div>
                
                <div class="receipt-row">
                    <div class="receipt-label">Date:</div>
                    <div class="receipt-value">{date}</div>
                </div>
                
                <div class="receipt-row">
                    <div class="receipt-label">Vendor:</div>
                    <div class="receipt-value">{vendor}</div>
                </div>
                
                <div class="plan-description">
                    <h4>Plan Details</h4>
                    <p>{plan_description}</p>
                </div>
                
                <div class="receipt-row">
                    <div class="receipt-label">Total Amount:</div>
                    <div class="receipt-value">{amount}</div>
                </div>
            </div>
            
            <div class="download-section">
                <p style="color: #666666; font-size: 14px; margin-bottom: 15px;">
                    Need a PDF copy for your records?
                </p>
                <a href="{domain}/download-receipt?receipt={receipt_number}" class="download-button">
                    Download PDF Receipt
                </a>
            </div>
            
            <div class="support-note">
                <p><strong>Questions about your payment?</strong> Our support team is here to help! 
                Contact us with your receipt number for quick assistance. Keep this receipt for your records.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Sparbot Team</strong></p>
            <p>AI-Powered Debate Platform</p>
            <p>© 2025 Sparbot. All rights reserved.</p>
            <p style="font-size: 12px; color: #aaa;">
                This is an automated receipt. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
"""
 

 

   
#export DASHSCOPE_API_KEY=YOUR_DASHSCOPE_API_KEY  qwen key must exported to enviroment    
def replace_bullets(txt:str):
        
        pattern = r"\([A-Z]?\)|\(\d+\)|\[\d+\]"
        return re.sub(pattern,"",   txt) 
def normalize_text(text: str):
    result=replace_refs(text)   
    result=replace_url(result)
    result=replace_src(result) 
    result=replace_single_letter(result) 
    result=replace_author(result) 
    result=replace_year(result) 
    result=replace_bullets(result) 

    result=result.replace('et al.','').replace('"','') .replace('by Source','').\
    replace('by Source:','').replace('by source:','').replace('by Source:','').\
    replace('.  :','.').replace('.  by','by').\
    replace("Part 1:","\nPart 1:") 
    return result
 
 
async def fetch_all_by_keywords_retry(text: str ):    
     
   
        count=3
        while count>0:
            result=  await fetch_all_by_keywords(text  ) 
            if result is None:
              count-=1
            else:   
               break
        return result  
   
def replace_year(txt):
        pattern=r"\(\d{4}\)"
        result = re.sub(pattern, lambda x: " in "+x.group(0).strip('(').strip(')'),   txt)
        return result
def replace_refs(txt):
        
        pattern_ref = r"References:.*?$"

        
        return re.sub(pattern_ref, '',   txt,flags=re.DOTALL)
    
def replace_author(txt):
        pattern_author =  r"\([^)]*\s*,\s*\d{4}\)"
        
        result = re.sub(pattern_author, lambda x: " by "+x.group(0).replace(',','').strip('(').strip(')'),   txt)
        return result
def replace_single_letter(txt):
        pattern = r"[A-Z]\."        
        result = re.sub(pattern, '',   txt)
        
        pattern = r'^\d+\.' 
        result= re.sub(pattern, '--',   result)   
            
        pattern = r'\d+\(\d+\),\s\d+-\d+'
        return re.sub(pattern, '',   result)

def replace_src(txt):
        pattern_author =  r"\(Source:.*?\)"
        
        result = re.sub(pattern_author, lambda x: " by "+x.group(0).replace(',','').strip('(').strip(')'),   txt)
        return result
def replace_url(txt):
        
        pattern_url = r"Retrieved from.*?http.*?[>\s]"
        result=  re.sub(pattern_url, '',   txt)
        pattern_url =  r"<?http.*?[>\s]"
        result=re.sub(pattern_url, '',   result)
        return result

def send_verification_email(email_to:str, to_name:str, message:str):
        try:
                dev_mode=os.getenv("dev_mode") 
                domain="http://localhost:3000" if dev_mode=='yes' else prod_url
                holder={
                        "username":to_name,
                        "link":  message    ,          
                        "domain":  domain    ,          

                        "message":message,
                }
                content=email_verification_template.format(**holder)
                mail = mt.Mail(
                        sender=mt.Address(email=sender_email, name="VPN Team"),
                        to=[mt.Address(email=email_to, name=to_name)],
                        subject="(VPN Account) Please verify your email",
                        html= content,
                )
                client = mt.MailtrapClient(token=email_token)
                client.send(mail)
                print(f"Email sent to {email_to}")
        except Exception as e: 
                logging.error(f"Error sending email to {email_to}: {e}")

def send_reset_password_email(email_to:str, to_name:str, reset_token:str):
        try:
                dev_mode=os.getenv("dev_mode") 
                domain="http://localhost:3000" if dev_mode=='yes' else prod_url
                holder={
                        "username":to_name,
                        "link":  reset_token,          
                        "domain":  domain,          
                        "message":reset_token,
                }
                content=reset_password_template.format(**holder)
                mail = mt.Mail(
                        sender=mt.Address(email=sender_email, name="VPN Team"),
                        to=[mt.Address(email=email_to, name=to_name)],
                        subject="(VPN Account) Reset Your Password",
                        html= content,
                )
                client = mt.MailtrapClient(token=email_token)
                client.send(mail)
        except Exception as e: 
                logging.error(f"Error sending password reset email to {email_to}: {e}")

def send_accounting_receipt_email(email_to: str, to_name: str, receipt_number: str, date: str, vendor: str, amount: str, plan_description: str):
        """
        Send an accounting receipt email to the user
        
        Args:
            email_to: Recipient email address
            to_name: Recipient name  
            receipt_number: Unique receipt identifier
            date: Payment date
            vendor: Vendor/company name
            amount: Payment amount (formatted with currency)
            plan_description: Description of the plan/service purchased
        """
        try:
                dev_mode=os.getenv("dev_mode") 
                domain="http://localhost:3000" if dev_mode=='yes' else prod_url
                holder={
                        "receipt_number": receipt_number,
                        "date": date,
                        "vendor": vendor,
                        "amount": amount,
                        "plan_description": plan_description,
                        "domain": domain,
                }
                content=accounting_receipt_template.format(**holder)
                mail = mt.Mail(
                        sender=mt.Address(email=sender_email, name="VPN Team"),
                        to=[mt.Address(email=email_to, name=to_name)],
                        subject=f"(VPN Account) Payment Receipt #{receipt_number}",
                        html= content,
                )
                client = mt.MailtrapClient(token=email_token)
                client.send(mail)
                print(f"(VPN Account) Receipt email sent to {email_to} for receipt #{receipt_number}")
        except Exception as e: 
                logging.error(f"(VPN Account) Error sending receipt email to {email_to}: {e}")

def main():
    import uuid
    print("Generated short UID:", short_uid())
    print("Generated short UID:", short_uid())
    print("Generated short UID:", short_uid())
    #short_id = uuid.uuid4().hex[:8] 
    print(f"Generated short ID: {uuid.uuid4().hex[:10]}")
    print(f"Generated short ID: {uuid.uuid4().hex[:10]}")
    print(f"Generated short ID: {uuid.uuid4().hex[:10]}")
    print(f"Generated short ID: {uuid.uuid4().hex[:10]}")
 

  

if __name__ == "__main__":
    main()