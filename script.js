document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // ========== SOLUCIÓN MEJORADA PARA LINKEDIN ==========
    const loadLinkedInEmbed = async (postId, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Mostrar loader
        container.innerHTML = `
            <div class="linkedin-loader">
                <i class="fas fa-spinner fa-spin"></i> Cargando publicación...
            </div>
        `;

        try {
            // 1. Intento con método iframe directo
            const iframeEmbed = `
                <iframe src="https://www.linkedin.com/embed/feed/update/${postId}"
                        style="width:100%;height:530px;border:none;overflow:hidden;"
                        scrolling="no"
                        allowfullscreen
                        title="Publicación de LinkedIn">
                </iframe>
            `;

            container.innerHTML = iframeEmbed;

            // 2. Verificar después de 2 segundos
            setTimeout(() => {
                const iframe = container.querySelector('iframe');
                if (!iframe || !iframe.contentDocument || 
                    iframe.contentDocument.body.innerHTML === '') {
                    tryMethod2(postId, container);
                }
            }, 2000);

        } catch (error) {
            console.error('Error con método iframe:', error);
            tryMethod2(postId, container);
        }
    };

    const tryMethod2 = (postId, container) => {
        // Método alternativo con API oficial
        try {
            // 1. Cargar SDK
            if (!window.IN) {
                const script = document.createElement('script');
                script.src = 'https://platform.linkedin.com/in.js?async=true';
                script.type = 'text/javascript';
                script.text = 'lang: es_ES';
                script.onload = () => initLinkedInEmbed(postId, container);
                script.onerror = () => showFinalFallback(postId, container);
                document.head.appendChild(script);
            } else {
                initLinkedInEmbed(postId, container);
            }
        } catch (e) {
            console.error('Error cargando SDK:', e);
            showFinalFallback(postId, container);
        }
    };

    const initLinkedInEmbed = (postId, container) => {
        container.innerHTML = `
            <script type="IN/Share" 
                    data-url="https://www.linkedin.com/feed/update/${postId}"
                    data-counter="top"></script>
            <div class="linkedin-fallback" style="display:none;">
                <a href="https://www.linkedin.com/feed/update/${postId}"
                   target="_blank"
                   class="btn btn-linkedin">
                    <i class="fab fa-linkedin"></i> Ver publicación
                </a>
            </div>
        `;

        if (window.IN && window.IN.parse) {
            window.IN.parse();
        }

        // Última verificación
        setTimeout(() => {
            if (!container.querySelector('iframe, .IN-widget')) {
                showFinalFallback(postId, container);
            }
        }, 3000);
    };

    const showFinalFallback = (postId, container) => {
        container.innerHTML = `
            <div class="linkedin-fallback">
                <p>No podemos mostrar la publicación directamente debido a restricciones técnicas.</p>
                <a href="https://www.linkedin.com/feed/update/${postId}"
                   target="_blank"
                   class="btn btn-linkedin">
                    <i class="fab fa-linkedin"></i> Ver en LinkedIn
                </a>
                <p class="fallback-note">Si usas un bloqueador de anuncios, intenta desactivarlo para esta página</p>
            </div>
        `;
    };

    // Cargar todos los embeds al iniciar
    const embedContainers = document.querySelectorAll('.linkedin-embed');
    embedContainers.forEach(container => {
        const postId = container.dataset.postId;
        if (postId) {
            loadLinkedInEmbed(postId, container.id);
        }
    });

    // Reprocesar al hacer scroll (por si LinkedIn carga tarde)
    let lastScrollCheck = 0;
    window.addEventListener('scroll', function() {
        const now = Date.now();
        if (now - lastScrollCheck > 10000) { // Cada 10 segundos
            if (window.IN && window.IN.parse) {
                window.IN.parse();
            }
            lastScrollCheck = now;
        }
    });
});