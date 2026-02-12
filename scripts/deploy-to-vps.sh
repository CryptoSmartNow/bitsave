#!/bin/bash

# Configuration
VPS_USER="root"
VPS_HOST="${1:-bitsave.vps.main}"

if [ "$VPS_HOST" = "bitsave.vps.main" ]; then
    echo "⚠️  Using default hostname 'bitsave.vps.main'."
    echo "   If this is not a real domain, please run: ./scripts/deploy-to-vps.sh <YOUR_VPS_IP>"
fi

# Setup SSH/SCP commands with optional sshpass
if [ -n "$VPS_PASS" ] && command -v sshpass &> /dev/null; then
    echo "🔑 Using provided password for automation..."
    SSH_CMD="sshpass -p $VPS_PASS ssh -o StrictHostKeyChecking=no"
    SCP_CMD="sshpass -p $VPS_PASS scp -o StrictHostKeyChecking=no"
else
    echo "ℹ️  Password provided: ###Pr1m1dac404 (You will need to enter this when prompted)"
    SSH_CMD="ssh"
    SCP_CMD="scp"
fi

echo "🚀 Preparing deployment to $VPS_HOST..."

# Stop on any error
set -e

# 1. Create a deployment package
echo "📦 Packaging files..."
# Create a temporary exclusion file
cat > .deployignore <<EOL
node_modules
.git
.next
.deployignore
deploy-package.tar.gz
EOL

tar -czf deploy-package.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next' \
    package.json \
    package-lock.json \
    tsconfig.json \
    next.config.ts \
    middleware.ts \
    postcss.config.mjs \
    eslint.config.mjs \
    i18n.ts \
    scripts \
    lib \
    utils \
    docs \
    app \
    components \
    hooks \
    messages \
    public \
    i18n \
    .env

# 2. Upload to VPS
echo "📡 Sending files to VPS..."
if ! $SCP_CMD deploy-package.tar.gz $VPS_USER@$VPS_HOST:~/; then
    echo "❌ Failed to connect to $VPS_HOST. Please check the hostname/IP and try again."
    rm deploy-package.tar.gz .deployignore
    exit 1
fi

# 3. Execute setup on VPS
echo "🔧 Configuring VPS..."
$SSH_CMD $VPS_USER@$VPS_HOST << 'EOF'
    set -e

    # Update and install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
        apt-get install -y nodejs
    fi

    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi

    # Setup Directory
    mkdir -p ~/bizmart-agent
    mv ~/deploy-package.tar.gz ~/bizmart-agent/
    cd ~/bizmart-agent
    
    # Extract
    echo "Extracting files..."
    tar -xzf deploy-package.tar.gz
    
    # Install Deps
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
    
    # Install global tsx
    npm install -g tsx typescript

    # Set Agent Identity
    echo "🦞 Setting Agent Identity..."
    export OPENCLAW_STATE_DIR=$(pwd)/.bizmart-agent
    export OPENCLAW_CONFIG_PATH=$OPENCLAW_STATE_DIR/config.json
    mkdir -p $OPENCLAW_STATE_DIR
    ./node_modules/.bin/openclaw agents set-identity --agent bizmart --identity-file docs/agent/IDENTITY.md || echo "⚠️ Warning: Failed to set identity"

    # Start Server
    echo "Starting Agent Server..."
    pm2 stop bizmart-agent 2>/dev/null || true
    pm2 delete bizmart-agent 2>/dev/null || true
    
    # Configure Firewall (UFW)
    if command -v ufw &> /dev/null; then
        echo "Configuring Firewall..."
        ufw allow 22/tcp
        ufw allow 3001/tcp
    else
        echo "UFW not found, assuming firewall is open or managed externally."
    fi

    # Start with pm2 using tsx (forcing environment update)
    OPENCLAW_STATE_DIR=$(pwd)/.bizmart-agent pm2 start scripts/agent-server.ts --name bizmart-agent --interpreter tsx --update-env
    
    pm2 save
    
    # Get IP address
    IP=$(hostname -I | awk '{print $1}')
    
    echo "✅ Agent deployed successfully!"
    echo "🌍 Agent is running at: http://$IP:3001"
    echo "🔑 API Key: $(grep AGENT_SERVER_API_KEY .env | cut -d '=' -f2)"
EOF

# Cleanup
rm deploy-package.tar.gz .deployignore

echo "🎉 Deployment complete!"
echo "👉 Now update your frontend environment variables with:"
echo "   REMOTE_AGENT_URL=http://$VPS_HOST:3001"
