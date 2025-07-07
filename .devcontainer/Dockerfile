FROM mcr.microsoft.com/devcontainers/javascript-node:20-bullseye

# Install PowerShell (for validation scripts)
RUN apt-get update && \
    apt-get install -y --no-install-recommends powershell && \
    rm -rf /var/lib/apt/lists/*

# Install Playwright and Lighthouse globally
RUN npm install -g playwright @lhci/cli

# Install recommended VS Code extensions (for devcontainer.json, but also here for CLI use)
RUN code --install-extension ms-playwright.playwright \
    && code --install-extension ms-azuretools.vscode-docker \
    && code --install-extension dbaeumer.vscode-eslint \
    && code --install-extension esbenp.prettier-vscode || true

# Set workdir
WORKDIR /workspace

# Default command
CMD ["bash"]
