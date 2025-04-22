# Microservices NestJS Boilerplate

This is a microservices boilerplate built with **NestJS**, featuring **Auth** and **Product** microservices, an **API Gateway**, and supporting **Saga Choreography**, **RBAC**, and **Observables**. It uses **MySQL**, **Redis**, **RabbitMQ**, **Prisma**, **NGINX**, **Jaeger**, **ELK**, and **Prometheus + Grafana**.

## Features
- **API Gateway**: Handles routing, authentication, rate limiting, caching, circuit breaking, CORS, and security headers.
- **Service Discovery**: Uses Redis to dynamically discover microservices.
- **Circuit Breaker**: Prevents cascade failures by pausing requests to failing microservices.
- **Caching**: Caches GET responses in Redis (at Gateway).
- **Authentication/Authorization**: Gateway calls `auth` microservice for authentication; microservices handle authorization.
- **Load Balancing**: NGINX as a reverse proxy and load balancer before Gateway.
- **Saga Choreography**: Uses RabbitMQ for distributed transactions.
- **RBAC**: Role-based access control with permissions.
- **Tracing**: Jaeger for distributed tracing with Elasticsearch backend.
- **Logging**: ELK stack (Elasticsearch, Logstash, Kibana) for centralized logging with correlation IDs.
- **Monitoring**: Prometheus and Grafana for metrics and dashboards with custom metrics.
- **Dockerized**: MySQL, Redis, RabbitMQ, NGINX, Jaeger, ELK, Prometheus, and Grafana run in containers.

## Prerequisites
- **Node.js**: v18 or higher
- **Docker**: For running MySQL, Redis, RabbitMQ, Jaeger, ELK, Prometheus, and Grafana
- **npm**: For installing dependencies
- **Postman**: For testing APIs

## Project Structure
- `apps/auth`: Handles authentication, user/role/permission management (port `3000`).
- `apps/product`: Manages products CRUD (port `3001`).
- `apps/gateway`: API Gateway for routing requests (port `3002`, exposed via NGINX on port `80`).
- `libs/common`: Shared services (Prisma, Redis, RabbitMQ, Tracing, Logging, Monitoring, User decorator).
- `docker-compose.yml`: Configures all services for production.
- `docker-compose.dev.yml`: Configures auxiliary services (MySQL, Redis, RabbitMQ, Jaeger, ELK, Prometheus, Grafana) for development.
- `nginx.conf`: Configures NGINX as load balancer.
- `logstash.conf`: Configures Logstash for ELK.
- `prometheus.yml`: Configures Prometheus scrape targets.
- `init.sql`: Initializes `auth_db` and `product_db`.

## Setup

### Development (Local Services)
1. **Clone or unzip the project**:
   ```bash
   unzip microservices-nestjs-boilerplate.zip
   cd microservices-nestjs-boilerplate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start auxiliary services (MySQL, Redis, RabbitMQ, Jaeger, ELK, Prometheus, Grafana)**:
   ```bash
   npm run docker:dev
   ```

4. **Run migrations and seed data**:
   ```bash
   npm run prisma:migrate
   cd apps/auth && npx prisma db seed
   ```

5. **Start microservices locally** (in separate terminals):
   ```bash
   npm run start:dev:auth
   npm run start:dev:product
   npm run start:dev:gateway
   ```

### Production (Docker)
1. **Build and start all services**:
   ```bash
   npm run docker:up
   ```

2. **Run migrations and seed data** (inside auth container):
   ```bash
   docker exec -it <auth_container_id> npx prisma migrate dev
   docker exec -it <auth_container_id> npx prisma db seed
   ```

## Environment Variables
Create a `.env` file (see `.env.example`):
```
DATABASE_URL="mysql://user:password@localhost:3316/auth_db"
PRODUCT_DATABASE_URL="mysql://user:password@localhost:3316/product_db"
REDIS_URL="redis://localhost:6389"
RABBITMQ_URL="amqp://admin:admin@localhost:5972"
JWT_SECRET="your-jwt-secret"
REFRESH_TOKEN_SECRET="your-refresh-secret"
JAEGER_URL="http://localhost:14268/api/traces"
LOGSTASH_HOST="localhost"
LOGSTASH_PORT=5044
PROMETHEUS_URL="http://localhost:9090"
GRAFANA_URL="http://localhost:3003"
SERVICE_NAME=auth
```

**Note**: Update `SERVICE_NAME` for each service (`auth`, `product`, or `gateway`).

## Testing APIs
Use **Postman** to test via NGINX (`http://localhost`).

