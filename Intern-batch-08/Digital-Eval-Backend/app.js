require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Require DB configuration to establish connection on startup
require('./config/database');
const { errorHandler } = require('./middlewares/errorMiddleware');
const v1Router = require('./routes/v1');
const cronService = require('./services/cronService');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route for Azure Health Probes
app.get('/', (req, res) => {
    res.status(200).send('Digital Evaluation Platform API is running 🚀');
});

// Main App Routes
app.use('/api/v1', v1Router);

app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is up and connected' });
});

// Only explicitly serve Swagger documentation if outside of production
if (process.env.NODE_ENV !== 'production') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require('./swagger_output.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Centralized error handler logic attached at the end of routing
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    if (process.env.ENABLE_CRON === 'true') {
        cronService.start();
    }
});

// Graceful shutdown handler for cloud environments (like Azure)
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed. Process exiting.');
        process.exit(0);
    });
});
