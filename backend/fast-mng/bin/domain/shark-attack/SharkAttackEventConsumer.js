"use strict";

const { of, forkJoin } = require("rxjs");
const { mergeMap, tap, catchError, delay, retryWhen, take } = require("rxjs/operators");
const { ConsoleLogger } = require("@nebulae/backend-node-tools").log;

const SharkAttackDA = require("./data-access/SharkAttackDA");
const PubSubPublisher = require("../../tools/pubsub/PubSubPublisher")();

/**
 * Singleton instance
 * @type { SharkAttackEventConsumer }
 */
let instance;

class SharkAttackEventConsumer {
  constructor() {
    this.processedEvents = new Set(); // Cache para idempotencia
  }

  /**
   * Process a single SharkAttackReported event with parallel operations
   * @param {Object} event The event to process
   */
  handleSharkAttackReported$({ etv, aid, av, data, user, timestamp }) {
    const eventId = `${aid}-${timestamp}`;
    
    ConsoleLogger.i(`[CONSUMER] Processing SharkAttackReported event: ${eventId}`);

    // Idempotency check
    if (this.isEventAlreadyProcessed(eventId)) {
      ConsoleLogger.i(`[CONSUMER] Event ${eventId} already processed, skipping...`);
      return of(null);
    }

    // Parallel processing: MongoDB + Pub/Sub
    return this.processSharkAttackInParallel$(aid, data, user, eventId).pipe(
      tap(() => {
        this.markEventAsProcessed(eventId);
        ConsoleLogger.i(`[CONSUMER] Successfully processed event ${eventId} in parallel`);
      }),
      retryWhen(errors => 
        errors.pipe(
          tap(err => ConsoleLogger.e(`[CONSUMER] Error processing event ${eventId}, retrying...`, err)),
          delay(1000),
          take(3)
        )
      ),
      catchError(err => {
        ConsoleLogger.e(`[CONSUMER] Failed to process event ${eventId} after retries:`, err);
        return of(null);
      })
    );
  }

  /**
   * Process shark attack with parallel operations
   * @param {string} aggregateId 
   * @param {Object} attackData 
   * @param {string} user 
   * @param {string} eventId 
   */
  processSharkAttackInParallel$(aggregateId, attackData, user, eventId) {
    ConsoleLogger.i(`[CONSUMER] Starting parallel processing for ${eventId}`);

    // Create operations to run in parallel
    const saveToMongoDB$ = this.saveSharkAttackToDatabase$(aggregateId, attackData, user);
    const publishToPubSub$ = PubSubPublisher.publishSharkAttackEvent$(
      { id: aggregateId, ...attackData }, 
      'SharkAttackProcessed'
    );

    // Execute both operations in parallel using forkJoin
    return forkJoin({
      mongoResult: saveToMongoDB$,
      pubsubResult: publishToPubSub$
    }).pipe(
      tap(({ mongoResult, pubsubResult }) => {
        ConsoleLogger.i(`[CONSUMER] Parallel processing completed for ${eventId}:`);
        ConsoleLogger.i(`[CONSUMER] - MongoDB: ${mongoResult ? 'SUCCESS' : 'SKIPPED (already exists)'}`);
        ConsoleLogger.i(`[CONSUMER] - Pub/Sub: ${pubsubResult ? 'SUCCESS' : 'FAILED'}`);
      })
    );
  }

  /**
   * Save shark attack to database (existing logic)
   */
  saveSharkAttackToDatabase$(aggregateId, attackData, user) {
    ConsoleLogger.i(`[CONSUMER] Attempting to save SharkAttack ${aggregateId} to database`);

    return SharkAttackDA.findSharkAttackById$(aggregateId).pipe(
      mergeMap(existingAttack => {
        if (existingAttack) {
          ConsoleLogger.i(`[CONSUMER] SharkAttack ${aggregateId} already exists in database, skipping creation`);
          return of(existingAttack);
        }

        ConsoleLogger.i(`[CONSUMER] Creating new SharkAttack ${aggregateId} in database`);
        return SharkAttackDA.createSharkAttack$(aggregateId, attackData, user).pipe(
          tap(createdAttack => 
            ConsoleLogger.i(`[CONSUMER] SharkAttack ${aggregateId} successfully saved to database`)
          )
        );
      })
    );
  }

  /**
   * Idempotency methods (existing)
   */
  isEventAlreadyProcessed(eventId) {
    return this.processedEvents.has(eventId);
  }

  markEventAsProcessed(eventId) {
    this.processedEvents.add(eventId);
    
    if (this.processedEvents.size > 10000) {
      const entries = Array.from(this.processedEvents);
      this.processedEvents.clear();
      entries.slice(-5000).forEach(id => this.processedEvents.add(id));
    }
  }

  /**
   * Generate event processor map for registration
   */
  generateEventProcessorMap() {
    return {
      SharkAttack: {
        SharkAttackReported: {
          fn: this.handleSharkAttackReported$,
          instance: this,
          processOnlyOnSync: false,
        },
      },
    };
  }
}

/**
 * @returns {SharkAttackEventConsumer}
 */
module.exports = () => {
  if (!instance) {
    instance = new SharkAttackEventConsumer();
    ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};