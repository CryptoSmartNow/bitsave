# BizMart Agent - VPS Deployment Guide

## 1. Quick Deployment

We have prepared a script to automatically deploy the agent to your VPS.

**VPS Details:**
- Host: `76.13.44.25`
- User: `root`
- Password: `###Pr1m1dac404`

### Step 1: Run the Deployment Script
Run the following command in your local terminal:

```bash
chmod +x scripts/deploy-to-vps.sh
./scripts/deploy-to-vps.sh 76.13.44.25
```

You will be prompted to enter the password (`###Pr1m1dac404`) twice: once for file upload and once for configuration.

### Step 2: Configure Frontend
After the script finishes, it will output the server URL (e.g., `http://76.13.44.25:3001`).

1. Go to your frontend deployment (Vercel, etc.).
2. Add/Update the Environment Variables:
   ```
   REMOTE_AGENT_URL=http://76.13.44.25:3001
   REMOTE_AGENT_KEY=bizmart_agent_secure_key_2024
   ```

### ⚠️ IMPORTANT: Firewall Configuration
To ensure the agent works and you don't get locked out, you MUST open the following ports in your VPS provider's dashboard (AWS Security Groups, DigitalOcean Firewalls, etc.):

1. **SSH Access** (Critical)
   - Protocol: TCP
   - Port: 22
   - Source: 0.0.0.0/0 (Anywhere) - *Or restrict to your IP for better security*

2. **Agent API** (Required for Frontend)
   - Protocol: TCP
   - Port: 3001
   - Source: 0.0.0.0/0 (Anywhere)
   *(Check your `.env` file for the `AGENT_SERVER_API_KEY`)*

3. Redeploy your frontend.

---

## 2. Manual Deployment (If script fails)

### Prerequisites on VPS
1. SSH into the VPS:
   ```bash
   ssh root@bitsave.vps.main
   ```
2. Install Node.js & PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs
   npm install -g pm2 typescript ts-node
   ```

### Setup
1. Copy project files to `~/bizmart-agent`.
2. Install dependencies:
   ```bash
   cd ~/bizmart-agent
   npm install
   ```
3. Start the agent:
   ```bash
   pm2 start scripts/agent-server.ts --name bizmart-agent --interpreter ts-node
   pm2 save
   pm2 startup
   ```

## 3. Security (Optional but Recommended)

It is recommended to set up Nginx as a reverse proxy with SSL.

```bash
apt-get install -y nginx certbot python3-certbot-nginx
```

Configure Nginx (`/etc/nginx/sites-available/default`) to proxy port 3001.
