/**
 * Enhanced Internationalization (i18n) with AI Translation
 * Advanced multi-language support for BURNI Token website
 */

class BURNIInternationalization {
  constructor() {
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
    this.translations = {};
    this.aiTranslationCache = new Map();
    this.supportedLanguages = {
      en: { name: 'English', flag: '🇺🇸', rtl: false },
      de: { name: 'Deutsch', flag: '🇩🇪', rtl: false },
      es: { name: 'Español', flag: '🇪🇸', rtl: false },
      fr: { name: 'Français', flag: '🇫🇷', rtl: false },
      it: { name: 'Italiano', flag: '🇮🇹', rtl: false },
      pt: { name: 'Português', flag: '🇵🇹', rtl: false },
      ru: { name: 'Русский', flag: '🇷🇺', rtl: false },
      zh: { name: '中文', flag: '🇨🇳', rtl: false },
      ja: { name: '日本語', flag: '🇯🇵', rtl: false },
      ko: { name: '한국어', flag: '🇰🇷', rtl: false },
      ar: { name: 'العربية', flag: '🇸🇦', rtl: true },
      hi: { name: 'हिन्दी', flag: '🇮🇳', rtl: false },
      bn: { name: 'বাংলা', flag: '🇧🇩', rtl: false },
      tr: { name: 'Türkçe', flag: '🇹🇷', rtl: false },
    };
    this.detectedLanguage = null;
    this.userPreferences = {};

    this.init();
  }

  /**
   * Initialize internationalization system
   */
  async init() {
    await this.loadTranslations();
    await this.detectUserLanguage();
    this.setupLanguageDetection();
    this.createLanguageSwitcher();
    this.setupDynamicTranslation();
    this.initializeRTLSupport();
    console.log('🌍 Enhanced i18n initialized');
  }

  /**
   * Load translation files
   */
  async loadTranslations() {
    try {
      // Load base translations
      this.translations = {
        en: await this.loadLanguageFile('en'),
        de: await this.loadLanguageFile('de'),
        es: await this.loadLanguageFile('es'),
        fr: await this.loadLanguageFile('fr'),
        // Add more as needed
      };

      console.log('✅ Translations loaded');
    } catch (error) {
      console.error('❌ Failed to load translations:', error);
      this.translations.en = this.getDefaultTranslations();
    }
  }

  /**
   * Load language file (simulated - in real app would fetch from server)
   */
  async loadLanguageFile(language) {
    const defaultTranslations = this.getDefaultTranslations();

    // Simulate translation variations
    if (language === 'de') {
      return {
        ...defaultTranslations,
        page_title: 'BURNI Token - Innovative Dezentrale Kryptowährung',
        nav_home: 'Start',
        nav_about: 'Über uns',
        nav_trade: 'Handeln',
        nav_community: 'Gemeinschaft',
        nav_calculator: 'Rechner',
        hero_title: 'BURNI Token',
        hero_subtitle: 'Schaffung von Wert durch Verknappung',
        hero_description:
          'Erleben Sie die Zukunft der deflationären Kryptowährungen auf XRPL mit innovativen Verbrennungsmechanismen.',
        calculator_title: 'BURNI Token Rechner',
        calculator_description:
          'Simulieren Sie den BURNI Token Verbrennungs- und Sperrplan. Sehen Sie, wie unser deflationärer Mechanismus im Laufe der Zeit Wert durch Verknappung schafft.',
        // Add more German translations
      };
    } else if (language === 'es') {
      return {
        ...defaultTranslations,
        page_title: 'BURNI Token - Criptomoneda Descentralizada Innovadora',
        nav_home: 'Inicio',
        nav_about: 'Acerca de',
        nav_trade: 'Comerciar',
        nav_community: 'Comunidad',
        nav_calculator: 'Calculadora',
        hero_title: 'BURNI Token',
        hero_subtitle: 'Creando Valor a Través de la Escasez',
        hero_description:
          'Experimenta el futuro de las criptomonedas deflacionarias en XRPL con mecanismos de quema innovadores.',
        calculator_title: 'Calculadora BURNI Token',
        calculator_description:
          'Simula el cronograma de quema y bloqueo de tokens BURNI. Ve cómo nuestro mecanismo deflacionario crea valor a través de la escasez con el tiempo.',
        // Add more Spanish translations
      };
    } else if (language === 'fr') {
      return {
        ...defaultTranslations,
        page_title: 'BURNI Token - Cryptomonnaie Décentralisée Innovante',
        nav_home: 'Accueil',
        nav_about: 'À propos',
        nav_trade: 'Échanger',
        nav_community: 'Communauté',
        nav_calculator: 'Calculatrice',
        hero_title: 'BURNI Token',
        hero_subtitle: 'Créer de la Valeur par la Rareté',
        hero_description:
          "Découvrez l'avenir des cryptomonnaies déflationnistes sur XRPL avec des mécanismes de brûlage innovants.",
        calculator_title: 'Calculatrice BURNI Token',
        calculator_description:
          'Simulez le calendrier de brûlage et de verrouillage des tokens BURNI. Voyez comment notre mécanisme déflationniste crée de la valeur par la rareté au fil du temps.',
        // Add more French translations
      };
    }

    return defaultTranslations;
  }

