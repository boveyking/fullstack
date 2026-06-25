import argparse
from typing import cast

import boto3
from botocore.exceptions import ClientError
from botocore.stub import Stubber
from datetime import datetime, timezone


def _route53_client():
    """Return a Route53 client instance."""
    return boto3.client("route53")


def _normalize_domain(domain: str) -> str:
    if not domain:
        raise ValueError("domain is required")
    return domain.strip().rstrip(".")


def _build_fqdn(domain: str, record_name: str) -> str:
    """Construct fully-qualified domain name with trailing dot."""
    normalized_domain = _normalize_domain(domain)
    if not record_name or record_name in ("@", normalized_domain):
        return f"{normalized_domain}."
    record = record_name.strip().rstrip(".")
    if record.endswith(normalized_domain):
        fqdn = record
    else:
        fqdn = f"{record}.{normalized_domain}"
    return fqdn if fqdn.endswith(".") else f"{fqdn}."


def _get_hosted_zone_id(domain: str, client) -> str:
    """Look up the hosted zone ID for a given domain."""
    normalized_domain = _normalize_domain(domain)
    try:
        response = client.list_hosted_zones_by_name(DNSName=normalized_domain, MaxItems="1")
    except ClientError as exc:
        raise RuntimeError(f"Failed to list hosted zones: {exc}") from exc

    hosted_zones = response.get("HostedZones", [])
    if not hosted_zones:
        raise ValueError(f"No hosted zone found for domain '{normalized_domain}'")

    zone = hosted_zones[0]
    zone_name = zone.get("Name", "").rstrip(".")
    if zone_name != normalized_domain:
        raise ValueError(f"Hosted zone mismatch: expected '{normalized_domain}', got '{zone_name}'")

    zone_id = zone.get("Id", "")
    if not zone_id:
        raise ValueError(f"Hosted zone id missing for domain '{normalized_domain}'")

    return zone_id.split("/")[-1]


def add_ipv6_record(domain: str, record_name: str, value: str, ttl: int = 300, client=None):
    """
    Create or upsert an AAAA record in the hosted zone for the provided domain.

    :param domain: The apex domain managed within Route53 (e.g., example.com).
    :param record_name: The subdomain to associate with the IPv6 record (e.g., 'www').
    :param value: The IPv6 address to associate with the record.
    :param ttl: Record TTL in seconds (default 300).
    :param client: Optional boto3 Route53 client (useful for testing).
    :return: The ChangeInfo payload returned by Route53.
    """
    if not value or ":" not in value:
        raise ValueError("value must be a valid IPv6 address string")

    route53 = client or _route53_client()
    hosted_zone_id = _get_hosted_zone_id(domain, route53)
    record_fqdn = _build_fqdn(domain, record_name)

    change_batch = {
        "Comment": f"Upsert AAAA record for {record_fqdn}",
        "Changes": [
            {
                "Action": "UPSERT",
                "ResourceRecordSet": {
                    "Name": record_fqdn,
                    "Type": "AAAA",
                    "TTL": ttl,
                    "ResourceRecords": [{"Value": value}],
                },
            }
        ],
    }

    try:
        response = route53.change_resource_record_sets(
            HostedZoneId=hosted_zone_id,
            ChangeBatch=change_batch,
        )
    except ClientError as exc:
        raise RuntimeError(f"Failed to add IPv6 record: {exc}") from exc

    return response.get("ChangeInfo", {})


def test_add_ipv6_record():
    """
    Lightweight test that verifies we submit the right payload to Route53.
    Uses botocore Stubber to avoid real AWS calls.
    """
    client = boto3.client("route53")
    stubber = Stubber(client)

    domain = "w.1717001.xyz"
    record_name = "v01"
    ipv6_value = "2406:da18:365:69f4:3ea:aeb:3d24:47d6"
    zone_id = "Z07150121ENRL6F7AOSJ"

    stubber.add_response(
        "list_hosted_zones_by_name",
        {
            "HostedZones": [
                {
                    "Id": f"/hostedzone/{zone_id}",
                    "Name": f"{domain}.",
                    "CallerReference": "unit-test",
                    "Config": {"PrivateZone": False},
                }
            ],
            "DNSName": f"{domain}.",
            "HostedZoneId": f"/hostedzone/{zone_id}",
            "IsTruncated": False,
            "MaxItems": "1",
        },
        {"DNSName": domain, "MaxItems": "1"},
    )

    fqdn = "v01.w.1717001.xyz."

    stubber.add_response(
        "change_resource_record_sets",
        {
            "ChangeInfo": {
                "Id": "/change/CH123",
                "Status": "PENDING",
                "SubmittedAt": datetime.now(timezone.utc),
                "Comment": f"Upsert AAAA record for {fqdn}",
            }
        },
        {
            "HostedZoneId": zone_id,
            "ChangeBatch": {
                "Comment": f"Upsert AAAA record for {fqdn}",
                "Changes": [
                    {
                        "Action": "UPSERT",
                        "ResourceRecordSet": {
                            "Name": fqdn,
                            "Type": "AAAA",
                            "TTL": 300,
                            "ResourceRecords": [{"Value": ipv6_value}],
                        },
                    }
                ],
            },
        },
    )

    with stubber:
        change_info = add_ipv6_record(domain, record_name, ipv6_value, client=client)
        assert change_info["Status"] == "PENDING"


def main():
    """     
    parser = argparse.ArgumentParser(
        description="Create or update an AAAA record for a hosted zone."
    )
    parser.add_argument("--domain", required=True,default="w.1717001.xyz", help="Root domain managed in Route53 (e.g. example.com)")
    parser.add_argument("--record-name",default="v01", required=True, help="Subdomain to update (e.g. www)")
    parser.add_argument("--ipv6", default="2406:da18:365:69f4:3ea:aeb:3d24:47d6", required=True, help="IPv6 address to assign")
    parser.add_argument("--ttl", type=int, default=300, help="Record TTL in seconds (default: 300)")
    args = parser.parse_args()

    domain = cast(str, args.domain)
    record_name = cast(str, args.record_name)
    ipv6_value = cast(str, args.ipv6)
    ttl_value = cast(int, args.ttl) 
    """  
    domain = "w.1717001.xyz"
    record_name = "v01"
    ipv6_value = "2406:da18:365:69f4:3ea:aeb:3d24:47d6"
    ttl_value = 300
    change_info = add_ipv6_record(domain, record_name, ipv6_value, ttl_value)

    print("✅ Change submitted")
    print(f"Change ID: {change_info.get('Id')}")
    print(f"Status: {change_info.get('Status')}")
    print(f"SubmittedAt: {change_info.get('SubmittedAt')}")


if __name__ == "__main__":
    main()

