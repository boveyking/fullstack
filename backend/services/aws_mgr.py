import boto3
import botocore
import time

# ---------------------- Defaults --------------------------
DEFAULT_REGION = "us-west-2"
DEFAULT_AMI_ID = "ami-0aec5ae807cea9ce0"
DEFAULT_KEY_PAIR = "unionX"
DEFAULT_INSTANCE_COUNT = 1
DEFAULT_INSTANCE_TYPE = "t2.micro"

# ---------------------- Helpers --------------------------
def ec2_client(region=DEFAULT_REGION):
    return boto3.client("ec2", region_name=region)

def ec2_resource(region=DEFAULT_REGION):
    return boto3.resource("ec2", region_name=region)

# ---------------------- IPv6 Setup ------------------------
def enable_ipv6_for_vpc(vpc_id, region=DEFAULT_REGION):
    ec2 = ec2_client(region)
    try:
        ec2.associate_vpc_cidr_block(VpcId=vpc_id, AmazonProvidedIpv6CidrBlock=True)
        print(f"[*] IPv6 association initiated for VPC, waiting for completion...")
        
        # Wait for the association to complete and get the CIDR block
        max_attempts = 30
        for attempt in range(max_attempts):
            vpc_info = ec2.describe_vpcs(VpcIds=[vpc_id])["Vpcs"][0]
            assoc_set = vpc_info.get("Ipv6CidrBlockAssociationSet", [])
            
            for assoc in assoc_set:
                if assoc.get("Ipv6CidrBlockState", {}).get("State") == "associated":
                    ipv6_cidr = assoc.get("Ipv6CidrBlock")
                    if ipv6_cidr:
                        print(f"[✔] IPv6 enabled for VPC: {ipv6_cidr}")
                        return ipv6_cidr
            
            if attempt < max_attempts - 1:
                time.sleep(2)
        
        raise Exception("Timeout waiting for IPv6 CIDR block association")
        
    except botocore.exceptions.ClientError as e:
        if "CidrLimitExceeded" in str(e):
            print("[*] IPv6 already enabled on VPC")
            vpc_info = ec2.describe_vpcs(VpcIds=[vpc_id])["Vpcs"][0]
            assoc = vpc_info.get("Ipv6CidrBlockAssociationSet", [])
            for a in assoc:
                if a.get("Ipv6CidrBlockState", {}).get("State") == "associated":
                    ipv6_cidr = a.get("Ipv6CidrBlock")
                    if ipv6_cidr:
                        print(f"[✔] Found existing IPv6 CIDR: {ipv6_cidr}")
                        return ipv6_cidr
            return None
        else:
            raise e

def enable_ipv6_for_subnets(ipv6_cidr, region=DEFAULT_REGION):
    ec2 = ec2_client(region)
    subnets = ec2.describe_subnets(Filters=[{"Name": "default-for-az", "Values": ["true"]}])["Subnets"]
    print(f"[+] Found {len(subnets)} default subnets")
    
    # Parse the VPC IPv6 CIDR (e.g., "2406:da12:70d:9c00::/56")
    # For /56 VPC CIDR, we create /64 subnet CIDRs by incrementing the last byte of the 4th segment
    ipv6_base = ipv6_cidr.split('/')[0].rstrip(':')
    
    # Split the IPv6 address into segments
    segments = ipv6_base.split(':')
    
    # Check if there are any existing IPv6 associations
    for idx, subnet in enumerate(subnets):
        subnet_id = subnet["SubnetId"]
        
        # Check if subnet already has IPv6
        has_ipv6 = False
        if subnet.get('Ipv6CidrBlockAssociationSet'):
            for assoc in subnet['Ipv6CidrBlockAssociationSet']:
                if assoc.get('Ipv6CidrBlockState', {}).get('State') in ['associated', 'associating']:
                    has_ipv6 = True
                    print(f"[*] IPv6 already present on subnet {subnet_id}: {assoc.get('Ipv6CidrBlock')}")
                    break
        
        if not has_ipv6:
            try:
                # For /56 VPC CIDR like "2406:da12:70d:9c00::/56"
                # Create /64 subnets: 2406:da12:70d:9c00::/64, 2406:da12:70d:9c01::/64, etc.
                # Take the last segment and add the index
                if len(segments) >= 4:
                    # Get the base value of the last segment (e.g., "9c00")
                    last_segment_base = int(segments[3], 16) if segments[3] else 0
                    # Add the subnet index to create unique subnet CIDRs
                    last_segment_value = last_segment_base + idx
                    # Reconstruct the IPv6 address with the new last segment
                    subnet_ipv6_cidr = f"{segments[0]}:{segments[1]}:{segments[2]}:{last_segment_value:x}::/64"
                else:
                    # Fallback for unexpected format
                    subnet_ipv6_cidr = f"{ipv6_base}::{idx:x}:0:0:0/64"
                
                print(f"[+] Associating IPv6 CIDR {subnet_ipv6_cidr} to subnet {subnet_id}")
                ec2.associate_subnet_cidr_block(
                    SubnetId=subnet_id,
                    Ipv6CidrBlock=subnet_ipv6_cidr
                )
                print(f"[✔] IPv6 assigned to subnet {subnet_id}")
            except botocore.exceptions.ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', '')
                if "CidrLimitExceeded" in str(e) or error_code == 'CidrLimitExceeded':
                    print(f"[*] IPv6 CIDR limit exceeded on subnet {subnet_id}")
                elif "InvalidSubnet.Conflict" in str(e) or error_code == 'InvalidSubnet.Conflict':
                    print(f"[*] IPv6 CIDR conflict on subnet {subnet_id} (may already exist)")
                else:
                    print(f"[!] Error associating IPv6 to subnet {subnet_id}: {e}")
                    raise e
        
        # Enable auto-assign IPv6
        try:
            ec2.modify_subnet_attribute(
                SubnetId=subnet_id,
                AssignIpv6AddressOnCreation={"Value": True}
            )
            print(f"[✔] Auto-assign IPv6 enabled for subnet {subnet_id}")
        except Exception as e:
            print(f"[!] Warning: Could not enable auto-assign IPv6 for subnet {subnet_id}: {e}")
    
    return subnets

