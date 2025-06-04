// services/rabbitmq.js
const { responseFormat } = require('../libs/formatResponse.js')
const { throwError } = require('../libs/errorService.js');
const appConfig = require('../../configLoader'); // Adjust the path as necessary
const amqp = require('amqplib'); // Or your preferred RabbitMQ client library

const { host, port, username, password } = appConfig.RabbitMQ || {}

console.log(`RabbitMQ Config: host=${host}, port=${port}, username=${username}, password=${password}`);

let connection = null;
let channel = null;

// --- Connection and Channel Management ---
async function connectRabbitMQ() {
    try {
        if (connection && !connection.isClosed()) {
            console.log('RabbitMQ connection already established.');
            return;
        }

        console.log('Attempting to connect to RabbitMQ...');
        // Use environment variables for connection details - crucial for Docker
        // const rabbitmqHost = host; // Default to 'rabbitmq' service name
        // const rabbitmqPort = port;
        // const rabbitmqUser = username;
        // const rabbitmqPass = password;

        connection = await amqp.connect(`amqp://${username}:${password}@${host}:${port}`);
        channel = await connection.createChannel();

        console.log('Successfully connected to RabbitMQ and created channel.');

        connection.on('close', (err) => {
            console.error('RabbitMQ connection closed!', err ? err.message : '');
            // Implement robust reconnection logic here (e.g., using a backoff strategy)
            setTimeout(connectRabbitMQ, 5000); // Simple retry after 5 seconds
        });

        connection.on('error', (err) => {
            console.error('RabbitMQ connection error:', err);
            // The 'close' event typically follows an 'error' event, so reconnection handles there
        });

    } catch (error) {
        setTimeout(connectRabbitMQ, 5000); // Retry connection after 5 seconds
        throw throwError(error, 'connectRabbitMQ');
    }
}

function getChannel() {
    if (!channel) {
        throw new Error('RabbitMQ channel not established. Call connectRabbitMQ first.');
    }
    return channel;
}

// --- Message Publishing ---
async function publishMessage(exchange, routingKey, message) {
    if (!channel) {
        // If publish is called before connection, try to connect
        await channel.assertExchange(exchange, 'topic', { durable: true });
        if (!channel) throw new Error('Could not establish RabbitMQ channel for publishing.');
    }

    // Ensure the exchange exists (optional, depends on your messaging pattern)
    await channel.assertExchange(exchange, 'topic', { durable: true });

    // Send the message
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`Message published to exchange '${exchange}' with routing key '${routingKey}':`, message);
}
// --- Message Consuming ---
async function consumeMessages(queue, handlerFunction, exchange = '', bindingKey = '') {
    if (!channel) {
        await connectRabbitMQ();
        if (!channel) throw new Error('Could not establish RabbitMQ channel for consuming.');
    }

    await channel.assertQueue(queue, { durable: true }); // Ensure queue exists

    if (exchange && bindingKey) {
        // Assert the exchange and bind the queue to it with the specific routing key
        await channel.assertExchange(exchange, 'topic', { durable: true }); // <--- Ensure this matches your publisher's exchange type
        await channel.bindQueue(queue, exchange, bindingKey);
        console.log(`Queue '${queue}' bound to exchange '${exchange}' with key '${bindingKey}'.`);
    }

    await channel.prefetch(1);

    console.log(`[*] Waiting for messages in queue '${queue}'. To exit, press CTRL+C`);

    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            try {
                const content = JSON.parse(msg.content.toString());
                console.log(`[x] Received message from '${queue}':`, content);
                await handlerFunction(content);
                channel.ack(msg);
            } catch (error) {
                console.error(`Error processing message from queue '${queue}':`, error);
                channel.nack(msg, false, false);
            }
        }
    }, {
        noAck: false
    });
}


module.exports = {
    connectRabbitMQ,
    getChannel,
    publishMessage,
    consumeMessages,
};