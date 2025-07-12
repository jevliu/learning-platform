#!/bin/bash

echo "启动在线学习平台 Demo..."
echo

echo "1. 启动后端服务..."
cd backend
gnome-terminal --title="Backend Server" -- bash -c "npm install && npm start; exec bash" &

echo "2. 等待后端启动..."
sleep 5

echo "3. 启动前端服务..."
cd ../frontend
gnome-terminal --title="Frontend App" -- bash -c "npm install && npm start; exec bash" &

echo
echo "服务启动完成！"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:3001"
echo
echo "请确保已配置MySQL数据库并创建.env文件" 