  /**
   * Get default English translations
   */
  getDefaultTranslations() {
    return {
      page_title: 'BURNI Token - Innovative Decentralized Cryptocurrency',
      nav_home: 'Home',
      nav_about: 'About',
      nav_trade: 'Trade',
      nav_community: 'Community',
      nav_calculator: 'Calculator',
      nav_xrpl_explorer: 'XRPL Explorer',
      hero_title: 'BURNI Token',
      hero_subtitle: 'Creating Value Through Scarcity',
      hero_description:
        'Experience the future of deflationary cryptocurrencies on XRPL with innovative burning mechanisms.',
      calculator_title: 'BURNI Token Calculator',
      calculator_description:
        'Simulate the BURNI token burn and lock schedule. See how our deflationary mechanism creates value through scarcity over time.',
      ai_analysis_title: 'AI Market Analysis',
      ai_prediction_title: 'Price Predictions',
      accessibility_settings: 'Accessibility Settings',
      language_settings: 'Language Settings',
      // Add more keys as needed
    };
  }

  /**
   * Detect user's preferred language
   */
  async detectUserLanguage() {
    // Check localStorage first
    const savedLanguage = localStorage.getItem('burni-language');
    if (savedLanguage && this.supportedLanguages[savedLanguage]) {
      this.currentLanguage = savedLanguage;
      return;
    }

    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (this.supportedLanguages[browserLanguage]) {
      this.currentLanguage = browserLanguage;
      this.detectedLanguage = browserLanguage;
      return;
    }

    // Try geolocation-based detection
    try {
      const geoLanguage = await this.detectLanguageByLocation();
      if (geoLanguage && this.supportedLanguages[geoLanguage]) {
        this.currentLanguage = geoLanguage;
        this.detectedLanguage = geoLanguage;
      }
    } catch (error) {
      console.warn('Could not detect language by location:', error);
    }

    console.log(`🌍 Language detected: ${this.currentLanguage}`);
  }

  /**
   * Detect language by user's location (simulated)
   */
  async detectLanguageByLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Simulate country-to-language mapping
            // In real app, use a geolocation service
            const languageMap = {
              US: 'en',
              GB: 'en',
              CA: 'en',
              AU: 'en',
              DE: 'de',
              AT: 'de',
              CH: 'de',
              ES: 'es',
              MX: 'es',
              AR: 'es',
              FR: 'fr',
              BE: 'fr',
              IT: 'it',
              PT: 'pt',
              BR: 'pt',
              RU: 'ru',
              CN: 'zh',
              TW: 'zh',
              JP: 'ja',
              KR: 'ko',
              SA: 'ar',
              AE: 'ar',
              IN: 'hi',
              BD: 'bn',
              TR: 'tr',
            };

