#!/bin/bash
# =====================================================
# 🔍 ECS Network Connectivity Diagnostic Script
# =====================================================
# This script checks why ECS tasks can't reach ECR
# Run this to diagnose the "unable to pull registry auth" error
# =====================================================

set -e

echo "🔍 Starting ECS Network Diagnostics..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check AWS CLI is configured
echo "1️⃣ Checking AWS CLI configuration..."
if aws sts get-caller-identity --region us-east-1 &>/dev/null; then
    echo -e "${GREEN}✅ AWS CLI is configured${NC}"
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo "   Account ID: $ACCOUNT_ID"
else
    echo -e "${RED}❌ AWS CLI is not configured or credentials are invalid${NC}"
    exit 1
fi
echo ""

# 2. Check ECS Service exists
echo "2️⃣ Checking ECS Service..."
SERVICE_STATUS=$(aws ecs describe-services \
    --cluster njs-multitenant-backend-cluster \
    --services njs-multitenant-backend-service \
    --region us-east-1 \
    --query 'services[0].status' \
    --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$SERVICE_STATUS" = "ACTIVE" ]; then
    echo -e "${GREEN}✅ ECS Service exists and is ACTIVE${NC}"
else
    echo -e "${YELLOW}⚠️  ECS Service status: $SERVICE_STATUS${NC}"
fi
echo ""

# 3. Get Network Configuration
echo "3️⃣ Checking ECS Service Network Configuration..."
NETWORK_CONFIG=$(aws ecs describe-services \
    --cluster njs-multitenant-backend-cluster \
    --services njs-multitenant-backend-service \
    --region us-east-1 \
    --query 'services[0].networkConfiguration.awsvpcConfiguration' \
    --output json 2>/dev/null)

if [ "$NETWORK_CONFIG" != "null" ] && [ -n "$NETWORK_CONFIG" ]; then
    echo "Network Configuration:"
    echo "$NETWORK_CONFIG" | jq '.'
    
    # Extract subnet IDs
    SUBNET_IDS=$(echo "$NETWORK_CONFIG" | jq -r '.subnets[]')
    SECURITY_GROUPS=$(echo "$NETWORK_CONFIG" | jq -r '.securityGroups[]')
    ASSIGN_PUBLIC_IP=$(echo "$NETWORK_CONFIG" | jq -r '.assignPublicIp')
    
    echo ""
    echo "Subnet IDs:"
    echo "$SUBNET_IDS"
    echo ""
    echo "Security Groups:"
    echo "$SECURITY_GROUPS"
    echo ""
    echo "Assign Public IP: $ASSIGN_PUBLIC_IP"
else
    echo -e "${RED}❌ Could not retrieve network configuration${NC}"
    exit 1
fi
echo ""

# 4. Check Subnets
echo "4️⃣ Checking Subnets..."
for SUBNET_ID in $SUBNET_IDS; do
    echo "Checking subnet: $SUBNET_ID"
    
    SUBNET_INFO=$(aws ec2 describe-subnets \
        --subnet-ids $SUBNET_ID \
        --region us-east-1 \
        --query 'Subnets[0]' \
        --output json 2>/dev/null || echo "{}")
    
    if [ "$SUBNET_INFO" != "{}" ]; then
        VPC_ID=$(echo "$SUBNET_INFO" | jq -r '.VpcId')
        AZ=$(echo "$SUBNET_INFO" | jq -r '.AvailabilityZone')
        MAP_PUBLIC_IP=$(echo "$SUBNET_INFO" | jq -r '.MapPublicIpOnLaunch')
        
        echo -e "${GREEN}  ✅ Subnet exists${NC}"
        echo "     VPC: $VPC_ID"
        echo "     AZ: $AZ"
        echo "     Map Public IP: $MAP_PUBLIC_IP"
        
        # Check route table
        ROUTE_TABLE_ID=$(aws ec2 describe-route-tables \
            --filters "Name=association.subnet-id,Values=$SUBNET_ID" \
            --region us-east-1 \
            --query 'RouteTables[0].RouteTableId' \
            --output text 2>/dev/null)
        
        if [ -n "$ROUTE_TABLE_ID" ] && [ "$ROUTE_TABLE_ID" != "None" ]; then
            echo "     Route Table: $ROUTE_TABLE_ID"
            
            # Check for internet gateway route
            IGW_ROUTE=$(aws ec2 describe-route-tables \
                --route-table-ids $ROUTE_TABLE_ID \
                --region us-east-1 \
                --query 'RouteTables[0].Routes[?GatewayId!=`local`]' \
                --output json | jq -r '.[0].GatewayId // "NONE"')
            
            if [[ "$IGW_ROUTE" == igw-* ]]; then
                echo -e "${GREEN}     ✅ Internet Gateway route exists: $IGW_ROUTE${NC}"
            else
                echo -e "${RED}     ❌ NO INTERNET GATEWAY ROUTE FOUND!${NC}"
                echo -e "${YELLOW}     This is likely the problem - subnet can't reach internet${NC}"
            fi
        fi
    else
        echo -e "${RED}  ❌ Subnet NOT FOUND or DELETED!${NC}"
    fi
    echo ""
done

# 5. Check Security Groups
echo "5️⃣ Checking Security Groups..."
for SG_ID in $SECURITY_GROUPS; do
    echo "Checking security group: $SG_ID"
    
    SG_INFO=$(aws ec2 describe-security-groups \
        --group-ids $SG_ID \
        --region us-east-1 \
        --output json 2>/dev/null || echo "{}")
    
    if [ "$SG_INFO" != "{}" ]; then
        SG_NAME=$(echo "$SG_INFO" | jq -r '.SecurityGroups[0].GroupName')
        echo -e "${GREEN}  ✅ Security Group exists: $SG_NAME${NC}"
        
        # Check outbound rules for HTTPS (port 443)
        HTTPS_OUTBOUND=$(echo "$SG_INFO" | jq -r '.SecurityGroups[0].IpPermissionsEgress[] | select(.FromPort==443) | .IpProtocol')
        
        if [ -n "$HTTPS_OUTBOUND" ]; then
            echo -e "${GREEN}     ✅ Outbound HTTPS (443) rule exists${NC}"
        else
            # Check for "all traffic" rule
            ALL_TRAFFIC=$(echo "$SG_INFO" | jq -r '.SecurityGroups[0].IpPermissionsEgress[] | select(.IpProtocol=="-1") | .IpProtocol')
            if [ -n "$ALL_TRAFFIC" ]; then
                echo -e "${GREEN}     ✅ Outbound all traffic rule exists${NC}"
            else
                echo -e "${RED}     ❌ NO OUTBOUND HTTPS RULE FOUND!${NC}"
                echo -e "${YELLOW}     ECS tasks cannot reach ECR without outbound HTTPS${NC}"
            fi
        fi
    else
        echo -e "${RED}  ❌ Security Group NOT FOUND or DELETED!${NC}"
    fi
    echo ""
done

# 6. Check VPC Endpoints for ECR
echo "6️⃣ Checking VPC Endpoints for ECR (alternative to IGW)..."
VPC_ENDPOINTS=$(aws ec2 describe-vpc-endpoints \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=service-name,Values=*ecr*" \
    --region us-east-1 \
    --query 'VpcEndpoints[*].[ServiceName,State]' \
    --output text 2>/dev/null)

if [ -n "$VPC_ENDPOINTS" ]; then
    echo -e "${GREEN}✅ VPC Endpoints for ECR found:${NC}"
    echo "$VPC_ENDPOINTS"
else
    echo -e "${YELLOW}⚠️  No VPC Endpoints for ECR found${NC}"
    echo "   If subnets don't have IGW route, you need VPC endpoints"
fi
echo ""

# 7. Summary
echo "=================================="
echo "📊 DIAGNOSTIC SUMMARY"
echo "=================================="
echo ""
echo -e "${YELLOW}🔍 Check the output above for any ❌ RED errors${NC}"
echo ""
echo "Common Issues:"
echo "1. ❌ Subnet has no Internet Gateway route"
echo "   → Fix: Add route 0.0.0.0/0 → igw-xxxxx to subnet's route table"
echo ""
echo "2. ❌ Security Group blocks outbound HTTPS"
echo "   → Fix: Add outbound rule for 0.0.0.0/0 on port 443"
echo ""
echo "3. ❌ Subnet or Security Group was deleted"
echo "   → Fix: Update GitHub secrets with valid IDs"
echo ""
echo "4. ⚠️  No VPC Endpoints + No IGW route"
echo "   → Fix: Either add VPC endpoints OR add IGW route"
echo ""

