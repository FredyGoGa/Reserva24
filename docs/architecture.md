# Arquitectura y ruta de evolución

## Decisión actual

Reserva24 tiene dos procesos separados:

- Next.js (`3000`) sirve la interfaz web.
- Express (`4000`) es la única API de negocio y el único proceso que accede a PostgreSQL mediante Prisma.

El frontend construye sus URLs con `NEXT_PUBLIC_API_URL`. Por eso las rutas
de productos, pedidos y administración se resuelven en `backend/server.ts`.
Next.js bloquea `/api/*` con `proxy.ts`; no debe añadirse lógica de negocio en
`app/api`.

## Decisiones tomadas

### 1. Consolidar Express

Se retiraron los handlers duplicados de `app/api`. Mantener dos implementaciones
del mismo endpoint hacía posible que sus validaciones, errores y contratos
divergieran. La prueba de esta decisión es que los consumidores del frontend
usan `NEXT_PUBLIC_API_URL` y el proxy de Next devuelve `404` para `/api/*`.

El contrato vigente es:

- `GET /health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST/PATCH/DELETE /api/products` y `/api/products/:id` según permisos
- `POST /api/orders`
- `GET/PATCH /api/admin/orders` y `/api/admin/orders/:id` según permisos
- `POST/GET /api/auth/*` para la sesión administrativa

### 2. Estados de pedido

El pedido ahora usa `pending_payment`, `confirmed` y `cancelled`. `confirmed`
representa un pedido listo para operar, pero el detalle del proveedor y del
resultado del cobro vivirá en `Payment`. Al migrar datos existentes, `PAID` se
convierte en `CONFIRMED`; no se pierde el pedido ni su histórico.

Cada orden nueva crea también una tentativa `Payment` en estado `PENDING`, con
el total calculado por el servidor y moneda `COP`. Crear la orden no significa
que el pago haya sido aprobado.

### 3. Pago persistente

Después se añadirá `Payment` con migración propia. El pedido se creará como
pendiente de pago y el pago almacenará el proveedor, referencia externa,
estado, importe y respuesta relevante sin confiar en datos enviados por el
cliente.

### 4. Checkout y administración

El checkout iniciará el pago y mostrará estados de retorno. El panel
administrativo distinguirá pedido pendiente, pago pendiente, pago aprobado,
rechazado y cancelado.

### 5. Mercado Pago

Checkout Pro se integrará al final, primero en modo de prueba. El webhook será
idempotente, validará su firma y actualizará el pago consultando el proveedor,
no usando el cuerpo recibido como fuente única de verdad.

## Regla de trabajo

Cada etapa debe dejar una prueba automatizada, una migración reversible cuando
aplique y una nota en este documento. No se debe integrar el proveedor de pago
antes de estabilizar el contrato interno de pedidos y pagos.

## Estado de esta iteración

- Express es la única API de negocio; las copias de `app/api` y `src/app/api` fueron retiradas.
- Los pedidos usan `pending_payment`, `confirmed` y `cancelled`.
- `Payment` existe, tiene migración aplicada localmente y registra la tentativa inicial en `PENDING`.
- El checkout informa que la orden queda pendiente de pago; Mercado Pago y el webhook firmado siguen siendo la siguiente etapa.
- `POST /api/payments/preference` crea Checkout Pro desde los datos persistidos de la orden.
- `POST /api/payments/webhook` valida `x-signature`, consulta el pago remoto y aplica cambios idempotentes.
- Con `PAYMENT_MODE=sandbox`, la preferencia redirige a `/sandbox-payment`, donde se pueden simular pagos aprobados, pendientes o rechazados sin credenciales externas.
- La suite mantiene dos pruebas de órdenes bloqueadas por stock agotado en la base local. No se ejecutó un reset destructivo; se deben reponer datos de prueba o aislar esas pruebas antes de continuar.