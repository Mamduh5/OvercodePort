// src/consumers/adminCreatedConsumer.js
const { throwError } = require('../../libs/errorService.js');

async function handleAdminCreatedEvent(messagePayload) {
    try {
    console.log('[AdminConsumer] Received admin created event:', messagePayload);
    // Your specific business logic for admin creation events
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async work
    console.log(`[AdminConsumer] Finished processing admin creation for: ${messagePayload.name}`);

    } catch (error) {
    throw throwError(error, 'handleAdminCreatedEvent');
    }
}

module.exports = {
    // This is the metadata/config for this specific consumer
    queue: 'admin_notification_queue',
    exchange: 'admin_events',
    bindingKey: 'admin.created',
    handler: handleAdminCreatedEvent,
};