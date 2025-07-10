# Windows Subsystem for Linux (WSL2) Aktivierung

# 1. WSL und VirtualMachinePlatform aktivieren (PowerShell als Administrator):
Start-Process dism.exe -ArgumentList '/online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart' -Wait
Start-Process dism.exe -ArgumentList '/online /enable-feature /featurename:VirtualMachinePlatform /all /norestart' -Wait

# 2. PC neu starten
Write-Host 'Bitte starte jetzt den PC neu und führe danach folgenden Befehl in PowerShell aus:' -ForegroundColor Yellow
Write-Host 'wsl --install -d Ubuntu' -ForegroundColor Green
