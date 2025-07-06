# 🌐 CLOUDFLARE DNS SETUP - BACKUP LÖSUNG

## SOFORT-KONFIGURATION für burnitoken.website

### **A-Records (IPv4) - GitHub Pages:**

```
Type: A
Name: @
Content: 185.199.108.153
TTL: Auto
```

```
Type: A
Name: @
Content: 185.199.109.153
TTL: Auto
```

```
Type: A
Name: @
Content: 185.199.110.153
TTL: Auto
```

```
Type: A
Name: @
Content: 185.199.111.153
TTL: Auto
```

### **CNAME-Record (www):**

```
Type: CNAME
Name: www
Content: micha-lv.github.io
TTL: Auto
```

### **ZUSÄTZLICHE CLOUDFLARE EINSTELLUNGEN:**

#### **SSL/TLS:**

- Modus: "Flexible" oder "Full"
- Universal SSL: Aktiviert
- Always Use HTTPS: Aktiviert

#### **Page Rules:**

```
burnitoken.website/*
Settings:
- SSL: On
- Cache Level: Standard
- Browser Cache TTL: 4 hours
```

#### **DNS-Einstellungen:**

- Proxy Status: 🟠 (Proxied) für CDN-Schutz
- oder ☁️ (DNS only) für direkte Verbindung

### **ALTERNATIVE DOMAINS (Falls Hauptdomain versagt):**

1. `burnitoken-backup.website`
2. `burni-token.com`
3. `burnitoken.org`

### **MONITORING SETUP:**

```
Cloudflare Analytics aktivieren
Uptime Monitoring einrichten
Email-Alerts bei Ausfällen
```

## 🚨 SOFORT-AKTION ERFORDERLICH:

1. Cloudflare Account erstellen/einloggen
2. Domain hinzufügen: burnitoken.website
3. DNS-Records wie oben konfigurieren
4. Nameserver bei Domain-Provider ändern
5. SSL-Zertifikat aktivieren

### **ERWARTETE PROPAGATION:**

- ⚡ Cloudflare: 1-2 Minuten
- 🌐 Global DNS: 15-30 Minuten
- 🎯 Vollständig: 2-4 Stunden
