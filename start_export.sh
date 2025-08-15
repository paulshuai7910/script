#!/bin/bash

# Lenovo AF DB Customer 数据导出脚本启动器
echo "=== Lenovo AF DB Customer 数据导出脚本 ==="
echo "正在启动数据导出..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

# 进入script目录并运行导出脚本
cd script
echo "开始导出数据..."
node lenovo_af_db_customer.js

echo "数据导出完成！"
echo "请查看 output/ 目录中的CSV文件"
