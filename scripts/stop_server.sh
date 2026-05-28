#!/bin/bash

echo "=============================="
echo "Stopping Existing Services"
echo "=============================="

systemctl stop nginx || true

echo "Old services stopped"