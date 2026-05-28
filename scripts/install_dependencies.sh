#!/bin/bash
set -e

echo "Moving to app directory"
cd /home/ec2-user/Agentic-Health-Monitor || exit 1

echo "Fixing permissions"
sudo chown -R ec2-user:ec2-user .

echo "Checking files"
ls -la

echo "Installing dependencies"
npm install

echo "Building project"
npm run build

echo "Checking dist folder"
ls -la dist

echo "Done"