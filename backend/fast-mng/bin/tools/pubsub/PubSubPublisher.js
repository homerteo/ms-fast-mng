"use strict";

const { PubSub } = require('@google-cloud/pubsub');
const { of, from } = require("rxjs");
const { tap, catchError } = require("rxjs/operators");
const { ConsoleLogger } = require("@nebulae/backend-node-tools").log;

/**
 * Singleton instance
 * @type { PubSubPublisher }
 */
let instance;

class PubSubPublisher {
  constructor() {
    this.pubsub = new PubSub({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'nebulae-lab',
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    this.topicName = process.env.PUBSUB_TOPIC_NAME || 'neb-university-mateo';
    this.topic = null;
    this.initialized = false;
  }

  /**
   * Initialize the topic
   */
  async initializeTopic() {
    if (this.initialized) return;
    
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      if (isDevelopment) {
        ConsoleLogger.i(`[PUBSUB] Running in development mode - simulating topic: ${this.topicName}`);
        this.topic = { 
          publishMessage: async (message) => {
            ConsoleLogger.i(`[PUBSUB] [MOCK] Would publish message to ${this.topicName}:`, JSON.stringify(JSON.parse(message.data.toString()), null, 2));
            return `mock-message-id-${Date.now()}`;
          }
        };
        this.initialized = true;
        return;
      }

      const [topic] = await this.pubsub.topic(this.topicName).get({ autoCreate: true });
      this.topic = topic;
      this.initialized = true;
      ConsoleLogger.i(`[PUBSUB] Topic initialized: ${this.topicName} in project: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
    } catch (error) {
      ConsoleLogger.e(`[PUBSUB] Error initializing topic: ${error.message}`);
      // Fallback to mock mode on error
      ConsoleLogger.i(`[PUBSUB] Falling back to mock mode due to error`);
      this.topic = { 
        publishMessage: async (message) => {
          ConsoleLogger.i(`[PUBSUB] [FALLBACK] Would publish message to ${this.topicName}:`, JSON.stringify(JSON.parse(message.data.toString()), null, 2));
          return `fallback-message-id-${Date.now()}`;
        }
      };
      this.initialized = true;
    }
  }

  /**
   * Publish shark attack event to Pub/Sub
   * @param {Object} sharkAttackData The shark attack data to publish
   * @param {string} eventType The type of event (e.g., 'SharkAttackProcessed')
   */
  publishSharkAttackEvent$(sharkAttackData, eventType = 'SharkAttackProcessed') {
    return from(this.publishEvent(sharkAttackData, eventType)).pipe(
      tap(messageId => 
        ConsoleLogger.i(`[PUBSUB] Message published: ${messageId} for shark attack: ${sharkAttackData.id}`)
      ),
      catchError(err => {
        ConsoleLogger.e(`[PUBSUB] Error publishing message: ${err.message}`);
        return of(null); // Continue processing even if Pub/Sub fails
      })
    );
  }

  /**
   * Internal method to publish event
   */
  async publishEvent(sharkAttackData, eventType) {
    if (!this.initialized) {
      await this.initializeTopic();
    }

    const message = {
      eventType,
      timestamp: new Date().toISOString(),
      source: 'fast-mng-shark-attack-management',
      data: {
        id: sharkAttackData.id,
        name: sharkAttackData.name || '',
        country: sharkAttackData.country || '',
        location: sharkAttackData.location || '',
        date: sharkAttackData.date || '',
        year: sharkAttackData.year || '',
        activity: sharkAttackData.activity || '',
        injury: sharkAttackData.injury || '',
        fatal: sharkAttackData.fatal || '',
        species: sharkAttackData.species || '',
        processedAt: new Date().toISOString()
      }
    };

    const dataBuffer = Buffer.from(JSON.stringify(message));
    const messageId = await this.topic.publishMessage({ 
      data: dataBuffer,
      attributes: {
        eventType: eventType,
        source: 'fast-mng',
        version: '1.0'
      }
    });
    
    return messageId;
  }
}

/**
 * @returns {PubSubPublisher}
 */
module.exports = () => {
  if (!instance) {
    instance = new PubSubPublisher();
    ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};