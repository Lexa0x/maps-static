document.addEventListener('DOMContentLoaded', function() {
    // Año actual en el footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Smooth scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Cargar publicaciones de LinkedIn
    loadLinkedInPosts();

    // Inicializar carrusel si existe
    if (document.getElementById('nova-carousel-track')) {
        initNovaCarousel();
    }
});

/**
 * Carga las publicaciones de LinkedIn usando RSS
 */
async function loadLinkedInPosts() {
    const container = document.getElementById('linkedin-posts-container');
    if (!container) return;
    
    try {
        // Mostrar estado de carga
        container.innerHTML = `
            <div class="linkedin-loading">
                <div class="spinner"></div>
                <p>Cargando publicaciones...</p>
            </div>
        `;

        // URL del feed RSS de mapschile
        const rssUrl = 'https://rss.app/feeds/FTTNaVVVbZJ9o3tj.xml';
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
        
        if (!response.ok) throw new Error('Error al cargar el RSS');
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            renderLinkedInPosts(data.items.slice(0, 3)); // Mostrar 3 publicaciones
        } else {
            showNoPostsMessage(container);
        }
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        showFallbackMessage(container);
    }
}

/**
 * Renderiza las publicaciones de LinkedIn en el contenedor
 * @param {Array} posts - Array de publicaciones
 */
function renderLinkedInPosts(posts) {
    const container = document.getElementById('linkedin-posts-container');
    
    let html = '<div class="linkedin-posts-grid">';
    
    posts.forEach(post => {
        // Extraer la mejor imagen disponible
        const imageUrl = extractBestImage(post);
        const formattedDate = formatDate(post.pubDate);
        const cleanContent = cleanHtmlContent(post.description || post.title);
        
        html += `
        <div class="linkedin-post-card">
            ${imageUrl ? `
            <div class="post-image-container">
                <img src="${imageUrl}" alt="${post.title}" class="post-image" loading="lazy">
            </div>
            ` : ''}
            
            <div class="post-content">
                <h3 class="post-title">${post.title || 'Nueva publicación'}</h3>
                <p>${cleanContent}</p>
            </div>
            
            <div class="post-meta">
                <span class="post-date">${formattedDate}</span>
                <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-linkedin">
                    <i class="fab fa-linkedin"></i> Ver más
                </a>
            </div>
        </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Extrae la mejor imagen disponible de la publicación
 * @param {Object} post - Objeto de publicación
 * @returns {string|null} - URL de la imagen o null si no hay
 */
function extractBestImage(post) {
    // 1. Intentar con la imagen destacada del feed
    if (post.enclosure && post.enclosure.link) {
        return post.enclosure.link;
    }
    
    // 2. Buscar en el contenido HTML
    const imgMatch = post.description.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
    }
    
    // 3. Si no hay imagen, devolver null
    return null;
}

/**
 * Limpia el contenido HTML de la publicación
 * @param {string} html - Contenido HTML original
 * @returns {string} - Contenido limpio y acortado
 */
function cleanHtmlContent(html) {
    if (!html) return '';
    
    // Eliminar etiquetas HTML y espacios excesivos
    const textContent = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
    // Acortar pero manteniendo palabras completas
    if (textContent.length > 150) {
        return textContent.substring(0, 150).split(' ').slice(0, -1).join(' ') + '...';
    }
    return textContent;
}

/**
 * Formatea la fecha para mostrarla
 * @param {string} dateString - Fecha en formato string
 * @returns {string} - Fecha formateada
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

/**
 * Muestra mensaje cuando no hay publicaciones
 * @param {HTMLElement} container - Contenedor donde mostrar el mensaje
 */
function showNoPostsMessage(container) {
    container.innerHTML = `
    <div class="no-posts-message">
        <p>No hay publicaciones recientes disponibles.</p>
        <a href="https://www.linkedin.com/company/mapschile" 
           target="_blank" 
           rel="noopener noreferrer"
           class="btn btn-linkedin">
            <i class="fab fa-linkedin"></i> Visita nuestro LinkedIn
        </a>
    </div>
    `;
}

/**
 * Muestra mensaje de fallback cuando hay error al cargar
 * @param {HTMLElement} container - Contenedor donde mostrar el mensaje
 */
function showFallbackMessage(container) {
    container.innerHTML = `
    <div class="linkedin-fallback">
        <p>No podemos mostrar las publicaciones directamente. Por favor visita nuestro perfil de LinkedIn:</p>
        <a href="https://www.linkedin.com/company/mapschile" 
           target="_blank" 
           rel="noopener noreferrer"
           class="btn btn-linkedin">
            <i class="fab fa-linkedin"></i> Ver publicaciones en LinkedIn
        </a>
    </div>
    `;
}

/**
 * Inicializa el carrusel de servicios
 */
function initNovaCarousel() {
    const carousel = {
        currentIndex: 0,
        interval: null,
        track: document.getElementById('nova-carousel-track'),
        slides: document.querySelectorAll('.nova-carousel-slide'),
        indicators: document.querySelectorAll('.nova-indicator'),
        nextBtn: document.querySelector('.nova-carousel-next'),
        prevBtn: document.querySelector('.nova-carousel-prev'),
        container: document.querySelector('.nova-carousel-container'),

        init: function() {
            // Configurar eventos
            this.nextBtn.addEventListener('click', () => this.next());
            this.prevBtn.addEventListener('click', () => this.prev());
            
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goTo(index));
            });
            
            // Auto-avance
            this.startAutoPlay();
            
            // Pausar al interactuar
            this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());
            
            // Configurar responsive
            this.setupResponsive();
            window.addEventListener('resize', () => this.setupResponsive());
        },
        
        setupResponsive: function() {
            const slideWidth = this.slides[0].getBoundingClientRect().width;
            const containerWidth = this.container.getBoundingClientRect().width;
            const visibleSlides = Math.floor(containerWidth / slideWidth);
            
            // Ajustar posición según slides visibles
            this.goTo(this.currentIndex);
        },
        
        goTo: function(index) {
            const slideWidth = this.slides[0].getBoundingClientRect().width;
            this.currentIndex = index;
            this.track.style.transform = `translateX(-${slideWidth * this.currentIndex}px)`;
            this.updateIndicators();
        },
        
        next: function() {
            const maxIndex = this.slides.length - Math.floor(this.container.getBoundingClientRect().width / this.slides[0].getBoundingClientRect().width);
            this.currentIndex = this.currentIndex >= maxIndex ? 0 : this.currentIndex + 1;
            this.goTo(this.currentIndex);
        },
        
        prev: function() {
            const maxIndex = this.slides.length - 1;
            this.currentIndex = this.currentIndex <= 0 ? maxIndex : this.currentIndex - 1;
            this.goTo(this.currentIndex);
        },
        
        updateIndicators: function() {
            this.indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === this.currentIndex);
            });
        },
        
        startAutoPlay: function() {
            this.stopAutoPlay();
            this.interval = setInterval(() => this.next(), 6000);
        },
        
        stopAutoPlay: function() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    };

    carousel.init();
}