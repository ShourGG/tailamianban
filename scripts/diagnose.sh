#!/bin/bash

# 泰拉瑞亚面板诊断脚本
# 用于排查部署后空白页问题

echo "========================================="
echo "🔍 泰拉瑞亚面板诊断工具 v1.0"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 检查服务状态
echo -e "${BLUE}[1/8] 检查服务进程状态...${NC}"
if pgrep -f "terraria-panel" > /dev/null; then
    echo -e "${GREEN}✓ 面板服务正在运行${NC}"
    ps aux | grep terraria-panel | grep -v grep
else
    echo -e "${RED}✗ 面板服务未运行${NC}"
fi
echo ""

# 2. 检查端口监听
echo -e "${BLUE}[2/8] 检查端口监听状态...${NC}"
PORT=$(cat /opt/terraria-panel/config.json 2>/dev/null | grep -oP '"Port":\s*\K\d+' || echo "8080")
echo "配置端口: $PORT"
if netstat -tlnp 2>/dev/null | grep ":$PORT" > /dev/null || ss -tlnp 2>/dev/null | grep ":$PORT" > /dev/null; then
    echo -e "${GREEN}✓ 端口 $PORT 正在监听${NC}"
    netstat -tlnp 2>/dev/null | grep ":$PORT" || ss -tlnp 2>/dev/null | grep ":$PORT"
else
    echo -e "${RED}✗ 端口 $PORT 未监听${NC}"
fi
echo ""

# 3. 测试HTTP响应
echo -e "${BLUE}[3/8] 测试HTTP响应...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ 2>/dev/null || echo "000")
echo "HTTP状态码: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ HTTP响应正常${NC}"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "${RED}✗ 无法连接到服务${NC}"
else
    echo -e "${YELLOW}! HTTP状态码异常: $HTTP_CODE${NC}"
fi
echo ""

# 4. 检查前端文件
echo -e "${BLUE}[4/8] 检查前端文件结构...${NC}"
if [ -d "/opt/terraria-panel/web" ]; then
    echo -e "${GREEN}✓ web目录存在${NC}"
    echo "关键文件检查:"
    [ -f "/opt/terraria-panel/web/index.html" ] && echo "  ✓ index.html" || echo "  ✗ index.html ${RED}缺失${NC}"
    
    # 检查assets目录
    if [ -d "/opt/terraria-panel/web/assets" ]; then
        echo "  ✓ assets目录"
        JS_COUNT=$(find /opt/terraria-panel/web/assets -name "*.js" 2>/dev/null | wc -l)
        CSS_COUNT=$(find /opt/terraria-panel/web/assets -name "*.css" 2>/dev/null | wc -l)
        echo "    - JavaScript文件: $JS_COUNT 个"
        echo "    - CSS文件: $CSS_COUNT 个"
    else
        echo "  ✗ assets目录 ${RED}缺失${NC}"
    fi
else
    echo -e "${RED}✗ web目录不存在${NC}"
fi
echo ""

# 5. 检查日志
echo -e "${BLUE}[5/8] 检查应用日志...${NC}"
if [ -f "/opt/terraria-panel/terraria-panel.log" ]; then
    echo "最近的错误日志:"
    tail -n 20 /opt/terraria-panel/terraria-panel.log | grep -i "error\|panic\|fatal" || echo "  无错误日志"
else
    echo -e "${YELLOW}! 日志文件不存在${NC}"
fi
echo ""

# 6. 测试静态资源访问
echo -e "${BLUE}[6/8] 测试静态资源访问...${NC}"
# 测试index.html
INDEX_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/index.html 2>/dev/null || echo "000")
echo "index.html: $INDEX_CODE"

# 测试assets目录
ASSETS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/assets/ 2>/dev/null || echo "000")
echo "assets/: $ASSETS_CODE"

# 获取实际的JS文件进行测试
if [ -d "/opt/terraria-panel/web/assets" ]; then
    FIRST_JS=$(find /opt/terraria-panel/web/assets -name "*.js" -type f | head -1)
    if [ -n "$FIRST_JS" ]; then
        JS_FILE=$(basename "$FIRST_JS")
        JS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/assets/$JS_FILE 2>/dev/null || echo "000")
        echo "assets/$JS_FILE: $JS_CODE"
    fi
fi
echo ""

# 7. 检查浏览器能否访问
echo -e "${BLUE}[7/8] 获取实际响应内容...${NC}"
echo "获取首页HTML前100行:"
curl -s http://localhost:$PORT/ 2>/dev/null | head -100 || echo "无法获取"
echo ""

# 8. 检查浏览器控制台错误
echo -e "${BLUE}[8/8] 浏览器检查建议...${NC}"
echo "请在浏览器中按 F12 打开开发者工具，然后检查:"
echo "  1. Console标签 - 查看JavaScript错误"
echo "  2. Network标签 - 查看资源加载失败"
echo "  3. 特别关注:"
echo "     - 404错误（文件找不到）"
echo "     - MIME type错误"
echo "     - CORS错误"
echo "     - JavaScript运行时错误"
echo ""

# 生成诊断报告
echo "========================================="
echo "📊 诊断总结"
echo "========================================="
echo "版本: $(cat /opt/terraria-panel/version.txt 2>/dev/null || echo '未知')"
echo "端口: $PORT"
echo "HTTP状态: $HTTP_CODE"
echo ""
echo "建议执行的命令:"
echo "  1. 查看完整日志: tail -f /opt/terraria-panel/terraria-panel.log"
echo "  2. 重启服务: ./panel.sh restart"
echo "  3. 检查配置: cat /opt/terraria-panel/config.json"
echo ""
echo "如需更多帮助，请提供以上诊断信息"
echo "========================================="