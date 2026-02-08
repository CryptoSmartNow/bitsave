#!/bin/bash
set -e

echo "🔄 Upgrading Node.js to version 22..."

# 1. Remove old version (optional, but safer to avoid conflicts)
apt-get remove -y nodejs || true
apt-get autoremove -y || true

# 2. Setup NodeSource for Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

# 3. Install Node.js
apt-get install -y nodejs

# 4. Verify version
NODE_VERSION=$(node -v)
echo "✅ Node.js installed: $NODE_VERSION"

# 5. Reinstall global tools (npm modules are removed when node is removed usually, or path changes)
echo "🔧 Reinstalling global tools..."
npm install -g pm2 tsx typescript

# 6. Restart Agent
echo "🔄 Restarting Agent..."
cd ~/bizmart-agent
pm2 delete bizmart-agent || true
pm2 start scripts/agent-server.ts --name bizmart-agent --interpreter tsx
pm2 save

echo "🎉 Upgrade complete! Node version is now $NODE_VERSION"