# ------------------- Security Group -----------------------
def create_security_group(region=DEFAULT_REGION):
    ec2 = ec2_client(region)
    
    # Define required inbound rules for IPv4 + IPv6
    required_rules = [
        # IPv4
        {"IpProtocol":"tcp","FromPort":22,"ToPort":22,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]},
        {"IpProtocol":"tcp","FromPort":22182,"ToPort":22182,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]},
        {"IpProtocol":"tcp","FromPort":23456,"ToPort":23456,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]},
        {"IpProtocol":"tcp","FromPort":59700,"ToPort":59800,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]},
        {"IpProtocol":"tcp","FromPort":80,"ToPort":80,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]},
        {"IpProtocol":"tcp","FromPort":443,"ToPort":443,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]},
        # IPv6
        {"IpProtocol":"tcp","FromPort":22,"ToPort":22,"Ipv6Ranges":[{"CidrIpv6":"::/0"}]},
        {"IpProtocol":"tcp","FromPort":22182,"ToPort":22182,"Ipv6Ranges":[{"CidrIpv6":"::/0"}]},
        {"IpProtocol":"tcp","FromPort":23456,"ToPort":23456,"Ipv6Ranges":[{"CidrIpv6":"::/0"}]},
        {"IpProtocol":"tcp","FromPort":59700,"ToPort":59800,"Ipv6Ranges":[{"CidrIpv6":"::/0"}]},
        {"IpProtocol":"tcp","FromPort":80,"ToPort":80,"Ipv6Ranges":[{"CidrIpv6":"::/0"}]},
        {"IpProtocol":"tcp","FromPort":443,"ToPort":443,"Ipv6Ranges":[{"CidrIpv6":"::/0"}]},
    ]
    
    # check if exists
    existing = ec2.describe_security_groups(Filters=[{"Name":"group-name","Values":["X_UI_Settings"]}])
    if existing["SecurityGroups"]:
        sg_id = existing["SecurityGroups"][0]["GroupId"]
        print(f"[!] Security group already exists: {sg_id}")
        
        # Check and add missing rules to existing security group
        print("[+] Checking for missing security group rules...")
        existing_rules = existing["SecurityGroups"][0].get("IpPermissions", [])
        
        # Helper function to check if a rule exists
        def rule_exists(new_rule, existing_rules):
            for existing_rule in existing_rules:
                if (existing_rule.get("IpProtocol") == new_rule.get("IpProtocol") and
                    existing_rule.get("FromPort") == new_rule.get("FromPort") and
                    existing_rule.get("ToPort") == new_rule.get("ToPort")):
                    # Check IPv4 ranges
                    if new_rule.get("IpRanges"):
                        existing_cidrs = {r.get("CidrIp") for r in existing_rule.get("IpRanges", [])}
                        new_cidrs = {r.get("CidrIp") for r in new_rule.get("IpRanges", [])}
                        if new_cidrs.issubset(existing_cidrs):
                            return True
                    # Check IPv6 ranges
                    if new_rule.get("Ipv6Ranges"):
                        existing_cidrs = {r.get("CidrIpv6") for r in existing_rule.get("Ipv6Ranges", [])}
                        new_cidrs = {r.get("CidrIpv6") for r in new_rule.get("Ipv6Ranges", [])}
                        if new_cidrs.issubset(existing_cidrs):
                            return True
            return False
        
        # Add missing rules
        rules_added = 0
        for rule in required_rules:
            if not rule_exists(rule, existing_rules):
                try:
                    ec2.authorize_security_group_ingress(GroupId=sg_id, IpPermissions=[rule])
                    port = rule.get("FromPort")
                    ip_type = "IPv4" if rule.get("IpRanges") else "IPv6"
                    print(f"[✔] Added missing rule: Port {port} ({ip_type})")
                    rules_added += 1
                except botocore.exceptions.ClientError as e:
                    if "InvalidPermission.Duplicate" in str(e):
                        pass  # Rule already exists, ignore
                    else:
                        print(f"[!] Warning: Could not add rule for port {rule.get('FromPort')}: {e}")
        
        if rules_added > 0:
            print(f"[✔] Added {rules_added} missing rule(s) to existing security group")
        else:
            print("[✔] All required rules already present")
        
        return sg_id
    
    # Create new security group
    print("[+] Creating new security group...")
    vpcs = ec2.describe_vpcs(Filters=[{"Name":"isDefault","Values":["true"]}])["Vpcs"]
    if not vpcs:
        raise Exception("No default VPC found")
    vpc_id = vpcs[0]["VpcId"]
    sg_resp = ec2.create_security_group(GroupName="X_UI_Settings",
                                        Description="Security group for X-UI and ports",
                                        VpcId=vpc_id)
    sg_id = sg_resp["GroupId"]
    print(f"[✔] Created security group: {sg_id}")

    # Apply all rules to new security group
    ec2.authorize_security_group_ingress(GroupId=sg_id, IpPermissions=required_rules)
    print("[✔] Inbound rules applied (IPv4 + IPv6).")
    return sg_id

