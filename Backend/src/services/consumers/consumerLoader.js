// src/consumers/consumerLoader.js
const { throwError } = require('../../libs/errorService.js');

const fs = require('fs');
const path = require('path');
const rabbitMQService = require('../rabbitmq.js'); // Adjust path as necessary

const CONSUMERS_DIR = __dirname; // This means the directory where this file is located

async function loadAndStartConsumers() {
    try{
    console.log('Loading and starting RabbitMQ consumers...');

    const files = fs.readdirSync(CONSUMERS_DIR);

    for (const file of files) {
        if (file.endsWith('.js') && file !== 'consumerLoader.js') { // Exclude this file itself
            const consumerPath = path.join(CONSUMERS_DIR, file);
            try {
                const consumerModule = require(consumerPath);

                // Ensure the module exports the necessary properties
                if (consumerModule.queue && consumerModule.handler) {
                    await rabbitMQService.consumeMessages(
                        consumerModule.queue,
                        consumerModule.handler,
                        consumerModule.exchange || '', // Pass empty string if no exchange
                        consumerModule.bindingKey || '' // Pass empty string if no bindingKey
                    );
                    console.log(`- Started consumer: ${file} (Queue: ${consumerModule.queue})`);
                } else {
                    console.warn(`- Skipping ${file}: Missing 'queue' or 'handler' export.`);
                }
            } catch (error) {
                console.error(`- Error loading or starting consumer ${file}:`, error);
            }
        }
    }
    console.log('Finished loading and starting RabbitMQ consumers.');

    } catch (error) {
        throw throwError(error, 'loadAndStartConsumers');
    }
}

module.exports = {
    loadAndStartConsumers,
};