            // Simulate getting country from coordinates
            const country = 'US'; // Would be determined from coordinates
            resolve(languageMap[country] || 'en');
          },
          () => resolve('en'),
          { timeout: 5000 },
        );
      } else {
        resolve('en');
      }
    });
  }

  /**
   * Setup automatic language detection
   */
  setupLanguageDetection() {
    // Monitor language changes
    if ('languagechange' in window) {
      window.addEventListener('languagechange', () => {
        this.detectUserLanguage().then(() => {
          if (this.detectedLanguage !== this.currentLanguage) {
            this.showLanguageChangePrompt();
          }
        });
      });
    }
  }

  /**
   * Show language change prompt
   */
  showLanguageChangePrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'language-change-prompt';
    prompt.innerHTML = `
            <div class="prompt-content">
                <p>🌍 We detected your language preference has changed to ${this.supportedLanguages[this.detectedLanguage]?.name}.</p>
                <div class="prompt-actions">
                    <button class="accept-language" data-language="${this.detectedLanguage}">
                        Switch to ${this.supportedLanguages[this.detectedLanguage]?.name}
                    </button>
                    <button class="dismiss-prompt">Keep Current Language</button>
                </div>
            </div>
        `;

    this.styleLanguagePrompt(prompt);
    document.body.appendChild(prompt);

    // Event listeners
    prompt.querySelector('.accept-language').addEventListener('click', () => {
      this.switchLanguage(this.detectedLanguage);
      prompt.remove();
    });

    prompt.querySelector('.dismiss-prompt').addEventListener('click', () => {
      prompt.remove();
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (prompt.parentNode) {
        prompt.remove();
      }
    }, 10000);
  }

  /**
   * Style language change prompt
   */
  styleLanguagePrompt(prompt) {
    prompt.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #fff;
            border: 2px solid #ff6b35;
            border-radius: 8px;
            padding: 1rem;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            text-align: center;
        `;

    const style = document.createElement('style');
    style.textContent = `
            .language-change-prompt p {
                margin: 0 0 1rem 0;
                color: #333;
            }
            
            .prompt-actions {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
            }
            
            .prompt-actions button {
                padding: 0.5rem 1rem;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .accept-language {
                background: #ff6b35 !important;
                color: white !important;
                border-color: #ff6b35 !important;
            }
            
            .accept-language:hover {
                background: #e55a2b !important;
            }
            
            .dismiss-prompt {
                background: #f5f5f5 !important;
            }
            
            .dismiss-prompt:hover {
                background: #e0e0e0 !important;
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Create enhanced language switcher
   */
  createLanguageSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
            <button class="language-toggle" aria-label="Change language">
                <span class="current-flag">${this.supportedLanguages[this.currentLanguage].flag}</span>
                <span class="current-lang">${this.supportedLanguages[this.currentLanguage].name}</span>
                <span class="dropdown-arrow">▼</span>
            </button>
            <div class="language-dropdown" role="menu" aria-hidden="true">
                ${Object.entries(this.supportedLanguages)
                  .map(
                    ([code, info]) => `
                    <button class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
                            data-language="${code}" 
                            role="menuitem"
                            aria-label="Switch to ${info.name}">
                        <span class="flag">${info.flag}</span>
                        <span class="name">${info.name}</span>
                        ${code === this.currentLanguage ? '<span class="checkmark">✓</span>' : ''}
                    </button>
                `,
                  )
                  .join('')}
            </div>
        `;

    this.styleLanguageSwitcher();
    this.setupLanguageSwitcherEvents(switcher);

    // Add to navigation
    const nav = document.querySelector('nav');
    if (nav) {
      nav.appendChild(switcher);
    } else {
      document.body.appendChild(switcher);
    }
  }

  /**
   * Style language switcher
   */
  styleLanguageSwitcher() {
    const style = document.createElement('style');
    style.textContent = `
            .language-switcher {
                position: relative;
                display: inline-block;
            }
            
            .language-toggle {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 0.5rem 1rem;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.9rem;
            }
            
            .language-toggle:hover {
                border-color: #ff6b35;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .dropdown-arrow {
                transition: transform 0.2s;
                font-size: 0.8rem;
            }
            
            .language-switcher.open .dropdown-arrow {
                transform: rotate(180deg);
            }
            
            .language-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                min-width: 200px;
                z-index: 1000;
                display: none;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .language-switcher.open .language-dropdown {
                display: block;
            }
            
            .language-option {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                width: 100%;
                padding: 0.75rem 1rem;
                border: none;
                background: none;
                cursor: pointer;
                transition: background-color 0.2s;
                text-align: left;
                font-size: 0.9rem;
            }
            
            .language-option:hover {
                background: #f5f5f5;
            }
            
            .language-option.active {
                background: #ff6b35;
                color: white;
            }
            
            .language-option.active:hover {
                background: #e55a2b;
            }
            
            .language-option .flag {
                font-size: 1.2rem;
            }
            
            .language-option .name {
                flex: 1;
            }
            
            .language-option .checkmark {
                font-weight: bold;
            }
            
            /* RTL Support */
            .rtl {
                direction: rtl;
                text-align: right;
            }
            
            .rtl .language-dropdown {
                right: auto;
                left: 0;
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .language-toggle {
                    padding: 0.4rem 0.8rem;
                    font-size: 0.8rem;
                }
                
                .language-dropdown {
                    min-width: 180px;
                }
                
                .language-option {
                    padding: 0.6rem 0.8rem;
                    font-size: 0.8rem;
                }
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Setup language switcher events
   */
  setupLanguageSwitcherEvents(switcher) {
    const toggle = switcher.querySelector('.language-toggle');
    const dropdown = switcher.querySelector('.language-dropdown');

    // Toggle dropdown
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      switcher.classList.toggle('open');
      dropdown.setAttribute('aria-hidden', !switcher.classList.contains('open'));
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      switcher.classList.remove('open');
      dropdown.setAttribute('aria-hidden', 'true');
    });

    // Language selection
    dropdown.addEventListener('click', (e) => {
      const option = e.target.closest('.language-option');
      if (option) {
        const language = option.dataset.language;
        this.switchLanguage(language);
        switcher.classList.remove('open');
        dropdown.setAttribute('aria-hidden', 'true');
      }
    });

    // Keyboard navigation
    dropdown.addEventListener('keydown', (e) => {
      const options = dropdown.querySelectorAll('.language-option');
      const currentIndex = Array.from(options).findIndex((opt) => opt === document.activeElement);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % options.length;
          options[nextIndex].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + options.length) % options.length;
          options[prevIndex].focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (document.activeElement.classList.contains('language-option')) {
            document.activeElement.click();
          }
          break;
        case 'Escape':
          switcher.classList.remove('open');
          dropdown.setAttribute('aria-hidden', 'true');
          toggle.focus();
          break;
      }
    });
  }

  /**
   * Switch to a new language
   */
  async switchLanguage(language) {
    if (!this.supportedLanguages[language]) {
      console.warn(`Language ${language} not supported`);
      return;
    }

    const oldLanguage = this.currentLanguage;
    this.currentLanguage = language;

    // Save preference
    localStorage.setItem('burni-language', language);

    // Load translations if not cached
    if (!this.translations[language]) {
      await this.loadLanguageFromAPI(language);
    }

    // Apply translations
    await this.applyTranslations();

    // Update page attributes
    document.documentElement.lang = language;
    document.documentElement.dir = this.supportedLanguages[language].rtl ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', this.supportedLanguages[language].rtl);

    // Update language switcher
    this.updateLanguageSwitcher();

    // Announce change to screen readers
    if (window.burniAccessibility) {
      window.burniAccessibility.announceToScreenReader(
        `Language changed to ${this.supportedLanguages[language].name}`,
      );
    }

    // Dispatch custom event
    document.dispatchEvent(
      new CustomEvent('languageChanged', {
        detail: { oldLanguage, newLanguage: language },
      }),
    );

    console.log(`🌍 Language switched to ${language}`);
  }

  /**
   * Load language from API or AI translation
   */
  async loadLanguageFromAPI(language) {
    try {
      // Try to load from cache first
      const cacheKey = `translations-${language}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        this.translations[language] = JSON.parse(cached);
        return;
      }

      // Use AI translation for missing languages
      this.translations[language] = await this.generateAITranslation(language);

      // Cache the translations
      localStorage.setItem(cacheKey, JSON.stringify(this.translations[language]));
    } catch (error) {
      console.error(`Failed to load ${language} translations:`, error);
      this.translations[language] = this.translations[this.fallbackLanguage];
    }
  }

  /**
   * Generate AI translation (simulated)
   */
  async generateAITranslation(targetLanguage) {
    const baseTranslations = this.translations[this.fallbackLanguage];
    const aiTranslations = {};

    // Simulate AI translation process
    for (const [key, value] of Object.entries(baseTranslations)) {
      if (this.aiTranslationCache.has(`${key}-${targetLanguage}`)) {
        aiTranslations[key] = this.aiTranslationCache.get(`${key}-${targetLanguage}`);
      } else {
        // Simulate translation API call
        const translated = await this.translateText(value, targetLanguage);
        aiTranslations[key] = translated;
        this.aiTranslationCache.set(`${key}-${targetLanguage}`, translated);
      }
    }

    return aiTranslations;
  }

  /**
   * Translate text using simulated AI (in real app, use translation API)
   */
  async translateText(text, targetLanguage) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate translation (in real app, call translation service)
    const translations = {
      zh: {
        'BURNI Token': 'BURNI 代币',
        Home: '首页',
        About: '关于',
        Trade: '交易',
        Community: '社区',
        Calculator: '计算器',
        'Creating Value Through Scarcity': '通过稀缺性创造价值',
        // Add more Chinese translations
      },
      ja: {
        'BURNI Token': 'BURNIトークン',
        Home: 'ホーム',
        About: 'について',
        Trade: '取引',
        Community: 'コミュニティ',
        Calculator: '計算機',
        'Creating Value Through Scarcity': '希少性による価値創造',
        // Add more Japanese translations
      },
      ko: {
        'BURNI Token': 'BURNI 토큰',
        Home: '홈',
        About: '소개',
        Trade: '거래',
        Community: '커뮤니티',
        Calculator: '계산기',
        'Creating Value Through Scarcity': '희소성을 통한 가치 창출',
        // Add more Korean translations
      },
      ar: {
        'BURNI Token': 'رمز BURNI',
        Home: 'الرئيسية',
        About: 'حول',
        Trade: 'تداول',
        Community: 'المجتمع',
        Calculator: 'حاسبة',
        'Creating Value Through Scarcity': 'خلق القيمة من خلال الندرة',
        // Add more Arabic translations
      },
      hi: {
        'BURNI Token': 'BURNI टोकन',
        Home: 'होम',
        About: 'के बारे में',
        Trade: 'व्यापार',
        Community: 'समुदाय',
        Calculator: 'कैलकुलेटर',
        'Creating Value Through Scarcity': 'दुर्लभता के माध्यम से मूल्य निर्माण',
        // Add more Hindi translations
      },
    };

    return translations[targetLanguage]?.[text] || text;
  }

  /**
   * Apply translations to the page
   */
  async applyTranslations() {
    const currentTranslations =
      this.translations[this.currentLanguage] || this.translations[this.fallbackLanguage];

    // Translate elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (currentTranslations[key]) {
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = currentTranslations[key];
        } else {
          element.textContent = currentTranslations[key];
        }
      }
    });

    // Translate page title
    if (currentTranslations.page_title) {
      document.title = currentTranslations.page_title;
    }

    // Translate meta descriptions
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && currentTranslations.meta_description) {
      metaDesc.setAttribute('content', currentTranslations.meta_description);
    }

    // Translate dynamic content
    await this.translateDynamicContent();
  }

  /**
   * Translate dynamic content (calculator, AI analysis, etc.)
   */
  async translateDynamicContent() {
    // Translate calculator if present
    const calculatorContainer = document.getElementById('calculator-display');
    if (calculatorContainer && window.burniCalculator) {
      // Re-generate calculator with new language
      setTimeout(() => {
        if (typeof initializeCalculator === 'function') {
          initializeCalculator();
        }
      }, 100);
    }

    // Translate AI insights if present
    if (window.burniAI) {
      // AI content will be automatically translated when next updated
    }
  }

  /**
   * Update language switcher display
   */
  updateLanguageSwitcher() {
    const switcher = document.querySelector('.language-switcher');
    if (!switcher) return;

    const currentFlag = switcher.querySelector('.current-flag');
    const currentLang = switcher.querySelector('.current-lang');
    const options = switcher.querySelectorAll('.language-option');

    if (currentFlag) {
      currentFlag.textContent = this.supportedLanguages[this.currentLanguage].flag;
    }

    if (currentLang) {
      currentLang.textContent = this.supportedLanguages[this.currentLanguage].name;
    }

    // Update active option
    options.forEach((option) => {
      const isActive = option.dataset.language === this.currentLanguage;
      option.classList.toggle('active', isActive);

      const checkmark = option.querySelector('.checkmark');
      if (isActive && !checkmark) {
        option.innerHTML += '<span class="checkmark">✓</span>';
      } else if (!isActive && checkmark) {
        checkmark.remove();
      }
    });
  }

  /**
   * Setup dynamic translation for new content
   */
  setupDynamicTranslation() {
    // Monitor for new content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Translate new elements with data-i18n
            const elementsToTranslate = node.querySelectorAll('[data-i18n]');
            if (elementsToTranslate.length > 0) {
              this.translateElements(elementsToTranslate);
            }

            // Check if the added node itself needs translation
            if (node.hasAttribute && node.hasAttribute('data-i18n')) {
              this.translateElements([node]);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Translate specific elements
   */
  translateElements(elements) {
    const currentTranslations =
      this.translations[this.currentLanguage] || this.translations[this.fallbackLanguage];

    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (currentTranslations[key]) {
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = currentTranslations[key];
        } else {
          element.textContent = currentTranslations[key];
        }
      }
    });
  }

  /**
   * Initialize RTL support
   */
  initializeRTLSupport() {
    // Add RTL styles
    const style = document.createElement('style');
    style.textContent = `
            .rtl {
                direction: rtl;
                text-align: right;
            }
            
            .rtl .container {
                text-align: right;
            }
            
            .rtl .flex {
                flex-direction: row-reverse;
            }
            
            .rtl .grid {
                direction: rtl;
            }
            
            .rtl .language-switcher {
                left: 20px;
                right: auto;
            }
            
            .rtl .accessibility-toolbar {
                left: 20px;
                right: auto;
            }
            
            .rtl .text-left {
                text-align: right;
            }
            
            .rtl .text-right {
                text-align: left;
            }
            
            .rtl .ml-2 {
                margin-left: 0;
                margin-right: 0.5rem;
            }
            
            .rtl .mr-2 {
                margin-right: 0;
                margin-left: 0.5rem;
            }
        `;
    document.head.appendChild(style);
  }

  /**
   * Get current language info
   */
  getCurrentLanguageInfo() {
    return {
      code: this.currentLanguage,
      name: this.supportedLanguages[this.currentLanguage].name,
      flag: this.supportedLanguages[this.currentLanguage].flag,
      rtl: this.supportedLanguages[this.currentLanguage].rtl,
    };
  }

  /**
   * Get translation for a key
   */
  t(key, fallback = key) {
    const currentTranslations =
      this.translations[this.currentLanguage] || this.translations[this.fallbackLanguage];
    return currentTranslations[key] || fallback;
  }

  /**
   * Test translation completeness
   */
  testTranslationCompleteness() {
    const baseKeys = Object.keys(this.translations[this.fallbackLanguage] || {});
    const results = {};

    Object.keys(this.supportedLanguages).forEach((lang) => {
      const langTranslations = this.translations[lang] || {};
      const translatedKeys = Object.keys(langTranslations);
      const missing = baseKeys.filter((key) => !translatedKeys.includes(key));

      results[lang] = {
        total: baseKeys.length,
        translated: translatedKeys.length,
        missing: missing.length,
        missingKeys: missing,
        completeness: Math.round((translatedKeys.length / baseKeys.length) * 100),
      };
    });

    console.log('🌍 Translation completeness:', results);
    return results;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.burniI18n = new BURNIInternationalization();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BURNIInternationalization;
}
