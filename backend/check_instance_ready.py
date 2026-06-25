#!/usr/bin/env python3
"""
Quick check if EC2 instance is ready for SSH connections
"""
import boto3
import sys
import time

def check_instance_ready(instance_id, region):
    """Check if instance is fully ready for SSH"""
    
    ec2 = boto3.client('ec2', region_name=region)
    ec2_resource = boto3.resource('ec2', region_name=region)
    
    print(f"\nChecking instance {instance_id} in {region}...")
    print("=" * 60)
    
    instance = ec2_resource.Instance(instance_id)
    instance.reload()
    
    # 1. Check instance state
    state = instance.state['Name']
    print(f"1. Instance State: {state}")
    if state != 'running':
        print("   ❌ Instance is not running!")
        return False
    print("   ✅ Instance is running")
    
    # 2. Check status checks
    print("\n2. Status Checks:")
    status_response = ec2.describe_instance_status(InstanceIds=[instance_id])
    
    if not status_response['InstanceStatuses']:
        print("   ⏳ Status checks not available yet (instance still initializing)")
        print("   💡 Wait 2-3 more minutes and try again")
        return False
    
    status = status_response['InstanceStatuses'][0]
    system_status = status.get('SystemStatus', {}).get('Status', 'unknown')
    instance_status = status.get('InstanceStatus', {}).get('Status', 'unknown')
    
    print(f"   System Status: {system_status}")
    print(f"   Instance Status: {instance_status}")
    
    if system_status != 'ok':
        print("   ❌ System status check not passing")
        return False
    if instance_status != 'ok':
        print("   ❌ Instance status check not passing")
        return False
    
    print("   ✅ Both status checks passing")
    
    # 3. Check network
    print("\n3. Network Configuration:")
    print(f"   Public IP: {instance.public_ip_address}")
    print(f"   Private IP: {instance.private_ip_address}")
    
    if not instance.public_ip_address:
        print("   ❌ No public IP assigned!")
        return False
    print("   ✅ Public IP assigned")
    
    # 4. Check security group for SSH
    print("\n4. Security Group (SSH Port 22):")
    ssh_allowed = False
    for sg in instance.security_groups:
        sg_id = sg['GroupId']
        sg_details = ec2.describe_security_groups(GroupIds=[sg_id])
        
        for rule in sg_details['SecurityGroups'][0].get('IpPermissions', []):
            if rule.get('FromPort') == 22 and rule.get('ToPort') == 22:
                ssh_allowed = True
                print(f"   ✅ SSH port 22 is open in {sg['GroupName']}")
                break
    
    if not ssh_allowed:
        print("   ❌ SSH port 22 is NOT open!")
        return False
    
    # 5. Check key pair
    print("\n5. Key Pair:")
    if instance.key_name:
        print(f"   ✅ Key pair: {instance.key_name}")
    else:
        print("   ❌ No key pair assigned!")
        return False
    
    # 6. Check console output for SSH readiness
    print("\n6. SSH Service Status (from console log):")
    try:
        console = ec2.get_console_output(InstanceId=instance_id)
        if 'Output' in console:
            output = console['Output']
            
            # Look for SSH-related messages
            ssh_indicators = [
                'Started OpenBSD Secure Shell server',
                'sshd',
                'SSH',
                'cloud-init.*finished'
            ]
            
            found_ssh = False
            for indicator in ssh_indicators:
                if indicator.lower() in output.lower():
                    found_ssh = True
                    break
            
            if found_ssh:
                print("   ✅ SSH service appears to be running")
            else:
                print("   ⏳ SSH service may still be starting")
                print("   💡 Check console output manually if issue persists")
            
            # Check if cloud-init is complete
            if 'Cloud-init.*finished' in output or 'cloud-init.*done' in output.lower():
                print("   ✅ Cloud-init completed")
            else:
                print("   ⏳ Cloud-init may still be running")
        else:
            print("   ⏳ Console output not available yet")
    except Exception as e:
        print(f"   ⚠️  Could not check console: {e}")
    
    print("\n" + "=" * 60)
    print("RESULT: Instance appears READY for SSH connections")
    print("=" * 60)
    
    print(f"\nTry connecting with:")
    print(f"ssh -i unionX.pem ubuntu@{instance.public_ip_address}")
    print(f"\nOr use EC2 Instance Connect in AWS Console")
    
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python check_instance_ready.py <instance-id> <region>")
        print("Example: python check_instance_ready.py i-0123456789 ap-northeast-2")
        sys.exit(1)
    
    instance_id = sys.argv[1]
    region = sys.argv[2]
    
    ready = check_instance_ready(instance_id, region)
    
    if not ready:
        print("\n⏳ Instance is NOT ready yet. Please wait a few minutes.")
        sys.exit(1)
    else:
        print("\n✅ Instance should be ready for SSH connections!")
        sys.exit(0)

