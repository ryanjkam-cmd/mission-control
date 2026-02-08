#!/bin/bash
# Mission Control Launch Script for Arkeus
# Starts the dashboard with secure keychain-based authentication

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Arkeus Mission Control...${NC}"

# Navigate to mission-control directory
cd "$(dirname "$0")"

# Load API key from macOS Keychain
echo -e "${YELLOW}Loading API key from keychain...${NC}"
API_KEY=$(security find-generic-password -a arkeus -s com.arkeus.arkeus-api-keys -w 2>/dev/null || echo "")

if [ -z "$API_KEY" ]; then
    echo -e "${RED}Error: API key not found in keychain${NC}"
    echo "Expected keychain entry: com.arkeus.arkeus-api-keys"
    echo ""
    echo "To set it:"
    echo "  cd ~/arkeus-mesh/gateway"
    echo "  python3 keychain.py get arkeus-api-keys"
    exit 1
fi

echo -e "${GREEN}API key loaded successfully${NC}"

# Export to environment for Next.js
export ARKEUS_API_KEY="$API_KEY"

# Check if Arkeus gateway is running
echo -e "${YELLOW}Checking Arkeus gateway (port 8787)...${NC}"
if ! curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8787/health | grep -q "200"; then
    echo -e "${RED}Warning: Arkeus gateway not responding at port 8787${NC}"
    echo "Start it with: cd ~/arkeus-mesh/gateway && python3 arkeus_gateway.py"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}Gateway is running${NC}"
fi

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}Error: Port 3000 is already in use${NC}"
    echo "Kill the existing process or choose a different port"
    exit 1
fi

# Create logs directory
mkdir -p ~/.arkeus/logs

# Start the server
echo -e "${GREEN}Starting Mission Control on http://127.0.0.1:3000${NC}"
echo "Logs: ~/.arkeus/logs/mission-control.log"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run in production mode for better security
npm run build >/dev/null 2>&1 && \
npm start 2>&1 | tee -a ~/.arkeus/logs/mission-control.log
