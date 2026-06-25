# Troubleshooting EC2 SSH Connection Issues

## Quick Diagnosis

Run the troubleshooting script to check your instance:

```bash
cd backend
python troubleshoot_instance.py <instance-id> <region>
```

Example:
```bash
python troubleshoot_instance.py i-0a1b2c3d4e5f67890 ap-northeast-2
```

## Common Issues and Solutions

### 1. Wrong AMI ID for Region

**Problem**: AMI IDs are region-specific. Using `ami-0aec5ae807cea9ce0` from us-west-2 won't work in ap-northeast-2.

**Solution**: Find the correct Ubuntu AMI for your region:

```python
# In CloudShell or terminal:
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-*-22.04-amd64-server-*" \
  --query 'Images[*].[ImageId,Name,CreationDate]' \
  --output table \
  --region ap-northeast-2
```

Or use AWS Systems Manager Parameter Store:
```python
aws ssm get-parameters \
  --names /aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id \
  --region ap-northeast-2
```

**Common Ubuntu 22.04 AMI IDs by Region:**
- `us-east-1`: ami-0c7217cdde317cfec
- `us-west-2`: ami-03f65b8614a860c29
- `ap-northeast-1` (Tokyo): ami-0d52744d6551d851e
- `ap-northeast-2` (Seoul): ami-0c9c942bd7bf113a2
- `ap-southeast-1` (Singapore): ami-0df7a207adb9748c7
- `eu-west-1` (Ireland): ami-0905a3c97561e0b69

### 2. Missing Key Pair

**Problem**: Key pair `unionX` doesn't exist in the region.

**Solution A - Create the key pair in each region:**
```bash
# Via AWS CLI
aws ec2 create-key-pair \
  --key-name unionX \
  --region ap-northeast-2 \
  --query 'KeyMaterial' \
  --output text > unionX-ap-northeast-2.pem

chmod 400 unionX-ap-northeast-2.pem
```

**Solution B - Use an existing key pair:**
Check available keys:
```python
aws ec2 describe-key-pairs --region ap-northeast-2
```

Then update your database's `tbl_aws_setting` or change `DEFAULT_KEY_PAIR` in `aws_mgr.py`.

### 3. Security Group Missing SSH Port

**Problem**: Port 22 not open in security group.

**Solution**: The latest code now includes port 22. If you have an existing security group:

```bash
# Add SSH rule to existing security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0 \
  --region ap-northeast-2
```

**Better (restrict to your IP):**
```bash
MY_IP=$(curl -s https://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr ${MY_IP}/32 \
  --region ap-northeast-2
```

### 4. Instance Not Fully Initialized

**Problem**: Instance is "running" but SSH not responding.

**Solution**: Wait for status checks to pass (2-5 minutes):

```bash
aws ec2 describe-instance-status \
  --instance-ids i-xxxxxxxxx \
  --region ap-northeast-2
```

Wait until both `SystemStatus` and `InstanceStatus` show `"Status": "ok"`.

### 5. UserData Script Taking Too Long

**Problem**: The X-UI installation script might be blocking SSH access or taking a long time.

**Solution**: Check the system log:

```bash
aws ec2 get-console-output \
  --instance-id i-xxxxxxxxx \
  --region ap-northeast-2 \
  --output text
```

Look for errors or if cloud-init is still running.

## Testing SSH Connection

### From Local Machine:
```bash
# For Ubuntu AMI:
ssh -i unionX.pem ubuntu@<public-ip>

# For Amazon Linux AMI:
ssh -i unionX.pem ec2-user@<public-ip>

# With verbose output for debugging:
ssh -v -i unionX.pem ubuntu@<public-ip>
```

### From AWS CloudShell:
```bash
# Upload your key first
cat > unionX.pem << 'EOF'
<paste your private key here>
EOF

chmod 400 unionX.pem
ssh -i unionX.pem ubuntu@<public-ip>
```

## Updating AMI ID in Database

If you need to update the AMI ID for your region:

```sql
-- In your database:
UPDATE tbl_aws_setting 
SET ami_id = 'ami-0c9c942bd7bf113a2'  -- Seoul Ubuntu 22.04
WHERE region = 'ap-northeast-2';
```

Or via Python:
```python
from database import get_db
from models import crud

db = next(get_db())
setting = crud.get_setting_by_region(db, 'ap-northeast-2')
if setting:
    setting.ami_id = 'ami-0c9c942bd7bf113a2'
    db.commit()
```

## EC2 Instance Connect Requirements

For EC2 Instance Connect to work, you need:

1. ✅ Port 22 open in security group
2. ✅ Instance in 'running' state with status checks passing
3. ✅ EC2 Instance Connect agent installed (included in Ubuntu 20.04+)
4. ✅ Public IP address assigned
5. ✅ Correct IAM permissions

If EC2 Instance Connect doesn't work but regular SSH does, it might be an IAM permission issue on your AWS account.

## Still Not Working?

Run the troubleshooting script and share the output:
```bash
python troubleshoot_instance.py i-xxxxxxxxx ap-northeast-2 > debug.txt
```

This will show you exactly what's misconfigured.

