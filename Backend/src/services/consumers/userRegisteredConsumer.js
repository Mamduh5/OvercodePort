// src/consumers/userRegisteredConsumer.js
const { throwError } = require('../../libs/errorService.js');

async function handleUserRegisteredEvent(messagePayload) {
    try{
    console.log('[UserConsumer] Received user registered event:', messagePayload);
    // Your specific business logic for user registration events
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate async work
    console.log(`[UserConsumer] Finished processing user registration for: ${messagePayload.email}`);

    } catch (error) {
        throw throwError(error, 'handleUserRegisteredEvent');
    }
}

module.exports = {
    queue: 'email_welcome_queue',
    exchange: 'user_events',
    bindingKey: 'user.registered',
    handler: handleUserRegisteredEvent,
};