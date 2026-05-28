#!/bin/bash

echo "=============================="
echo "Starting Nginx Server"
echo "=============================="

systemctl restart nginx

systemctl status nginx

echo "Application Started"