# ------------------- EC2 Launch ---------------------------
def create_instances(region=DEFAULT_REGION,
                     ami_id=DEFAULT_AMI_ID,
                     key_name=DEFAULT_KEY_PAIR,
                     security_group_id=None,
                     instance_count=DEFAULT_INSTANCE_COUNT,
                     instance_type=DEFAULT_INSTANCE_TYPE,
                     userdata_script=None):

    ec2 = ec2_client(region)
    
    # Verify key pair exists in region
    print(f"[+] Verifying key pair '{key_name}' in region {region}...")
    try:
        key_pairs = ec2.describe_key_pairs(KeyNames=[key_name])
        print(f"[✓] Key pair '{key_name}' found")
    except botocore.exceptions.ClientError as e:
        if 'InvalidKeyPair.NotFound' in str(e):
            print(f"[✗] ERROR: Key pair '{key_name}' does NOT exist in region {region}!")
            print(f"[!] Please create the key pair in AWS Console or use an existing one.")
            print(f"[!] Available key pairs:")
            try:
                all_keys = ec2.describe_key_pairs()
                for kp in all_keys['KeyPairs']:
                    print(f"    - {kp['KeyName']}")
            except:
                pass
            raise Exception(f"Key pair '{key_name}' not found in region {region}")
        else:
            raise e
    
    # Verify AMI exists in region
    print(f"[+] Verifying AMI '{ami_id}' in region {region}...")
    try:
        images = ec2.describe_images(ImageIds=[ami_id])
        if images['Images']:
            ami_name = images['Images'][0].get('Name', 'N/A')
            print(f"[✓] AMI found: {ami_name}")
        else:
            raise Exception(f"AMI {ami_id} not found")
    except botocore.exceptions.ClientError as e:
        if 'InvalidAMIID.NotFound' in str(e):
            print(f"[✗] ERROR: AMI '{ami_id}' does NOT exist in region {region}!")
            print(f"[!] AMI IDs are region-specific. You need the correct AMI ID for {region}.")
            raise Exception(f"AMI '{ami_id}' not found in region {region}")
        else:
            raise e
    
    subnets = ec2.describe_subnets(Filters=[{"Name":"default-for-az","Values":["true"]}])["Subnets"]
    if not subnets:
        raise Exception("No default subnet found")
    subnet_id = subnets[0]["SubnetId"]
    print(f"[+] Using subnet: {subnet_id}")

    print(f"[+] Launching instance...")
    print(f"    Region: {region}")
    print(f"    AMI: {ami_id}")
    print(f"    Type: {instance_type}")
    print(f"    Key: {key_name}")
    print(f"    Security Group: {security_group_id}")
    print(f"    UserData: {'Enabled' if userdata_script else 'Disabled (None)'}")
    
    # Build run_instances parameters
    run_params = {
        'ImageId': ami_id,
        'InstanceType': instance_type,
        'KeyName': key_name,
        'MinCount': instance_count,
        'MaxCount': instance_count,
        'NetworkInterfaces': [
            {
                "DeviceIndex": 0,
                "SubnetId": subnet_id,
                "Groups": [security_group_id],
                "AssociatePublicIpAddress": True,
                "Ipv6AddressCount": 1
            }
        ],
        'TagSpecifications': [{"ResourceType": "instance", "Tags": [{"Key": "Name", "Value": "X-UI-Server"}]}]
    }
    
    # Only add UserData if it's not None
    if userdata_script:
        run_params['UserData'] = userdata_script
    
    response = ec2.run_instances(**run_params)

    instance_ids = [inst["InstanceId"] for inst in response["Instances"]]
    print(f"[✔] Launched instances: {instance_ids}")
    return instance_ids

