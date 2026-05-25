FRONTEND   -   MIDDLE-END   -   BACKEND

- We need an intermediate layer between the client side and the microservices
- Using this middle end, when client sends request we will be able to make decision that which microservice should actually respond to this request
- We can do message validation, response transformation, rate limiting
- We try to prepare an API Gateway that acts as this middle end.


<div align="center">

```
   ▄████████    ▄███████▄  ▄█         ▄████████    ▄████████     ███        ▄████████  ▄█     █▄     ▄████████ ▄██   ▄   
  ███    ███   ███    ███ ███        ███    ███   ███    ███ ▀█████████▄   ███    ███ ███     ███   ███    ███ ███   ██▄ 
  ███    ███   ███    ███ ███        ███    █▀    ███    ███    ▀███▀▀██   ███    █▀  ███     ███   ███    ███ ███▄▄▄███ 
  ███    ███   ███    ███ ███       ▄███▄▄▄      ▄███▄▄▄▄██▀     ███   ▀  ███        ███     ███   ███    ███ ▀▀▀▀▀▀███ 
▀███████████ ▀█████████▀  ███      ▀▀███▀▀▀     ▀▀███▀▀▀▀▀       ███    ▀███████████ ███     ███ ▀███████████ ▄██   ███ 
  ███    ███   ███        ███▌    ▄   ███    █▄  ▀███████████     ███             ███ ███     ███   ███    ███ ███   ███ 
  ███    ███   ███        ███    ███  ███    ███   ███    ███     ███       ▄█    ███ ███ ▄█▄ ███   ███    ███ ███   ███ 
  ███    █▀   ▄████▀      █████▄▄██  ██████████   ███    ███    ▄████▀   ▄████████▀   ▀███▀███▀    ███    █▀   ▀█████▀  
                          ▀                        ███    ███                                                            
```

# ⚡ API GATEWAY
### *The Central Nervous System of the Airline Management Microservices*

