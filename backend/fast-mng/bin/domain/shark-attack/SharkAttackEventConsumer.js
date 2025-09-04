"use strict";

const { of, from } = require("rxjs");
const { mergeMap, tap, catchError, delay, retryWhen, take } = require("rxjs/operators");
const { ConsoleLogger } = require("@nebulae/backend-node-tools").log;

const SharkAttackDA = require("./data-access/SharkAttackDA");
const eventSourcing = require("@nebulae/backend-node-tools").eventSourcing;

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
   * Generates and returns an object that defines the Event Consumer handlers.
   */
  generateEventProcessorMap() {
    return {
      SharkAttack: {
        SharkAttackReported: {
          fn: instance.handleSharkAttackReported$,
          instance,
          processOnlyOnSync: false, // Procesar en tiempo real
        },
      },
    };
  }

  /**
   * Handle SharkAttackReported events with idempotency
   * @param {Object} event The event to process
   */
  handleSharkAttackReported$(event) {
    const { etv, aid, av, data, user, timestamp } = event;
    const eventId = `${aid}-${timestamp}`; // Unique identifier for idempotency
    
    ConsoleLogger.i(`[CONSUMER] Processing SharkAttackReported event: ${eventId}`);

    // ✅ Idempotency check - Skip if already processed
    if (this.isEventAlreadyProcessed(eventId)) {
      ConsoleLogger.i(`[CONSUMER] Event ${eventId} already processed, skipping...`);
      return of(null);
    }

    return this.saveSharkAttackToDatabase$(aid, data, user).pipe(
      tap(() => {
        // ✅ Mark event as processed for idempotency
        this.markEventAsProcessed(eventId);
        ConsoleLogger.i(`[CONSUMER] Successfully processed event ${eventId}`);
      }),
      retryWhen(errors => 
        errors.pipe(
          tap(err => ConsoleLogger.e(`[CONSUMER] Error processing event ${eventId}, retrying...`, err)),
          delay(1000), // Wait 1 second before retry
          take(3) // Retry max 3 times
        )
      ),
      catchError(err => {
        ConsoleLogger.e(`[CONSUMER] Failed to process event ${eventId} after retries:`, err);
        // En un sistema real, aquí enviarías el evento a una Dead Letter Queue
        return of(null);
      })
    );
  }

  /**
   * Save shark attack to database
   * @param {string} aggregateId 
   * @param {Object} attackData 
   * @param {string} user 
   */
  saveSharkAttackToDatabase$(aggregateId, attackData, user) {
    ConsoleLogger.i(`[CONSUMER] Attempting to save SharkAttack ${aggregateId} to database`);
    
    // ✅ Database-level idempotency check
    return SharkAttackDA.findSharkAttackById$(aggregateId).pipe(
      mergeMap(existingAttack => {
        if (existingAttack) {
          ConsoleLogger.i(`[CONSUMER] SharkAttack ${aggregateId} already exists in database, skipping creation`);
          return of(existingAttack);
        }

        // Create new shark attack
        ConsoleLogger.i(`[CONSUMER] Creating new SharkAttack ${aggregateId} in database`);
        return SharkAttackDA.createSharkAttack$(aggregateId, attackData, user).pipe(
          tap(createdAttack => 
            ConsoleLogger.i(`[CONSUMER] SharkAttack ${aggregateId} successfully saved to database`)
          )
        );
      }),
      catchError(err => {
        ConsoleLogger.e(`[CONSUMER] Error saving SharkAttack ${aggregateId} to database:`, err);
        throw err; // Re-throw to trigger retry logic
      })
    );
  }

  /**
   * ✅ Idempotency methods
   */
  isEventAlreadyProcessed(eventId) {
    return this.processedEvents.has(eventId);
  }

  markEventAsProcessed(eventId) {
    this.processedEvents.add(eventId);
    
    // ✅ Cleanup old entries to avoid memory leaks
    if (this.processedEvents.size > 10000) {
      const entries = Array.from(this.processedEvents);
      this.processedEvents.clear();
      // Keep only the last 5000 entries
      entries.slice(-5000).forEach(id => this.processedEvents.add(id));
      ConsoleLogger.i(`[CONSUMER] Cleaned up processed events cache, kept last 5000 entries`);
    }
  }

  /**
   * Stop the consumer
   */
  stop() {
    ConsoleLogger.i("SharkAttackEventConsumer: Stopping event consumer...");
    this.processedEvents.clear();
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