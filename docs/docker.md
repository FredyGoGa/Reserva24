# Docker en Reserva24

## Que resolvimos

Docker ejecuta Reserva24 en tres contenedores:

- `web`: Next.js en `http://localhost:3000`.
- `api`: Express y Prisma en `http://localhost:4000`.
- `db`: PostgreSQL 16. Solo es accesible dentro de la red Docker en `db:5432`; no se publica al host.

La base usa el volumen `postgres_data`, por lo que los datos sobreviven a
`docker-compose down`.

## Archivos principales

- `Dockerfile`: construye Next.js con etapas de dependencias, build y runtime.
- `Dockerfile.backend`: construye Express y genera Prisma Client.
- `docker-compose.yml`: conecta `web`, `api` y `db` en una red interna.
- `.dockerignore`: evita enviar dependencias, builds y secretos al contexto.

## Conceptos clave

- **Imagen**: plantilla creada con un Dockerfile.
- **Contenedor**: proceso ejecutándose desde una imagen.
- **Servicio**: definición de un contenedor en Compose.
- **Red interna**: los servicios se encuentran por nombre; la API usa `db:5432`, no `localhost`.
- **Volumen**: almacenamiento persistente para PostgreSQL.
- **Variable de entorno**: configuración inyectada al contenedor sin escribir secretos en la imagen.

## Flujo habitual

Desde la raíz del proyecto:

```bash
docker-compose config
docker-compose build
docker-compose up -d
docker-compose ps
```

Comprobaciones rápidas:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/products
```

Inicializar una base nueva:

```bash
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma db seed
```

Observar logs:

```bash
docker-compose logs -f api
docker-compose logs -f web
```

Detener y volver a levantar:

```bash
docker-compose down
docker-compose up -d
```

No uses `docker-compose down -v` salvo que quieras borrar el volumen y todos
los datos de PostgreSQL.

## Lecciones del build

Prisma 7 necesita generar el cliente dentro de la imagen. Por eso ambos
Dockerfiles ejecutan `npx prisma generate`. El build tambien necesita una
`DATABASE_URL` de referencia; la API recibe despues la URL real de Compose,
que apunta a `db`.

El archivo `.env.local` se pasa al servicio `api` mediante `env_file`. No se
copia a la imagen ni debe subirse al repositorio. En produccion conviene usar
un gestor de secretos.

## Diagnostico rapido

- `docker compose` no existe: este equipo usa Compose clasico, por lo que el comando es `docker-compose`.
- `port 5432 already allocated`: la base ya no se publica al host; la API debe conectarse mediante `db:5432`.
- API en `Exit 1`: revisar `docker-compose logs api`; normalmente faltan variables o migraciones.
- `ContainerConfig` al recrear: es una incompatibilidad conocida de Compose 1.29.2 con Docker Engine moderno. Eliminar el contenedor detenido y recrearlo no borra el volumen.
- Frontend responde pero API no: comprobar `docker-compose ps`, `docker-compose logs api` y `/health`.

## Siguiente nivel

Despues de dominar este flujo, el siguiente paso profesional es migrar al
plugin moderno `docker compose`, separar configuracion de desarrollo y
produccion, añadir healthchecks y automatizar build, migraciones y pruebas en
CI/CD.
