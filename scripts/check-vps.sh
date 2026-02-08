#!/bin/bash
echo "--- PM2 Status ---"
pm2 list
echo "--- Network Listeners ---"
ss -tulpn | grep 3001
echo "--- Local Curl Check ---"
curl -v http://localhost:3001/health
echo "--- UFW Status ---"
ufw status
