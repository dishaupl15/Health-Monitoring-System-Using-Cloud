#!/bin/bash

echo "=============================="
echo "Installing Application"
echo "=============================="

# Update system
yum update -y

# Install nginx
amazon-linux-extras install nginx1 -y || yum install nginx -y

# Start nginx
systemctl start nginx

# Enable nginx on boot
systemctl enable nginx

# Remove old files
rm -rf /usr/share/nginx/html/*

echo "Deployment files ready"