#!/bin/bash
set -e

# 没有匹配文件时让通配符展开为空，避免把 * 当作字面量
shopt -s nullglob

# ============================================================
# 奇数位参数：用户访问的公开域名
# 偶数位参数：对应的源站域名（可省略，自动推导为 <subdomain>-origin.<domain>）
# ============================================================
if [ $# -lt 1 ]; then
    echo "用法: $0 <DOMAIN1> [ORIGIN1] [DOMAIN2] [ORIGIN2] ..."
    echo ""
    echo "  奇数参数：用户访问的公开域名"
    echo "  偶数参数：对应的源站域名（省略则自动推导）"
    echo ""
    echo "示例:"
    echo "  $0 www.5awyx.com"
    echo "  $0 www.5awyx.com www-origin.5awyx.com"
    echo "  $0 www.5awyx.com www-origin.5awyx.com star-api.5awyx.com star-api-origin.5awyx.com"
    exit 1
fi

# 解析参数，构建域名对数组
DOMAINS=()
ORIGINS=()
i=1
while [ $i -le $# ]; do
    domain="${!i}"
    DOMAINS+=("$domain")
    next=$((i + 1))
    if [ $next -le $# ]; then
        ORIGINS+=("${!next}")
        i=$((next + 1))
    else
        # 自动推导：www.5awyx.com → www-origin.5awyx.com
        SUBDOMAIN="${domain%%.*}"
        REST="${domain#*.}"
        ORIGINS+=("${SUBDOMAIN}-origin.${REST}")
        i=$((i + 1))
    fi
done

echo "本次部署域名对："
for idx in "${!DOMAINS[@]}"; do
    echo "  ${DOMAINS[$idx]}  →  ${ORIGINS[$idx]}"
done
echo ""

EMAIL="hahaha@example.com"  # ⚠️ 必须替换为你的真实邮箱，否则证书到期无法收到提醒

# 邮箱格式校验
if [[ "$EMAIL" == "youremail@example.com" ]]; then
    echo "❌ 错误：请先修改脚本中的 EMAIL 变量为你的真实邮箱"
    exit 1
fi

echo "=============================="
echo "0. 清理旧残留配置和证书"
echo "=============================="

# 杀掉残留的 certbot 进程并清除锁文件
sudo pkill -f certbot || true
sudo rm -f /var/lib/letsencrypt/.certbot.lock
sudo rm -f /tmp/certbot-log-*/log 2>/dev/null || true

sudo systemctl stop nginx || true

# 确保 Nginx 目录存在
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# 删除本次部署的旧 nginx 配置（重新生成），保留已有证书供 certbot 复用
for domain in "${DOMAINS[@]}"; do
    sudo rm -f /etc/nginx/sites-enabled/$domain
    sudo rm -f /etc/nginx/sites-available/$domain
done

# 删除所有其他非本次部署的 sites-enabled 配置（保留 default）
for conf in /etc/nginx/sites-enabled/*; do
    name=$(basename "$conf")
    keep=false
    for domain in "${DOMAINS[@]}"; do
        [ "$name" = "$domain" ] && keep=true && break
    done
    [ "$name" = "default" ] && keep=true
    if [ "$keep" = false ]; then
        echo "  删除残留配置: $name"
        sudo rm -f "/etc/nginx/sites-enabled/$name"
        sudo rm -f "/etc/nginx/sites-available/$name"
    fi
done

echo "=============================="
echo "1. 安装必要软件"
echo "=============================="

sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx iptables-persistent

echo "=============================="
echo "2. 开放防火墙端口 80/443"
echo "=============================="

sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

echo "=============================="
echo "3. 启动 Nginx"
echo "=============================="

sudo systemctl enable nginx
sudo systemctl start nginx

echo "=============================="
echo "4. 创建临时 HTTP 配置（申请证书用）"
echo "=============================="

sudo tee /etc/nginx/sites-available/temp-http.conf > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAINS[*]};
    location / { return 200 'ready for certbot'; }
}
EOF

sudo ln -sf /etc/nginx/sites-available/temp-http.conf /etc/nginx/sites-enabled/temp-http.conf
sudo nginx -t
sudo systemctl reload nginx

echo "=============================="
echo "5. 申请 SSL 证书 + 生成 HTTPS 配置"
echo "=============================="

echo "=============================="
echo "6. 生成正式 HTTPS 配置"
echo "=============================="

for idx in "${!DOMAINS[@]}"; do
    D="${DOMAINS[$idx]}"
    O="${ORIGINS[$idx]}"

    echo "  配置 $D → $O"
    sudo certbot --nginx -d $D --non-interactive --agree-tos --keep-until-expiring -m $EMAIL

    sudo tee /etc/nginx/sites-available/$D > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $D;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $D;

    ssl_certificate /etc/letsencrypt/live/$D/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$D/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/html text/xml application/xml text/plain text/css
               text/javascript application/javascript application/json
               image/svg+xml font/ttf font/otf application/font-woff application/font-woff2;

    location / {
        resolver 1.1.1.1 8.8.8.8 valid=300s ipv6=off;
        resolver_timeout 5s;

        add_header X-Star-Proxy "vps-nginx" always;

        proxy_pass https://$O;

        proxy_ssl_server_name on;
        proxy_ssl_name $O;

        proxy_set_header Host $O;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        # 关闭上游压缩，保证 sub_filter 可对响应正文进行替换
        proxy_set_header Accept-Encoding "";

        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # 关闭代理缓冲，保留 Next.js 流式输出的分块行为
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_cache off;
        proxy_max_temp_file_size 0;

        proxy_http_version 1.1;
        proxy_set_header Connection "";

        # 域名替换：仅处理 sitemap 等 XML 响应
        sub_filter_once off;
        sub_filter_types text/xml application/xml application/rss+xml;
        sub_filter 'https://$O' 'https://$D';
        sub_filter 'http://$O'  'https://$D';
        sub_filter '//$O'       '//$D';
        sub_filter 'https:\/\/$O' 'https:\/\/$D';
        sub_filter 'http:\/\/$O'  'https:\/\/$D';

        # 避免 gzip 与响应体改写影响流式分块可见性
        gzip off;
    }
}
EOF

    sudo ln -sf "/etc/nginx/sites-available/$D" "/etc/nginx/sites-enabled/$D"
done
sudo rm -f /etc/nginx/sites-enabled/temp-http.conf

sudo nginx -t
sudo systemctl reload nginx

echo "=============================="
echo "部署完成 ✅"
for domain in "${DOMAINS[@]}"; do
    echo "访问 https://$domain"
done
echo "=============================="