# ------------------- Wait and Print IPs -------------------
def print_instance_ips(instance_ids, region=DEFAULT_REGION):
    ec2_res = ec2_resource(region)
    print("\n[+] Waiting for instances to enter 'running' state...")
    for inst_id in instance_ids:
        instance = ec2_res.Instance(inst_id)
        instance.wait_until_running()
        instance.reload()
        ipv4 = instance.public_ip_address
        ipv6 = None
        for iface in instance.network_interfaces:
            if iface.ipv6_addresses:
                ipv6 = iface.ipv6_addresses[0]["Ipv6Address"]
                break
        print(f"\n[✔] Instance {inst_id} Details:")
        print(f"    Instance Type: {instance.instance_type}")
        print(f"    State: {instance.state['Name']}")
        print(f"    Public IPv4: {ipv4}")
        print(f"    Public IPv6: {ipv6}")
        print(f"    Public DNS: {instance.public_dns_name}")
        print(f"    Availability Zone: {instance.placement['AvailabilityZone']}")

# ------------------- X-UI UserData Script -----------------
def xui_userdata_script():
    return """#!/bin/bash
bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh) <<< 'n'
sleep 5
x-ui port -p 22182
x-ui port -s 23456
systemctl restart x-ui || true
"""

# ------------------- Nginx Reverse Proxy Script -----------------
def mapping_port(domain, port):
    """
    Returns a UserData bash script to install nginx and map domain to local port
    """
    return f"""#!/bin/bash
apt update -y
apt install -y nginx

cat > /etc/nginx/sites-available/{domain} <<EOF
server {{
    listen 80;
    server_name {domain};

    location / {{
        proxy_pass http://localhost:{port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }}
}}
EOF

ln -s /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/
systemctl restart nginx
"""

