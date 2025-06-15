/**
 * Dark Mode Manager for Burni Token Website
 * Handles theme switching with smooth transitions and user preferences
 */

(function () {
  'use strict';

  // Avoid duplicate initialization
  if (window.DarkModeManager) {
    console.log('DarkModeManager already exists, skipping initialization');
    return;
  }

  class DarkModeManager {
    constructor() {
      this.currentTheme = 'light';
      this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.storageKey = 'burni-theme-preference';

      this.init();
    }

    init() {
      // Load saved preference or use system preference
      this.loadThemePreference();

      // Apply initial theme
      this.applyTheme(this.currentTheme);

      // Create toggle button
      this.createToggleButton();

      // Listen for system theme changes
      this.setupSystemThemeListener();

      // Add smooth transitions
      this.addTransitions();

      console.log('Dark Mode Manager initialized with theme:', this.currentTheme);
    }

    loadThemePreference() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved && ['light', 'dark', 'auto'].includes(saved)) {
          this.currentTheme = saved;
        } else if (this.prefersDark) {
          this.currentTheme = 'dark';
        }
      } catch (error) {
        console.warn('Could not load theme preference:', error);
        this.currentTheme = this.prefersDark ? 'dark' : 'light';
      }
    }

    saveThemePreference() {
      try {
        localStorage.setItem(this.storageKey, this.currentTheme);
      } catch (error) {
        console.warn('Could not save theme preference:', error);
      }
    }

    applyTheme(theme) {
      const html = document.documentElement;
      const body = document.body;

      // Remove existing theme classes
      html.classList.remove('light', 'dark');
      body.classList.remove('light-theme', 'dark-theme');

      // Apply new theme
      if (theme === 'dark' || (theme === 'auto' && this.prefersDark)) {
        html.classList.add('dark');
        body.classList.add('dark-theme');
        this.updateMetaThemeColor('#111827');
      } else {
        html.classList.add('light');
        body.classList.add('light-theme');
        this.updateMetaThemeColor('#ffffff');
      }

      // Update toggle button
      this.updateToggleButton();

      // Trigger custom event
      window.dispatchEvent(
        new CustomEvent('themeChanged', {
          detail: { theme: this.getActiveTheme() },
        }),
      );

      // Track theme change
      if (window.BurniAnalytics) {
        window.BurniAnalytics.trackFeatureUsage(
          'dark_mode',
          `switched_to_${this.getActiveTheme()}`,
        );
      }
    }

    updateMetaThemeColor(color) {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.content = color;
    }

    getActiveTheme() {
      if (this.currentTheme === 'auto') {
        return this.prefersDark ? 'dark' : 'light';
      }
      return this.currentTheme;
    }

    createToggleButton() {
      // Check if toggle button already exists
      if (document.getElementById('theme-toggle')) {
        console.log('Theme toggle button already exists, skipping creation');
        return;
      }

      console.log('Creating new theme toggle button');

      // Create toggle button container
      const toggleContainer = document.createElement('div');
      toggleContainer.className = `
      fixed top-4 right-4 z-50 
      bg-white dark:bg-dark-card 
      rounded-full shadow-lg dark:shadow-glow-dark
      border border-gray-200 dark:border-gray-600
      p-1 transition-all duration-300
      hover:shadow-xl hover:scale-105
    `;
      toggleContainer.id = 'theme-toggle-container';

      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.className = `
      flex items-center justify-center
      w-12 h-12 rounded-full
      bg-gradient-to-r from-orange-400 to-pink-400 dark:from-purple-400 dark:to-blue-400
      text-white transition-all duration-300
      hover:shadow-glow dark:hover:shadow-glow-dark
      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
      dark:focus:ring-purple-500 dark:focus:ring-offset-gray-800
    `;
      toggleButton.id = 'theme-toggle';
      toggleButton.setAttribute('aria-label', 'Toggle theme');
      toggleButton.setAttribute('title', 'Toggle between light and dark theme');

      // Add icons
      const lightIcon = this.createIcon('sun');
      const darkIcon = this.createIcon('moon');
      const autoIcon = this.createIcon('auto');

      toggleButton.appendChild(lightIcon);
      toggleButton.appendChild(darkIcon);
      toggleButton.appendChild(autoIcon);

      // Add click handler
      toggleButton.addEventListener('click', () => this.cycleTheme());

      // Add to container
      toggleContainer.appendChild(toggleButton);

      // Add theme selection dropdown (hidden by default)
      const dropdown = this.createThemeDropdown();
      toggleContainer.appendChild(dropdown);

      // Add to page
      document.body.appendChild(toggleContainer);

      // Setup dropdown events after button is in DOM
      this.setupDropdownEvents();

      // Add keyboard shortcut (Ctrl/Cmd + Shift + D)
      document.addEventListener('keydown', (event) => {
        console.log(
          'Keydown event:',
          event.key,
          'ctrl:',
          event.ctrlKey,
          'meta:',
          event.metaKey,
          'shift:',
          event.shiftKey,
        );
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
          console.log('Dark mode keyboard shortcut triggered!');
          event.preventDefault();
          this.cycleTheme();
        }
      });
    }

    createIcon(type) {
      const icon = document.createElement('i');
      icon.className = `absolute transition-all duration-300 transform`;

      switch (type) {
        case 'sun':
          icon.classList.add('fas', 'fa-sun');
          icon.id = 'light-icon';
          break;
        case 'moon':
          icon.classList.add('fas', 'fa-moon');
          icon.id = 'dark-icon';
          break;
        case 'auto':
          icon.classList.add('fas', 'fa-adjust');
          icon.id = 'auto-icon';
          break;
      }

      return icon;
    }

    createThemeDropdown() {
      const dropdown = document.createElement('div');
      dropdown.className = `
      absolute top-full right-0 mt-2
      bg-white dark:bg-dark-card
      border border-gray-200 dark:border-gray-600
      rounded-lg shadow-lg dark:shadow-glow-dark
      py-2 min-w-[120px]
      transform opacity-0 scale-95 translate-y-[-10px]
      transition-all duration-200
      pointer-events-none
    `;
      dropdown.id = 'theme-dropdown';

      const themes = [
        { key: 'light', label: 'Light', icon: 'fa-sun' },
        { key: 'dark', label: 'Dark', icon: 'fa-moon' },
        { key: 'auto', label: 'Auto', icon: 'fa-adjust' },
      ];

      themes.forEach((theme) => {
        const option = document.createElement('button');
        option.className = `
        w-full flex items-center px-3 py-2
        text-sm text-gray-700 dark:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition-colors duration-150
      `;
        option.innerHTML = `
        <i class="fas ${theme.icon} mr-2"></i>
        ${theme.label}
      `;
        option.addEventListener('click', () => {
          this.setTheme(theme.key);
          this.hideDropdown();
        });

        dropdown.appendChild(option);
      });

      return dropdown;
    }

    setupDropdownEvents() {
      // Show dropdown on right-click - only call this after button is created
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          this.toggleDropdown();
        });
      }
    }

    updateToggleButton() {
      const lightIcon = document.getElementById('light-icon');
      const darkIcon = document.getElementById('dark-icon');
      const autoIcon = document.getElementById('auto-icon');

      if (!lightIcon || !darkIcon || !autoIcon) return;

      // Hide all icons
      [lightIcon, darkIcon, autoIcon].forEach((icon) => {
        icon.style.opacity = '0';
        icon.style.transform = 'scale(0.5) rotate(180deg)';
      });

      // Show current theme icon
      setTimeout(() => {
        let activeIcon;
        switch (this.currentTheme) {
          case 'light':
            activeIcon = lightIcon;
            break;
          case 'dark':
            activeIcon = darkIcon;
            break;
          case 'auto':
            activeIcon = autoIcon;
            break;
        }

        if (activeIcon) {
          activeIcon.style.opacity = '1';
          activeIcon.style.transform = 'scale(1) rotate(0deg)';
        }
      }, 150);
    }

    cycleTheme() {
      const themes = ['light', 'dark', 'auto'];
      const currentIndex = themes.indexOf(this.currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;

      console.log('Cycling theme from', this.currentTheme, 'to', themes[nextIndex]);
      console.log('System prefers dark:', this.prefersDark);

      this.setTheme(themes[nextIndex]);
    }

    setTheme(theme) {
      if (['light', 'dark', 'auto'].includes(theme)) {
        console.log('Setting theme from', this.currentTheme, 'to', theme);
        this.currentTheme = theme;
        this.saveThemePreference();
        this.applyTheme(theme);

        // Add visual feedback
        this.addToggleAnimation();
      }
    }

    addToggleAnimation() {
      const toggleButton = document.getElementById('theme-toggle');
      if (toggleButton) {
        toggleButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
          toggleButton.style.transform = 'scale(1)';
        }, 100);
      }
    }

    toggleDropdown() {
      const dropdown = document.getElementById('theme-dropdown');
      if (!dropdown) return;

      const isVisible = dropdown.style.opacity === '1';

      if (isVisible) {
        this.hideDropdown();
      } else {
        this.showDropdown();
      }
    }

    showDropdown() {
      const dropdown = document.getElementById('theme-dropdown');
      if (!dropdown) return;

      dropdown.style.pointerEvents = 'auto';
      dropdown.style.opacity = '1';
      dropdown.style.transform = 'scale(1) translateY(0)';
    }

    hideDropdown() {
      const dropdown = document.getElementById('theme-dropdown');
      if (!dropdown) return;

      dropdown.style.pointerEvents = 'none';
      dropdown.style.opacity = '0';
      dropdown.style.transform = 'scale(0.95) translateY(-10px)';
    }

    setupSystemThemeListener() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (event) => {
        this.prefersDark = event.matches;

        // Only update if using auto theme
        if (this.currentTheme === 'auto') {
          this.applyTheme('auto');
        }
      });
    }

    addTransitions() {
      // Add CSS for smooth transitions
      const style = document.createElement('style');
      style.textContent = `
      * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
      }
      
      .theme-transition-disable * {
        transition: none !important;
      }
      
      body.dark-theme {
        background-color: #111827;
        color: #F3F4F6;
      }
      
      body.light-theme {
        background-color: #ffffff;
        color: #111827;
      }
      
      /* Chart.js theme adaptations */
      .chart-container {
        transition: background-color 0.3s ease;
      }
      
      .dark .chart-container {
        background-color: rgba(31, 41, 55, 0.8);
        border-radius: 0.5rem;
        padding: 1rem;
      }
      
      /* Custom scrollbar for dark mode */
      .dark ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .dark ::-webkit-scrollbar-track {
        background: #374151;
      }
      
      .dark ::-webkit-scrollbar-thumb {
        background: #6B7280;
        border-radius: 4px;
      }
      
      .dark ::-webkit-scrollbar-thumb:hover {
        background: #9CA3AF;
      }
    `;
      document.head.appendChild(style);
    }

    // Public API
    getCurrentTheme() {
      return this.currentTheme;
    }

    getActiveThemeValue() {
      return this.getActiveTheme();
    }

    isSystemDarkMode() {
      return this.prefersDark;
    }

    // Method to disable transitions temporarily (useful for initial load)
    disableTransitions() {
      document.body.classList.add('theme-transition-disable');
      setTimeout(() => {
        document.body.classList.remove('theme-transition-disable');
      }, 100);
    }
  }

  // Initialize when DOM is ready
  console.log('DarkMode script loaded, readyState:', document.readyState);
  if (document.readyState === 'loading') {
    console.log('DOM still loading, adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOMContentLoaded fired, creating DarkModeManager');
      try {
        window.DarkModeManager = new DarkModeManager();
        console.log('DarkModeManager created successfully');
      } catch (error) {
        console.error('Error creating DarkModeManager:', error);
      }
    });
  } else {
    console.log('DOM ready, creating DarkModeManager immediately');
    try {
      window.DarkModeManager = new DarkModeManager();
      console.log('DarkModeManager created successfully');
    } catch (error) {
      console.error('Error creating DarkModeManager:', error);
    }
  }

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeManager;
  }
})(); // End of IIFE
