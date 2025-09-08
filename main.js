// Cognito Hosted UI redirection with audience (Client ID)
const cognitoDomain = 'https://nhug-ai.auth.eu-west-1.amazoncognito.com';
const clientId = '1kivi6aito010vvka2on20lqo'; // Audiencia (Client ID)
const redirectUri = 'https://nhug.eu/index.html'; // Donde vuelve tras login
const responseType = 'code'; // Más seguro (Authorization Code Flow)

// Si no hay token en la URL, redirige a Cognito Hosted UI
if (!window.location.search.includes('code=')) {
    window.location.href = `${cognitoDomain}/login?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

// Bloquear scroll también por JavaScript por seguridad extra
document.addEventListener('DOMContentLoaded', function () {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('scroll', function () {
        window.scrollTo(0, 0);
    });

    // Prevenir scroll con ratón (rueda)
    window.addEventListener('wheel', function (e) {
        e.preventDefault();
    }, { passive: false });

    // Prevenir scroll con teclado - versión mejorada
    window.addEventListener('keydown', function(e){
        // Evitar scroll por teclas: flechas, espacio, AvPág, RePág, inicio, fin
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' '].includes(e.key)){ 
            e.preventDefault();
        }
        // También prevenir por códigos de tecla
        if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }
    }, { passive: false });

    // Prevenir scroll táctil en móviles
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
});

function sendEmail() {
    window.location.href = "mailto:juan@nhug.ai";
}