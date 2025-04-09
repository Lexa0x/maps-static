document.addEventListener("DOMContentLoaded", function () {
    // ===== ANIMACIONES DE SCROLL =====
    const fadeElements = document.querySelectorAll(".fade-in");
    const observerOptions = {
        threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach((el) => {
        observer.observe(el);
    });

    // ===== AÑO ACTUAL EN FOOTER =====
    const yearElement = document.getElementById("year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });

                // Cerrar menú móvil si está abierto
                const hamburgerBtn = document.getElementById("hamburger-btn");
                const navLinks = document.getElementById("nav-links");
                if (hamburgerBtn && navLinks && hamburgerBtn.classList.contains("active")) {
                    hamburgerBtn.classList.remove("active");
                    navLinks.classList.remove("active");
                }
            }
        });
    });

    // ===== MENÚ TOGGLE =====
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navLinks = document.getElementById("nav-links");

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener("click", function () {
            this.classList.toggle("active");
            navLinks.classList.toggle("active");

            // Remover la clase active después de la animación si se está cerrando
            if (!navLinks.classList.contains("active")) {
                setTimeout(() => {
                    navLinks.classList.remove("active");
                }, 400);
            }
        });

        // Cerrar menú al hacer clic en enlace
        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => {
                hamburgerBtn.classList.remove("active");
                navLinks.classList.remove("active");
            });
        });
    }

    // ===== CARRUSEL TRABAJOS REALIZADOS =====
    const initWorksCarousel = () => {
		const slides = document.querySelectorAll('.work-slide');
		const dots = document.querySelectorAll('.dot');
		const prevBtn = document.querySelector('.carousel-prev');
		const nextBtn = document.querySelector('.carousel-next');
		
		if (!slides.length || !dots.length) return;
	
		let currentSlide = 0;
		const totalSlides = slides.length;
	
		const showSlide = (index) => {
			// Validar índice
			if (index >= totalSlides) index = 0;
			if (index < 0) index = totalSlides - 1;
			
			// Ocultar todos los slides
			slides.forEach(slide => {
				slide.classList.remove('active', 'fade-in');
			});
			dots.forEach(dot => dot.classList.remove('active'));
			
			// Mostrar slide actual
			slides[index].classList.add('active');
			dots[index].classList.add('active');
			currentSlide = index;
		};
	
		// Event Listeners
		nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
		prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
	
		dots.forEach((dot, index) => {
			dot.addEventListener('click', () => showSlide(index));
		});
	
		// Inicializar (eliminado el setInterval de auto-avance)
		showSlide(0);
	};
	
    // ===== ANIMACIÓN DE ESTADÍSTICAS =====
    const animateStats = () => {
        const statNumbers = document.querySelectorAll(".stat-number");
        
        statNumbers.forEach((stat) => {
            const target = parseInt(stat.getAttribute("data-count"));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    clearInterval(timer);
                    current = target;
                }
                stat.textContent = Math.floor(current);
            }, 16);
        });
    };

    // Observador para animar estadísticas cuando son visibles
    const statsObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    const successSection = document.querySelector(".success");
    if (successSection) statsObserver.observe(successSection);

    // ===== CARGAR PUBLICACIONES LINKEDIN =====
    const loadLinkedInPosts = async () => {
        const container = document.getElementById("linkedin-posts-container");
        if (!container) return;

        try {
            // Mostrar estado de carga
            container.innerHTML = `
                <div class="linkedin-loading">
                    <div class="spinner"></div>
                    <p>Cargando publicaciones...</p>
                </div>
            `;

            const rssUrl = "https://rss.app/feeds/FTTNaVVVbZJ9o3tj.xml";
            const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);

            if (!response.ok) throw new Error("Error al cargar el RSS");

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                renderLinkedInPosts(data.items.slice(0, 3)); // Mostrar 3 publicaciones
            } else {
                showNoPostsMessage(container);
            }
        } catch (error) {
            console.error("Error al cargar publicaciones:", error);
            showFallbackMessage(container);
        }
    };

    // ===== FUNCIONES AUXILIARES =====
    function renderLinkedInPosts(posts) {
        const container = document.getElementById("linkedin-posts-container");
        let html = '<div class="linkedin-posts-grid">';

        posts.forEach((post) => {
            const imageUrl = extractBestImage(post);
            const formattedDate = formatDate(post.pubDate);
            const cleanContent = cleanHtmlContent(post.description || post.title);

            html += `
            <div class="linkedin-post-card">
                ${imageUrl ? `
                <div class="post-image-container">
                    <img src="${imageUrl}" alt="${post.title}" class="post-image" loading="lazy">
                </div>` : ''}
                <div class="post-content">
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

        html += "</div>";
        container.innerHTML = html;
    }

    function extractBestImage(post) {
        if (post.enclosure && post.enclosure.link) {
            return post.enclosure.link;
        }
        const imgMatch = post.description.match(/<img[^>]+src="([^">]+)"/);
        return imgMatch && imgMatch[1] ? imgMatch[1] : null;
    }

    function cleanHtmlContent(html) {
        if (!html) return "";
        const textContent = html
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return textContent.length > 150 ? 
            textContent.substring(0, 150).split(" ").slice(0, -1).join(" ") + "..." : 
            textContent;
    }

    function formatDate(dateString) {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    }

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

    // ===== INICIALIZAR COMPONENTES =====
    initWorksCarousel();
    loadLinkedInPosts();
});