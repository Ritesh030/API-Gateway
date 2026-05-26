const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const PORT = 3006;

const SERVICE_URLS = {
    AUTH_SERVICE: 'http://localhost:3001',
    FLIGHT_SERVICE: 'http://localhost:3000',
    BOOKING_SERVICE: 'http://localhost:3002',
    REMINDER_SERVICE: 'http://localhost:3005',
};

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 5,                  // max 5 requests per window per IP
    message: { message: 'Too many requests, please try again later.' },
});

app.use(rateLimiter);

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        const response = await axios.get(
            `${SERVICE_URLS.AUTH_SERVICE}/api/v1/auth/isAuthenticated`,
            { headers: { 'x-access-token': token } }
        );

        if (response.data.success) {
            next();
        } else {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }

    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized - Token verification failed' });
    }
};

const createProxy = (targetServiceUrl, mountPath) =>
    createProxyMiddleware({
        target: targetServiceUrl,
        changeOrigin: true,
        pathRewrite: { [`^/`]: `${mountPath}/` },
    });

app.get('/home', (req, res) => {
    return res.status(200).json({ status: 'OK', message: 'API Gateway is running' });
});

app.use('/api/v1/auth/signup', createProxy(SERVICE_URLS.AUTH_SERVICE, '/api/v1/auth/signup'));
app.use('/api/v1/auth/signin', createProxy(SERVICE_URLS.AUTH_SERVICE, '/api/v1/auth/signin'));
app.use('/api/v1/auth/isAuthenticated', createProxy(SERVICE_URLS.AUTH_SERVICE, '/api/v1/auth/isAuthenticated'));

// Auth Service
app.use('/api/v1/auth', verifyToken, createProxy(SERVICE_URLS.AUTH_SERVICE, '/api/v1/auth'));

// Flight Service
app.use('/api/v1/flight', verifyToken, createProxy(SERVICE_URLS.FLIGHT_SERVICE, '/api/v1/flight'));
app.use('/api/v1/city', verifyToken, createProxy(SERVICE_URLS.FLIGHT_SERVICE, '/api/v1/city'));
app.use('/api/v1/airport', verifyToken, createProxy(SERVICE_URLS.FLIGHT_SERVICE, '/api/v1/airport'));
app.use('/api/v1/airplane', verifyToken, createProxy(SERVICE_URLS.FLIGHT_SERVICE, '/api/v1/airplane'));

// Booking Service
app.use('/api/v1/booking', verifyToken, createProxy(SERVICE_URLS.BOOKING_SERVICE, '/api/v1/booking'));

// Reminder Service
app.use('/api/v1/reminder', verifyToken, createProxy(SERVICE_URLS.REMINDER_SERVICE, '/api/v1/reminder'));

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});