---

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![Port](https://img.shields.io/badge/Port-3006-blue?style=flat-square)
![Rate Limit](https://img.shields.io/badge/Rate%20Limit-5%20req%2F2min-orange?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-JWT-red?style=flat-square)

</div>

---

## 📡 What is the API Gateway?

The **API Gateway** is the **single entry point** for all client requests in the Airline Management System. Instead of clients talking directly to each microservice, every request flows through this gateway — which then handles authentication, rate limiting, logging, and intelligent routing to the correct downstream service.

Think of it as the **air traffic control tower** of the system.

---

## 🗺️ Request Flow Architecture

```
                         ┌──────────────────────────────────┐
                         │         CLIENT / FRONTEND         │
                         │    (Web · Mobile · Postman · cURL)│
                         └─────────────────┬────────────────┘
                                           │
                              All Requests → Port 3006
                                           │
                                           ▼
╔══════════════════════════════════════════════════════════════════╗
║                      API GATEWAY  :3006                          ║
║                                                                  ║
║   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  ║
║   │   Morgan     │  │ Rate Limiter │  │   verifyToken        │  ║
║   │  (Logging)   │→ │ 5 req/2 min  │→ │  (JWT Validation)    │  ║
║   └──────────────┘  └──────────────┘  └──────────────────────┘  ║
║                                                  │               ║
║                              ┌───────────────────┘               ║
║                              │  Path-aware Proxy Router          ║
║                              └───────────────────────────────────║
╚══════════╤══════════════╤════════════════╤════════════╤══════════╝
           │              │                │            │
           ▼              ▼                ▼            ▼
    ┌─────────────┐ ┌───────────────┐ ┌────────┐ ┌──────────┐
    │AUTH SERVICE │ │FLIGHT SERVICE │ │BOOKING │ │REMINDER  │
    │   :3001     │ │    :3000      │ │ :3002  │ │  :3005   │
    └──────┬──────┘ └───────┬───────┘ └───┬────┘ └────┬─────┘
           │                │             │            │
           ▼                ▼             ▼            ▼
         MySQL            MySQL         MySQL      RabbitMQ
        (users)          (flights)    (bookings)   (queue)
```

---

## 🔌 Port Reference

| Service | Port | Responsibility |
|:--------|:----:|:--------------|
| 🚪 **API Gateway** | **3006** | Central entry point — routes all traffic |
| 🔐 **Auth Service** | 3001 | Signup, signin, JWT generation & validation |
| ✈️ **Flight Service** | 3000 | Cities, airports, airplanes, flights |
| 🎫 **Booking Service** | 3002 | Booking creation & seat management |
| 📧 **Reminder Service** | 3005 | Email reminders via RabbitMQ |

---

## ⚙️ Gateway Configuration

```javascript
const SERVICE_URLS = {
    AUTH_SERVICE:     'http://localhost:3001',
    FLIGHT_SERVICE:   'http://localhost:3000',
    BOOKING_SERVICE:  'http://localhost:3002',
    REMINDER_SERVICE: 'http://localhost:3005',
};
```

| Config | Value |
|:-------|:------|
| Gateway Port | `3006` |
| Rate Limit Window | `2 minutes` |
| Max Requests per Window | `5 per IP` |
| Token Header | `x-access-token` |
| Auth Validation Endpoint | `GET /api/v1/isAuthenticated` |

---

## 🚦 Middleware Pipeline

Every incoming request passes through this pipeline **in order**:

```
Incoming Request
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. morgan('combined')                                           │
│     → Logs method, URL, status, response time to console        │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. express.json() + express.urlencoded()                        │
│     → Parses incoming request bodies                             │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. rateLimiter                                                  │
│     → Blocks IP if > 5 requests in 2 minutes                    │
│     → Returns 429 Too Many Requests if exceeded                  │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. verifyToken  (Protected routes only)                         │
│     → Reads x-access-token header                               │
│     → Calls Auth Service /api/v1/isAuthenticated                 │
│     → 401 if missing/invalid, next() if valid                    │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. createProxyMiddleware                                        │
│     → Forwards request to the correct downstream service        │
│     → Rewrites path using pathRewrite to preserve full URL      │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
  Downstream Service Response → Client
```

---

## 🛣️ Route Map

### 🟢 Public Routes — No Token Required

| Method | Gateway URL | Proxied To |
|:------:|:------------|:-----------|
| `POST` | `/api/v1/auth/signup` | Auth Service `:3001` |
| `POST` | `/api/v1/auth/signin` | Auth Service `:3001` |
| `GET`  | `/api/v1/auth/isAuthenticated` | Auth Service `:3001` |
| `GET`  | `/home` | Gateway Health Check |

---

### 🔴 Protected Routes — Token Required in `x-access-token` Header

#### 🔐 Auth Service `:3001`
| Method | Gateway URL | Description |
|:------:|:------------|:------------|
| `*` | `/api/v1/auth/**` | Any other auth operation |

#### ✈️ Flight Service `:3000`
| Method | Gateway URL | Description |
|:------:|:------------|:------------|
| `GET/POST/PATCH/DELETE` | `/api/v1/city/**` | City management |
| `GET/POST/PATCH/DELETE` | `/api/v1/airport/**` | Airport management |
| `GET/POST/PATCH/DELETE` | `/api/v1/airplane/**` | Airplane management |
| `GET/POST/PATCH` | `/api/v1/flight/**` | Flight management |

#### 🎫 Booking Service `:3002`
| Method | Gateway URL | Description |
|:------:|:------------|:------------|
| `GET/POST` | `/api/v1/booking/**` | Booking operations |

#### 📧 Reminder Service `:3005`
| Method | Gateway URL | Description |
|:------:|:------------|:------------|
| `GET/POST` | `/api/v1/reminder/**` | Reminder operations |

---

## 🔐 Authentication Flow

```
  Client                  API Gateway              Auth Service
    │                          │                        │
    │── POST /auth/signin ────▶│                        │
    │                          │── forwards request ───▶│
    │                          │◀── { token: "eyJ..." } ─│
    │◀────── token ────────────│                        │
    │                          │                        │
    │── GET /flight ──────────▶│                        │
    │   x-access-token: eyJ...  │                        │
    │                          │── GET /isAuthenticated ▶│
    │                          │   x-access-token: eyJ... │
    │                          │◀── { success: true } ───│
    │                          │                        │
    │                          │── proxy to Flight Svc  │
    │◀── flight data ──────────│                        │
```

---

## 📦 Installation & Setup

### Prerequisites

```
Node.js  ≥ 14.x
npm      ≥ 6.x
```

### Install Dependencies

```bash
cd API-Gateway
npm install
```

### Required npm Packages

```bash
npm install express morgan http-proxy-middleware express-rate-limit axios
```

### Start the Gateway

```bash
# Development
npm run dev

# Production
npm start
```

Gateway starts at → `http://localhost:3006`

---

## 🧪 Quick Test

### Health Check
```bash
curl http://localhost:3006/home
# → { "status": "OK", "message": "API Gateway is running" }
```

### Signup
```bash
curl -X POST http://localhost:3006/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "pass123"}'
```

### Signin & Get Token
```bash
curl -X POST http://localhost:3006/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "pass123"}'
```

### Use Token on Protected Route
```bash
curl http://localhost:3006/api/v1/city/1 \
  -H "x-access-token: <your-token-here>"
```

---

## ❌ Error Reference

| HTTP Code | Message | Cause |
|:---------:|:--------|:------|
| `401` | `Unauthorized - No token provided` | Missing `x-access-token` header |
| `401` | `Unauthorized - Invalid token` | Token is expired or tampered |
| `401` | `Unauthorized - Token verification failed` | Auth Service unreachable |
| `429` | `Too many requests, please try again later.` | Rate limit exceeded |

---

## 🗂️ File Structure

```
API-Gateway/
├── index.js          ← Entry point: middleware, routes, proxy config
├── package.json
└── package-lock.json
```

---

## 🔧 Troubleshooting

| Problem | Likely Cause | Fix |
|:--------|:------------|:----|
| `401 Token verification failed` | Auth Service not running | Start Auth Service on `:3001` |
| `404 Cannot GET /id` | Path stripping issue | Ensure `pathRewrite` is set in proxy config |
| `429 Too Many Requests` | Rate limit hit | Wait 2 minutes and retry |
| `ECONNREFUSED` | Target service is down | Start the relevant microservice |
| `Port 3006 in use` | Another process using the port | `kill $(lsof -t -i:3006)` then restart |

---

<div align="center">

**✈️ API Gateway — Built for Scale, Secured by Design**

*Part of the Airline Management Microservices Suite*

</div>