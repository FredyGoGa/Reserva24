# Reserva24 - Liquor Store DevOps Portfolio

Reserva24 es una tienda online de licores con catálogo, carrito persistente y
checkout para entregas locales en Facatativá.

El repositorio también está preparado como proyecto de portafolio DevOps:
incluye pruebas unitarias, build de producción, contenedorización con Docker y
pipeline CI para validar la aplicación antes de desplegarla.

## Funcionalidades actuales

- Catálogo de productos con filtros por categoría
- Carrito de compras persistente
- Gestión de cantidades y cálculo de subtotal
- Formulario de checkout y validación de mayoría de edad
- Diseño adaptable para móviles y escritorio

## Próximas funcionalidades

- Integración con Mercado Pago
- Registro y seguimiento de pedidos
- Gestión de inventario
- Panel administrativo

## Tecnologías

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Vitest
- Docker
- GitHub Actions

## Desarrollo local

Instala las dependencias y ejecuta el servidor:

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

### PostgreSQL y Prisma

Configura `DATABASE_URL` a partir de `.env.example`. Con Docker Compose v2:

```bash
docker compose up -d db
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

La aplicación usa PostgreSQL como fuente de verdad. Los pedidos recalculan
precios en el servidor y descuentan stock dentro de una transacción. El CRUD
de productos está disponible en `GET/POST /api/products` y
`GET/PATCH/DELETE /api/products/:id`; `DELETE` desactiva el producto para
conservar el histórico de pedidos. El panel administrativo está en `/admin` y
requiere `ADMIN_TOKEN`; permite consultar pedidos, cambiar pedidos pendientes a
pagados o cancelados y actualizar stock. Las credenciales reales deben existir
únicamente en las variables de entorno del servidor.

## Pruebas y validación

```bash
npm run lint
npm test
npm run build
```

Las pruebas unitarias cubren:

- Formato de precios en pesos colombianos
- Reglas del carrito: agregar, acumular cantidades, eliminar, limpiar, subtotal
  y conteo de productos
- Consistencia del catálogo mock: ids únicos y campos comerciales requeridos

## Docker

Construye y ejecuta la imagen de producción:

```bash
docker build -t reserva24:local .
docker run --rm -p 3000:3000 reserva24:local
```

También puedes usar Docker Compose:

```bash
docker compose up --build
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

## CI/CD

El workflow de GitHub Actions está en `.github/workflows/ci.yml` y ejecuta:

1. Instalación reproducible con `npm ci`
2. Lint con ESLint
3. Pruebas unitarias con Vitest
4. Build de producción de Next.js
5. Build de la imagen Docker

Este flujo funciona como quality gate para pull requests y pushes a `main`.

## Estructura DevOps

```text
.
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .github/workflows/ci.yml
├── vitest.config.ts
└── src/lib/*.test.ts
```

## Siguiente paso sugerido para despliegue

Para completar el caso de portafolio, conecta el pipeline con un proveedor de
despliegue como Render, Railway, Fly.io, Azure App Service, AWS ECS o un VPS.
Una evolución natural es publicar la imagen en GitHub Container Registry y
desplegar desde esa imagen versionada.

La venta de bebidas alcohólicas está restringida a mayores de 18 años.
