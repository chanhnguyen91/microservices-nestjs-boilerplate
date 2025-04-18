# NestJS Microservices Boilerplate

A boilerplate for building microservices with NestJS, MySQL, Redis, RabbitMQ, Prisma, Docker, and Saga orchestration pattern. Implements DDD, CQRS, and Event Sourcing.

## Tech Stack
- **Framework**: NestJS
- **Database**: MySQL (Prisma ORM)
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Containerization**: Docker
- **Patterns**: DDD, CQRS, Event Sourcing, Saga Orchestration, RBAC

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Docker services:
   ```bash
   npm run docker:up
   ```
3. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```
4. Start microservices:
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
