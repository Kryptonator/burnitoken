// ...existing code before setupSmoothScrolling...
    setupSmoothScrolling: function () {
      var links = document.querySelectorAll('a[href^="#"]');
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            var targetId = e.currentTarget.getAttribute('href').substring(1);
            var targetElement = document.getElementById(targetId);

            if (targetElement) {
              var headerOffset = 80;
              var elementPosition = targetElement.getBoundingClientRect().top;
              var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

              // Use smooth scrolling if supported, otherwise use instant
              if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              } else {
                window.scrollTo(0, offsetPosition);
              }

              // Update active navigation
              this.updateActiveNavigation(targetId);

              // Close mobile menu if open
              var mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu && mobileMenu.classList.contains('show')) {
                mobileMenu.classList.remove('show');
                document
                  .getElementById('mobile-menu-button')
                  .setAttribute('aria-expanded', 'false');
              }
            }
          }.bind(this),
        );
      }
    },
// ...existing code after setupSmoothScrolling...
