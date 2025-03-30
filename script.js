document.addEventListener('DOMContentLoaded', function() {
    // ... (mantén todo tu código existente de navbar, scroll, etc.)
    
    // ========== SOLUCIÓN PARA LINKEDIN ==========
    const loadLinkedInEmbed = async (postId, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        try {
            // Paso 1: Cargar el SDK de LinkedIn si no está presente
            if (!window.IN) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://platform.linkedin.com/in.js';
                    script.type = 'text/javascript';
                    script.text = 'lang: es_ES';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            
            // Paso 2: Crear el embed
            container.innerHTML = `
                <script type="IN/Share" 
                        data-url="https://www.linkedin.com/feed/update/${postId}" 
                        data-counter="top"></script>
            `;
            
            // Paso 3: Forzar el parseo
            if (window.IN && window.IN.parse) {
                window.IN.parse();
            }
            
            // Paso 4: Verificar después de 3 segundos
            setTimeout(() => {
                if (!container.querySelector('iframe')) {
                    showFallback(container, postId);
                }
            }, 3000);
            
        } catch (error) {
            console.error('Error al cargar LinkedIn:', error);
            showFallback(container, postId);
        }
    };
    
    const showFallback = (container, postId) => {
        container.innerHTML = `
            <div class="linkedin-fallback">
                <p>No se pudo cargar la publicación directamente.</p>
                <a href="https://www.linkedin.com/feed/update/${postId}" 
                   target="_blank" 
                   class="btn btn-linkedin">
                    <i class="fab fa-linkedin"></i> Ver publicación en LinkedIn
                </a>
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
});