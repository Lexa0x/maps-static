document.addEventListener("DOMContentLoaded", () => {
    // Animaciones de scroll
    const fadeElements = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("visible"));
    }, { threshold: 0.1 });
    fadeElements.forEach(el => observer.observe(el));

    // Año actual en footer
    const yearElement = document.getElementById("year");
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset,
                    behavior: "smooth"
                });
                
                // Cerrar menú móvil si está abierto
                const hamburgerBtn = document.getElementById("hamburger-btn");
                const navLinks = document.getElementById("nav-links");
                if (hamburgerBtn?.classList.contains("active")) {
                    hamburgerBtn.classList.remove("active");
                    navLinks?.classList.remove("active");
                }
            }
        });
    });

    // Menú toggle
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navLinks = document.getElementById("nav-links");
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener("click", () => {
            hamburgerBtn.classList.toggle("active");
            navLinks.classList.toggle("active");
            
            if (!navLinks.classList.contains("active")) {
                setTimeout(() => navLinks.classList.remove("active"), 400);
            }
        });

        // Cerrar menú al hacer clic en enlace
        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                hamburgerBtn.classList.remove("active");
                navLinks.classList.remove("active");
            });
        });
    }

    // Carrusel trabajos realizados
    const initWorksCarousel = () => {
        const slides = document.querySelectorAll('.work-slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        
        if (!slides.length || !dots.length) return;
    
        let currentSlide = 0;
        const totalSlides = slides.length;
    
        const showSlide = (index) => {
            if (index >= totalSlides) index = 0;
            if (index < 0) index = totalSlides - 1;
            
            slides.forEach(slide => slide.classList.remove('active', 'fade-in'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        };
    
        nextBtn?.addEventListener('click', () => showSlide(currentSlide + 1));
        prevBtn?.addEventListener('click', () => showSlide(currentSlide - 1));
    
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });
        
        showSlide(0);
    };
    
    // Cargar publicaciones LinkedIn
    const loadLinkedInPosts = async () => {
        const container = document.getElementById("linkedin-posts-container");
        if (!container) return;

        try {
            container.innerHTML = `<div class="linkedin-loading"><div class="spinner"></div><p>Cargando publicaciones...</p></div>`;
            
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent("https://rss.app/feeds/FTTNaVVVbZJ9o3tj.xml")}`);
            if (!response.ok) throw new Error("Error al cargar el RSS");

            const data = await response.json();
            if (data.items?.length > 0) {
                renderLinkedInPosts(data.items.slice(0, 3));
            } else {
                showNoPostsMessage(container);
            }
        } catch (error) {
            console.error("Error al cargar publicaciones:", error);
            showFallbackMessage(container);
        }
    };

    // Funciones auxiliares
    const renderLinkedInPosts = (posts) => {
        const container = document.getElementById("linkedin-posts-container");
        let html = '<div class="linkedin-posts-grid">';

        posts.forEach(post => {
            const imageUrl = post.enclosure?.link || post.description?.match(/<img[^>]+src="([^">]+)"/)?.[1];
            const formattedDate = new Date(post.pubDate).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
            const cleanContent = (post.description || post.title).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
            const shortContent = cleanContent.length > 150 ? cleanContent.substring(0, 150).split(" ").slice(0, -1).join(" ") + "..." : cleanContent;

            html += `
            <div class="linkedin-post-card">
                ${imageUrl ? `<div class="post-image-container"><img src="${imageUrl}" alt="${post.title}" class="post-image" loading="lazy"></div>` : ''}
                <div class="post-content"><p>${shortContent}</p></div>
                <div class="post-meta">
                    <span class="post-date">${formattedDate}</span>
                    <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-linkedin">
                        <i class="fab fa-linkedin"></i> Ver más
                    </a>
                </div>
            </div>`;
        });

        container.innerHTML = html + "</div>";
    };

    const showNoPostsMessage = (container) => {
        container.innerHTML = `
        <div class="no-posts-message">
            <p>No hay publicaciones recientes disponibles.</p>
            <a href="https://www.linkedin.com/company/mapschile" target="_blank" rel="noopener noreferrer" class="btn btn-linkedin">
                <i class="fab fa-linkedin"></i> Visita nuestro LinkedIn
            </a>
        </div>`;
    };

    const showFallbackMessage = (container) => {
        container.innerHTML = `
        <div class="linkedin-fallback">
            <p>No podemos mostrar las publicaciones directamente. Por favor visita nuestro perfil de LinkedIn:</p>
            <a href="https://www.linkedin.com/company/mapschile" target="_blank" rel="noopener noreferrer" class="btn btn-linkedin">
                <i class="fab fa-linkedin"></i> Ver publicaciones en LinkedIn
            </a>
        </div>`;
    };

    // Inicializar componentes
    initWorksCarousel();
    loadLinkedInPosts();
});