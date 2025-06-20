#!/bin/bash
# Deploy Monitoring Script for burnitoken.website

echo "=== NETLIFY DEPLOY MONITORING ==="
echo "Zeit: $(date)"
echo "Target: burnitoken.website"
echo "======================================"

echo ""
echo "1. SITEMAP TEST:"
curl -s -o /dev/null -w "Status: %{http_code} | Time: %{time_total}s | Size: %{size_download} bytes" https://burnitoken.website/sitemap.xml
echo ""

echo ""
echo "2. MAIN DOMAIN TEST:"
curl -s -o /dev/null -w "Status: %{http_code} | SSL: %{ssl_verify_result} | Time: %{time_total}s" https://burnitoken.website
echo ""

echo ""
echo "3. SECURITY HEADERS CHECK:"
curl -s -I https://burnitoken.website | grep -E "(HTTP|X-Frame-Options|X-Content-Type|Cache-Control|X-XSS-Protection)"

echo ""
echo "4. DNS STATUS:"
nslookup burnitoken.website

echo ""
echo "5. WWW REDIRECT TEST:"
curl -s -o /dev/null -w "Status: %{http_code} | Redirect: %{redirect_url}" https://www.burnitoken.website
echo ""

echo ""
echo "======================================"
echo "MONITORING ABGESCHLOSSEN: $(date)"
