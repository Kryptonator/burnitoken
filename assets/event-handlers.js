// Event Handler JavaScript - Externalisiert für bessere Performance und Security
// Stand: 2025-06-17

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Event Handlers initialisiert');

    // Scroll-to-Section Handler
    document.querySelectorAll('[data-scroll-target]').forEach(function(element) {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-scroll-target');
            scrollToSection(target);
        });
    });

    // Calculator Initialization Handler
    document.querySelectorAll('[data-action="init-calculator"]').forEach(function(element) {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            initializeCalculator();
        });
    });

    // FAQ Toggle Handler
    document.querySelectorAll('[data-faq-toggle]').forEach(function(element) {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const faqId = this.getAttribute('data-faq-toggle');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle FAQ
            toggleFAQ(faqId);
            
            // Update aria-expanded
            this.setAttribute('aria-expanded', !isExpanded);
        });
    });

    // Close Element Handler
    document.querySelectorAll('[data-action="close-element"]').forEach(function(element) {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            this.parentElement.style.display = 'none';
        });
    });
});

// Helper Functions (falls nicht bereits definiert)
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function initializeCalculator() {
    // Calculator initialization logic
    console.log('Calculator initialized');
    
    // Aktiviere Calculator falls vorhanden
    const calculator = document.querySelector('.calculator-container');
    if (calculator) {
        calculator.style.display = 'block';
    }
}

function toggleFAQ(faqId) {
    const content = document.getElementById(faqId + '-content');
    if (content) {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
    }
}
