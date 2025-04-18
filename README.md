# NestJS Microservices Boilerplate

A boilerplate for building microservices with NestJS, MySQL, Redis, RabbitMQ, Prisma, Docker, and Saga orchestration pattern. Implements DDD, CQRS, and Event Sourcing.

## Tech Stack
- **Framework**: NestJS
- **Database**: MySQL (Prisma ORM)
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Containerization**: Docker
- **Patterns**: DDD, CQRS, Event Sourcing, Saga Orchestration, RBAC

## Setup for Development (Running auth/product locally, dependencies in Docker)
1. Start MySQL, Redis, RabbitMQ in Docker:
   ```bash
   npm run docker:up
   ```
2. Create `.env` files:
   - `apps/auth/.env`:
     ```
     DATABASE_URL=mysql://user:password@localhost:3306/auth_db
     ```
   - `apps/product/.env`:
     ```
     DATABASE_URL=mysql://user:password@localhost:3306/product_db
     ```
   - `.env` (root):
     ```
     NODE_ENV=development
     REDIS_URL=redis://localhost:6379
     RABBITMQ_URL=amqp://admin:admin@localhost:5672
     JWT_SECRET=your_jwt_secret
     SERVICE_CACHE_TTL_IN_SECOND=3600
     ```
3. Install project dependencies:
   ```bash
   npm install
   ```
4. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Start microservices in separate terminals:
   ```bash
   npm run start:auth
   ```
   ```bash
   npm run start:product
   ```

## Setup for Production (with Docker Compose)
1. Update `docker-compose.yml` to include `auth` and `product` services.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Docker services:
   ```bash
   npm run docker:up
   ```
4. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Start microservices:
   ```bash
   npm run start:auth
   npm run start:product
   ```

## Structure
- `apps/auth`: Authentication microservice with JWT and RBAC.
- `apps/product`: Product management microservice.
- `libs/common`: Shared utilities and services.

## RabbitMQ
- Access RabbitMQ Management UI: `http://localhost:15672` (user: `admin`, pass: `admin`).
- Exchange: `appEvents` (topic type).
- Queues: `authMicroserviceQueue`, `productMicroserviceQueue`.