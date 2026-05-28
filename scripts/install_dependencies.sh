#!/bin/bash

echo "=============================="
echo "Installing Application"
echo "=============================="

# Update packages
sudo yum update -y

# Install nginx
sudo yum install nginx -y

# Start nginx
sudo systemctl start nginx

# Enable nginx
sudo systemctl enable nginx

echo "Nginx setup completed"