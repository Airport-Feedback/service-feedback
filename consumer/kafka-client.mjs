import { Kafka } from 'kafkajs';
import 'dotenv/config';
/**
 * Centralized Kafka client configuration.
 * Reads broker address from environment variables.
 */
const kafka = new Kafka({
    clientId: 'feedback-kiosk-app',
    // docker-compose provides a single broker name, which we wrap in an array
    brokers: [process.env.KAFKA_BROKER],
});

export default kafka;