def api_create_instance(
            region=DEFAULT_REGION,
            ami_id=DEFAULT_AMI_ID,
            key_name=DEFAULT_KEY_PAIR,
            security_group_id=None,
            instance_count=DEFAULT_INSTANCE_COUNT,
            userdata_script=None,
            instance_type=DEFAULT_INSTANCE_TYPE,
             domain=None, port=None):
    """
    Create an EC2 instance with Nginx reverse proxy to a domain:port
    Returns dict with instance_id, ipv4, ipv6
    """
    ec2 = ec2_client(region)
    ec2_res = ec2_resource(region)
    
    # Setup VPC and networking
    print("\n=== STEP 1: VPC Information ===")
    vpcs = ec2.describe_vpcs(Filters=[{"Name":"isDefault","Values":["true"]}])["Vpcs"]
    if not vpcs:
        raise Exception("No default VPC found")
    
    vpc = vpcs[0]
    vpc_id = vpc["VpcId"]
    vpc_cidr = vpc.get("CidrBlock", "N/A")
    
    print(f"[+] VPC ID: {vpc_id}")
    print(f"[+] VPC IPv4 CIDR: {vpc_cidr}")
    print(f"[+] VPC State: {vpc.get('State', 'N/A')}")
    
    # Print existing IPv6 CIDR blocks if any
    ipv6_cidrs = vpc.get("Ipv6CidrBlockAssociationSet", [])
    if ipv6_cidrs:
        print(f"[+] Existing IPv6 CIDR blocks:")
        for idx, cidr_assoc in enumerate(ipv6_cidrs, 1):
            cidr = cidr_assoc.get("Ipv6CidrBlock", "N/A")
            state = cidr_assoc.get("Ipv6CidrBlockState", {}).get("State", "N/A")
            print(f"    {idx}. {cidr} (State: {state})")
    else:
        print(f"[+] No existing IPv6 CIDR blocks")
    
    print("\n=== STEP 2: Enable IPv6 ===")
    ipv6_cidr = enable_ipv6_for_vpc(vpc_id, region)
    enable_ipv6_for_subnets(ipv6_cidr, region)
    
    # Ensure security group exists
    print("\n=== STEP 3: Security Group ===")
    if not security_group_id:
        security_group_id = create_security_group(region)
    else:
        print(f"[+] Using provided security group: {security_group_id}")

    print("\n=== STEP 4: Launch EC2 Instances with X-UI ===")
    instance_ids = create_instances(region=region,
                     ami_id=ami_id,
                     key_name=key_name,
                     security_group_id=security_group_id,
                     instance_count=instance_count,
                     instance_type=instance_type,
                     userdata_script=userdata_script or xui_userdata_script()
                                )
    
    # Wait for instance to be running and get IPs
    print("\n=== STEP 5: Wait for Instance & Retrieve Details ===")
    print("[+] Waiting for instance to enter 'running' state...")
    inst_id = instance_ids[0]
    instance = ec2_res.Instance(inst_id)
    instance.wait_until_running()
    instance.reload()
    
    ipv4 = instance.public_ip_address
    ipv6 = None
    for iface in instance.network_interfaces:
        if iface.ipv6_addresses:
            ipv6 = iface.ipv6_addresses[0]["Ipv6Address"]
            break
    
    print(f"\n[✔] Instance Created Successfully!")
    print(f"    Instance ID: {inst_id}")
    print(f"    Instance Type: {instance.instance_type}")
    print(f"    State: {instance.state['Name']}")
    print(f"    Public IPv4: {ipv4}")
    print(f"    Public IPv6: {ipv6}")
    print(f"    Public DNS: {instance.public_dns_name}")
    print(f"    Availability Zone: {instance.placement['AvailabilityZone']}")
    
    return {
        'instance_id': inst_id,
        'ipv4': ipv4,
        'ipv6': ipv6
    }
         
# ------------------- Main Workflow -----------------------
def main(region=DEFAULT_REGION, instance_count=DEFAULT_INSTANCE_COUNT):
    print("\n=== STEP 1: VPC Information ===")
    ec2 = ec2_client(region)
    vpcs = ec2.describe_vpcs(Filters=[{"Name":"isDefault","Values":["true"]}])["Vpcs"]
    if not vpcs:
        raise Exception("No default VPC found")
    
    vpc = vpcs[0]
    vpc_id = vpc["VpcId"]
    vpc_cidr = vpc.get("CidrBlock", "N/A")
    
    print(f"[+] VPC ID: {vpc_id}")
    print(f"[+] VPC IPv4 CIDR: {vpc_cidr}")
    print(f"[+] VPC State: {vpc.get('State', 'N/A')}")
    
    # Print existing IPv6 CIDR blocks if any
    ipv6_cidrs = vpc.get("Ipv6CidrBlockAssociationSet", [])
    if ipv6_cidrs:
        print(f"[+] Existing IPv6 CIDR blocks:")
        for idx, cidr_assoc in enumerate(ipv6_cidrs, 1):
            cidr = cidr_assoc.get("Ipv6CidrBlock", "N/A")
            state = cidr_assoc.get("Ipv6CidrBlockState", {}).get("State", "N/A")
            print(f"    {idx}. {cidr} (State: {state})")
    else:
        print(f"[+] No existing IPv6 CIDR blocks")
    
    print("\n=== STEP 2: Create Security Group ===")
    sg_id = create_security_group(region)

    print("\n=== STEP 3: Enable IPv6 on VPC + Subnets ===")
    ipv6_cidr = enable_ipv6_for_vpc(vpc_id, region)
    enable_ipv6_for_subnets(ipv6_cidr, region)

    print("\n=== STEP 4: Launch EC2 Instances with X-UI ===")
    instance_ids = create_instances(region=region,
                                    security_group_id=sg_id,
                                    instance_count=instance_count,
                                    userdata_script=xui_userdata_script())
    print_instance_ips(instance_ids, region)

    print("\n[✔] All done!")

# ------------------- Run -----------------------
if __name__ == "__main__":
    main(region=DEFAULT_REGION, instance_count=1)

    # Example: mapping domain to port via Nginx
    # sg_id = create_security_group()  # use existing or create
    # userdata = mapping_port("my.abc.xyz", 22182)
    # create_instances(region=DEFAULT_REGION, security_group_id=sg_id, instance_count=1, userdata_script=userdata)

