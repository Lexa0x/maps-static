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

    // ========== SOLUCIÓN COMPLETA PARA LINKEDIN ==========
    const loadLinkedInContent = (postId, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 1. Mostrar loader mejorado
        container.innerHTML = `
            <div class="linkedin-loading">
                <div class="spinner"></div>
                <p>Cargando contenido...</p>
            </div>
            <div class="linkedin-embed-container"></div>
            <div class="linkedin-fallback" style="display:none;">
                <a href="https://www.linkedin.com/feed/update/${postId}" 
                   target="_blank" 
                   class="btn btn-linkedin">
                    <i class="fab fa-linkedin"></i> Ver publicación directamente
                </a>
                <p class="adblock-warning">Si ves este mensaje, tu bloqueador puede estar interfiriendo</p>
            </div>
        `;

        const embedContainer = container.querySelector('.linkedin-embed-container');
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

        // 2. Función para limpiar el loader
        const clearLoader = () => {
            const loader = container.querySelector('.linkedin-loading');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 500);
            }
        };

        // 3. Método iframe con verificación mejorada
        const tryIframeMethod = () => {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.linkedin.com/embed/feed/update/${postId}`;
            iframe.style.width = '100%';
            iframe.style.height = '530px';
            iframe.style.border = 'none';
            iframe.loading = 'eager';
            iframe.title = 'Publicación de LinkedIn';
            
            iframe.onload = () => {
                // Verificación especial para localhost
                if (isLocal) {
                    setTimeout(clearLoader, 1500);
                    return;
                }

                // Verificación de contenido en producción
                setTimeout(() => {
                    try {
                        if (iframe.contentDocument && 
                            iframe.contentDocument.body.innerHTML.includes("LinkedIn")) {
                            clearLoader();
                        } else {
                            throw new Error('Iframe vacío');
                        }
                    } catch (e) {
                        iframe.remove();
                        trySDKMethod();
                    }
                }, 2000);
            };
            
            iframe.onerror = () => {
                iframe.remove();
                trySDKMethod();
            };
            
            embedContainer.appendChild(iframe);
        };

        // 4. Método con SDK oficial
        const trySDKMethod = () => {
            if (!window.IN) {
                const script = document.createElement('script');
                script.src = 'https://platform.linkedin.com/in.js?async=true';
                script.type = 'text/javascript';
                script.text = 'lang: es_ES';
                script.onload = () => initSDKEmbed();
                script.onerror = () => showFallback();
                document.head.appendChild(script);
            } else {
                initSDKEmbed();
            }
        };

        // 5. Inicializar embed con SDK
        const initSDKEmbed = () => {
            embedContainer.innerHTML = `
                <script type="IN/Share" 
                        data-url="https://www.linkedin.com/feed/update/${postId}"
                        data-counter="top"></script>
            `;
            
            if (window.IN && window.IN.parse) {
                window.IN.parse();
            }
            
            // Verificación después de 3 segundos
            setTimeout(() => {
                if (!embedContainer.querySelector('.IN-widget')) {
                    showFallback();
                }
                clearLoader();
            }, 3000);
        };

        // 6. Mostrar fallback
        const showFallback = () => {
            embedContainer.innerHTML = '';
            container.querySelector('.linkedin-fallback').style.display = 'block';
            clearLoader();
        };

        // 7. Timeout de seguridad
        const loadTimeout = setTimeout(() => {
            if (!embedContainer.querySelector('iframe, .IN-widget')) {
                showFallback();
            }
        }, 8000);

        // Iniciar proceso
        try {
            tryIframeMethod();
            
            // Limpieza del timeout
            window.addEventListener('load', () => clearTimeout(loadTimeout));
        } catch (error) {
            console.error('Error inicial:', error);
            showFallback();
        }
    };

    // Cargar todos los embeds al iniciar
    document.querySelectorAll('.linkedin-embed').forEach(container => {
        const postId = container.dataset.postId;
        if (postId) {
            loadLinkedInContent(postId, container.id);
        }
    });

    // Reprocesar al hacer scroll (solo en producción)
    if (!window.location.hostname.match(/localhost|127\.0\.0\.1/)) {
        let lastParse = 0;
        window.addEventListener('scroll', function() {
            if (Date.now() - lastParse > 10000) { // Cada 10 segundos
                if (window.IN && window.IN.parse) {
                    window.IN.parse();
                }
                lastParse = Date.now();
            }
        });
    }
});