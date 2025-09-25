import express from 'express';
import cors from 'cors';
import kafka from './kafka-client.mjs';
import 'dotenv/config';
// Environment variables are now provided by Docker Compose
const port = process.env.PORT || 3000;
const topic = process.env.KAFKA_TOPIC;
console.log("Topic is", topic)
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Kafka Producer
const producer = kafka.producer();

/**
 * Main API endpoint to receive feedback.
 */
app.post('/api/feedback', async (req, res) => {
    try {
        const feedbackData = req.body;
        console.log('Received feedback submission:', feedbackData);

        if (!feedbackData.rating || !feedbackData.timestamp || !feedbackData.device_id) {
            return res.status(400).json({ message: 'Bad Request: Missing required fields.' });
        }

        await producer.send({
            topic: topic,
            messages: [
                {
                    key: feedbackData.device_id,
                    value: JSON.stringify(feedbackData),
                },
            ],
        });

        console.log(`Feedback from device ${feedbackData.device_id} sent to Kafka topic: ${topic}`);
        res.status(202).json({ message: 'Feedback accepted for processing.' });

    } catch (error) {
        console.error('Error processing feedback submission:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * Starts the server and connects the producer.
 */
const startServer = async () => {
    await producer.connect();
    console.log('Kafka Producer connected.');

    app.listen(port, () => {
        console.log(`Feedback API server listening on http://localhost:${port}`);
    });
};

startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down API server...');
    await producer.disconnect();
    console.log('Kafka Producer disconnected.');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
