#!/usr/bin/env python3
"""
Troubleshoot EC2 Instance SSH Connection Issues
"""
import boto3
import sys

def troubleshoot_instance(instance_id, region):
    """Troubleshoot why an EC2 instance can't be accessed via SSH"""
    
    ec2_client = boto3.client('ec2', region_name=region)
    ec2_resource = boto3.resource('ec2', region_name=region)
    
    print(f"\n{'='*60}")
    print(f"Troubleshooting Instance: {instance_id}")
    print(f"Region: {region}")
    print(f"{'='*60}\n")
    
    try:
        # Get instance details
        instance = ec2_resource.Instance(instance_id)
        
        print("1. INSTANCE STATE")
        print(f"   State: {instance.state['Name']}")
        print(f"   Instance Type: {instance.instance_type}")
        print(f"   Launch Time: {instance.launch_time}")
        print(f"   Public IP: {instance.public_ip_address}")
        print(f"   Private IP: {instance.private_ip_address}")
        
        # Check instance status
        print("\n2. INSTANCE STATUS CHECKS")
        status = ec2_client.describe_instance_status(InstanceIds=[instance_id])
        if status['InstanceStatuses']:
            status_info = status['InstanceStatuses'][0]
            system_status = status_info.get('SystemStatus', {}).get('Status', 'N/A')
            instance_status = status_info.get('InstanceStatus', {}).get('Status', 'N/A')
            print(f"   System Status: {system_status}")
            print(f"   Instance Status: {instance_status}")
            
            if system_status != 'ok' or instance_status != 'ok':
                print("   ⚠️  Instance status checks not passing! Wait a few minutes.")
        else:
            print("   ⚠️  Status checks not available yet. Instance may still be initializing.")
        
        # Check key pair
        print("\n3. KEY PAIR")
        print(f"   Key Name: {instance.key_name}")
        if instance.key_name:
            try:
                key_pairs = ec2_client.describe_key_pairs(KeyNames=[instance.key_name])
                print(f"   ✓ Key pair '{instance.key_name}' exists in region")
            except:
                print(f"   ✗ Key pair '{instance.key_name}' NOT FOUND in region!")
        else:
            print("   ✗ NO KEY PAIR assigned to instance!")
        
        # Check security groups
        print("\n4. SECURITY GROUPS")
        for sg in instance.security_groups:
            sg_id = sg['GroupId']
            sg_name = sg['GroupName']
            print(f"   Security Group: {sg_name} ({sg_id})")
            
            sg_details = ec2_client.describe_security_groups(GroupIds=[sg_id])
            ssh_open = False
            for rule in sg_details['SecurityGroups'][0].get('IpPermissions', []):
                from_port = rule.get('FromPort')
                to_port = rule.get('ToPort')
                if from_port == 22 and to_port == 22:
                    ssh_open = True
                    ipv4_ranges = [r.get('CidrIp') for r in rule.get('IpRanges', [])]
                    ipv6_ranges = [r.get('CidrIpv6') for r in rule.get('Ipv6Ranges', [])]
                    print(f"   ✓ SSH Port 22 is OPEN")
                    if ipv4_ranges:
                        print(f"      IPv4: {', '.join(ipv4_ranges)}")
                    if ipv6_ranges:
                        print(f"      IPv6: {', '.join(ipv6_ranges)}")
            
            if not ssh_open:
                print(f"   ✗ SSH Port 22 is NOT OPEN in {sg_name}!")
        
        # Check AMI
        print("\n5. AMI (IMAGE)")
        print(f"   AMI ID: {instance.image_id}")
        try:
            images = ec2_client.describe_images(ImageIds=[instance.image_id])
            if images['Images']:
                ami = images['Images'][0]
                print(f"   AMI Name: {ami.get('Name', 'N/A')}")
                print(f"   Platform: {ami.get('PlatformDetails', 'N/A')}")
                print(f"   Architecture: {ami.get('Architecture', 'N/A')}")
                print(f"   Root Device: {ami.get('RootDeviceType', 'N/A')}")
        except Exception as e:
            print(f"   ✗ Could not retrieve AMI details: {e}")
        
        # Check subnet/VPC
        print("\n6. NETWORK")
        print(f"   VPC ID: {instance.vpc_id}")
        print(f"   Subnet ID: {instance.subnet_id}")
        
        subnet = ec2_resource.Subnet(instance.subnet_id)
        print(f"   Subnet CIDR: {subnet.cidr_block}")
        print(f"   Auto-assign Public IP: {subnet.map_public_ip_on_launch}")
        
        # Check system log
        print("\n7. SYSTEM LOG (Last 20 lines)")
        try:
            console_output = ec2_client.get_console_output(InstanceId=instance_id)
            if 'Output' in console_output:
                log_lines = console_output['Output'].split('\n')
                for line in log_lines[-20:]:
                    print(f"   {line}")
            else:
                print("   ⚠️  Console output not available yet")
        except Exception as e:
            print(f"   ⚠️  Could not retrieve console output: {e}")
        
        # Recommendations
        print("\n" + "="*60)
        print("RECOMMENDATIONS:")
        print("="*60)
        
        if instance.state['Name'] != 'running':
            print("• Instance is not in 'running' state. Wait for it to start.")
        
        if not instance.key_name:
            print("• No key pair assigned! You cannot SSH without a key pair.")
            print("  Create a new instance with a valid key pair.")
        
        if instance.public_ip_address is None:
            print("• No public IP address! Cannot connect from internet.")
        
        status_check_ok = False
        if status['InstanceStatuses']:
            status_info = status['InstanceStatuses'][0]
            if (status_info.get('SystemStatus', {}).get('Status') == 'ok' and 
                status_info.get('InstanceStatus', {}).get('Status') == 'ok'):
                status_check_ok = True
        
        if not status_check_ok:
            print("• Instance status checks not passing. Wait 2-5 minutes for initialization.")
        
        print("\n• Try SSH from terminal:")
        if instance.public_ip_address and instance.key_name:
            print(f"  ssh -i {instance.key_name}.pem ec2-user@{instance.public_ip_address}")
            print(f"  # or")
            print(f"  ssh -i {instance.key_name}.pem ubuntu@{instance.public_ip_address}")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python troubleshoot_instance.py <instance-id> <region>")
        print("Example: python troubleshoot_instance.py i-0123456789abcdef0 ap-northeast-2")
        sys.exit(1)
    
    instance_id = sys.argv[1]
    region = sys.argv[2]
    
    troubleshoot_instance(instance_id, region)

