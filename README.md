# Nhugeu: Integración Cognito Hosted UI y AWS Amplify (CLI paso a paso)

Este documento explica cómo crear una aplicación en Amazon Cognito **sin secreto** (para apps web públicas) y configurarla para login directo en tu app Amplify, usando **AWS CLI** y ejemplos reales del proyecto.  
También incluye cómo conectar Cognito con un backend para autenticación, pensando en futuras ampliaciones.

---

## 1. Prerrequisitos

- Tener AWS CLI configurado con credenciales y región correcta.
- Tener una app Amplify ya creada (por ejemplo, dominio: `https://d2hn7j2bqlnsvw.amplifyapp.com/`).
- (Opcional, para backend) Tener un backend propio (API Gateway, Lambda, etc).

---

## 2. Crear un User Pool en Cognito

```bash
aws cognito-idp create-user-pool \
  --pool-name NhugeuUserPool \
  --auto-verified-attributes email
```
*Guarda el `Id` que devuelve, por ejemplo: `eu-west-1_AbCdEf123`.*

---

## 3. Crear un App Client sin secreto

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id eu-west-1_AbCdEf123 \
  --client-name NhugeuWebClient \
  --generate-secret false \
  --explicit-auth-flows ADMIN_NO_SRP_AUTH \
  --allowed-oauth-flows code \
  --allowed-oauth-scopes email openid profile \
  --allowed-oauth-flows-user-pool-client true \
  --callback-urls https://d2hn7j2bqlnsvw.amplifyapp.com/ \
  --logout-urls https://d2hn7j2bqlnsvw.amplifyapp.com/
```

- `--generate-secret false` asegura que no se genere un secreto (web pública).
- `--allowed-oauth-flows code` para Authorization Code Flow (más seguro).
- `--callback-urls` y `--logout-urls` deben ser la URL de tu app Amplify.

*Guarda el `ClientId` que devuelve, por ejemplo: `1kivi6aito010vvka2on20lqo`.*

---

## 4. Configurar el Hosted UI

No hay comando CLI directo para Hosted UI, pero asegúrate de tener el domain configurado (o hazlo en la consola).  
Ejemplo de dominio Cognito:  
```
https://nhug-ai.auth.eu-west-1.amazoncognito.com
```
Si no lo tienes, puedes crear uno en la consola, bajo "App integration > Domain name".

---

## 5. Construir la URL de login

La URL para iniciar sesión será:

```
https://nhug-ai.auth.eu-west-1.amazoncognito.com/login?client_id=1kivi6aito010vvka2on20lqo&response_type=code&scope=email+openid+profile&redirect_uri=https://d2hn7j2bqlnsvw.amplifyapp.com/
```

- `client_id`: tu ClientId
- `redirect_uri`: tu dominio Amplify

---

## 6. Configuración del frontend (main.js)

No es necesario redirigir manualmente tras login, ya que Cognito envía al usuario directamente a tu app Amplify.  
Puedes agregar seguridad extra (bloqueo de scroll, email, etc).  
Ejemplo:

```javascript name=main.js
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
```

---

## 7. (Opcional) Conexión Cognito con Backend (API Gateway, Lambda, etc.)

Cuando tengas backend propio y quieras protegerlo con Cognito, sigue estos pasos básicos:

### 7.1. Configura tu API Gateway para usar Cognito como Authorizer

```bash
aws apigateway create-authorizer \
  --rest-api-id <tu-api-id> \
  --name CognitoAuthorizer \
  --type COGNITO_USER_POOLS \
  --provider-arns arn:aws:cognito-idp:eu-west-1:727646469768:userpool/eu-west-1_AbCdEf123 \
  --identity-source 'method.request.header.Authorization'
```
- Cambia `<tu-api-id>` por el ID de tu API Gateway.
- El ARN del User Pool lo obtienes en el paso 2.

### 7.2. Proteger endpoints

Cuando configures tus métodos en API Gateway, elige el authorizer Cognito creado.

### 7.3. Validar el token en tu backend

En tus Lambdas o microservicios, valida el JWT que el frontend recibe tras login.  
Puedes usar librerías como [aws-jwt-verify](https://github.com/awslabs/aws-jwt-verify) en Node.js, o [python-jose](https://github.com/mpdavis/python-jose) en Python.

#### Ejemplo Node.js:
```js
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
  userPoolId: "eu-west-1_AbCdEf123",
  clientId: "1kivi6aito010vvka2on20lqo",
  tokenUse: "id",
});

async function verifyToken(token) {
  try {
    const payload = await verifier.verify(token);
    // Usuario autenticado
    return payload;
  } catch {
    // Token inválido
    return null;
  }
}
```

---

## 8. Resumen de IDs y URLs usadas

- **Amplify app domain:** `https://d2hn7j2bqlnsvw.amplifyapp.com/`
- **Cognito User Pool ID:** `eu-west-1_AbCdEf123` (ejemplo)
- **Cognito App Client ID:** `1kivi6aito010vvka2on20lqo`
- **Cognito Hosted UI Domain:** `nhug-ai.auth.eu-west-1.amazoncognito.com`

---

## 9. Recursos útiles

- [AWS CLI Cognito User Pools](https://docs.aws.amazon.com/cli/latest/reference/cognito-idp/index.html)
- [Amplify Console](https://console.aws.amazon.com/amplify/home)
- [Cognito Console](https://console.aws.amazon.com/cognito/users)
- [API Gateway Authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)
- [aws-jwt-verify](https://github.com/awslabs/aws-jwt-verify)

---

¿Necesitas ejemplos para otros lenguajes, OAuth social, o configuración avanzada? ¡Solo dímelo!