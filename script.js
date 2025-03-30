document.addEventListener('DOMContentLoaded', function() {
    // ... (mantén todo tu código existente de navbar, scroll, etc.)

    // ========== SOLUCIÓN OPTIMIZADA PARA LINKEDIN ==========
    const loadLinkedInPost = (postId, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 1. Estados del embed
        container.innerHTML = `
            <div class="linkedin-state">
                <div class="linkedin-loader">
                    <div class="spinner"></div>
                    <p>Cargando publicación...</p>
                </div>
                <div class="linkedin-content"></div>
                <div class="linkedin-fallback">
                    <a href="https://www.linkedin.com/feed/update/${postId}"
                       target="_blank" 
                       class="btn btn-linkedin">
                        <i class="fab fa-linkedin"></i> Ver publicación
                    </a>
                    <p class="fallback-text">El contenido no se puede mostrar directamente</p>
                </div>
            </div>
        `;

        const loader = container.querySelector('.linkedin-loader');
        const content = container.querySelector('.linkedin-content');
        const fallback = container.querySelector('.linkedin-fallback');

        // 2. Ocultar elementos iniciales
        content.style.display = 'none';
        fallback.style.display = 'none';

        // 3. Método iframe con verificación
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.linkedin.com/embed/feed/update/${postId}`;
        iframe.style.width = '100%';
        iframe.style.height = '530px';
        iframe.style.border = 'none';
        iframe.loading = 'eager';
        iframe.title = 'Publicación de LinkedIn';
        iframe.allowFullscreen = true;
        
        iframe.onload = () => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                content.style.display = 'block';
            }, 300);
        };

        iframe.onerror = () => {
            showFallback();
        };

        content.appendChild(iframe);

        // 4. Mostrar fallback si hay error
        const showFallback = () => {
            loader.style.display = 'none';
            content.style.display = 'none';
            fallback.style.display = 'block';
        };

        // 5. Timeout de seguridad (8 segundos)
        setTimeout(() => {
            if (loader.style.display !== 'none') {
                showFallback();
            }
        }, 8000);
    };

    // Inicializar embed
    const linkedinEmbed = document.querySelector('.linkedin-embed');
    if (linkedinEmbed) {
        const postId = linkedinEmbed.dataset.postId;
        loadLinkedInPost(postId, 'linkedin-embed');
    }
});