1. **Login**:
   ```bash
   POST http://localhost/auth/login
   Content-Type: application/json
   Body: { "username": "admin", "password": "password" }
   ```
   Response: `{ "success": true, "data": { "access_token": "...", "refresh_token": "..." }, "timestamp": "..." }`

2. **Create Product**:
   ```bash
   POST http://localhost/products
   Authorization: Bearer <access_token>
   Content-Type: application/json
   Body: { "name": "Laptop", "price": 1000 }
   ```

3. **Get Products**:
   ```bash
   GET http://localhost/products
   Authorization: Bearer <access_token>
   ```

4. **Refresh Token**:
   ```bash
   POST http://localhost/auth/refresh
   Content-Type: application/json
   Body: { "refresh_token": "..." }
   ```

## Debugging
- **Local Debugging**:
  - Use VS Code with a `launch.json` configuration:
    ```json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "type": "node",
          "request": "launch",
          "name": "Debug Auth",
          "program": "/apps/auth/src/main.ts",
          "preLaunchTask": "tsc: build - apps/auth/tsconfig.json",
          "sourceMaps": true,
          "env": {
            "SERVICE_NAME": "auth"
          }
        },
        {
          "type": "node",
          "request": "launch",
          "name": "Debug Product",
          "program": "/apps/product/src/main.ts",
          "preLaunchTask": "tsc: build - apps/product/tsconfig.json",
          "sourceMaps": true,
          "env": {
            "SERVICE_NAME": "product"
          }
        },
        {
          "type": "node",
          "request": "launch",
          "name": "Debug Gateway",
          "program": "/apps/gateway/src/main.ts",
          "preLaunchTask": "tsc: build - apps/gateway/tsconfig.json",
          "sourceMaps": true,
          "env": {
            "SERVICE_NAME": "gateway"
          }
        }
      ]
    }
    ```
  - Run services with `npm run start:dev:<service>` for hot reload.

- **Tracing**: View traces in Jaeger (`http://localhost:16686`). Traces are stored in Elasticsearch for scalability.
- **Logging**: View logs in Kibana (`http://localhost:5601`), use index pattern `nestjs-logs-*`. Logs include correlation IDs for tracing requests.
- **Monitoring**: View metrics in Prometheus (`http://localhost:9090`) and dashboards in Grafana (`http://localhost:3003`). Custom metrics include request rate, error rate, and latency.

## Scalability and Availability
- **Tracing**:
  - Jaeger uses Elasticsearch as backend for long-term storage.
  - Configurable sampling rate in OpenTelemetry to handle high load.
- **Logging**:
  - ELK stack with correlation IDs for request tracing.
  - Ready to integrate with Kafka for log buffering in production.
- **Monitoring**:
  - Prometheus and Grafana with custom metrics (request rate, error rate, latency).
  - Ready for Prometheus Federation and long-term storage with Thanos/Cortex.
- **General**:
  - Designed for Kubernetes deployment with sidecar patterns for tracing and logging.
  - Health checks and retries in microservices for high availability.

## Troubleshooting
- **MySQL connection error**: Ensure port `3316` is free and Docker is running.
- **RabbitMQ not connecting**: Check `http://localhost:19672` (user: `admin`, pass: `admin`).
- **JWT errors**: Verify `JWT_SECRET` and `REFRESH_TOKEN_SECRET` in `.env`.
- **503 Service Unavailable**: Check if microservices are registered in Redis (`hGetAll services` in Redis CLI).
- **Circuit Breaker Open**: Wait 30 seconds for retry or check microservice logs.
- **Jaeger no traces**: Ensure `JAEGER_URL` is correct and services are instrumented.
- **ELK no logs**: Check Logstash port (`5044`) and Elasticsearch connection.
- **Prometheus no metrics**: Ensure services expose `/metrics` endpoint.

## Contributing
Feel free to open issues or PRs on the repository (if hosted on GitHub).

## License
MIT
