"use strict";

const { empty, Observable, concat } = require("rxjs");
const { tap, catchError } = require("rxjs/operators");
const { ConsoleLogger } = require("@nebulae/backend-node-tools").log;

const SharkAttackCRUD = require("./SharkAttackCRUD")();
const SharkAttackES = require("./SharkAttackES")();
const SharkAttackEventConsumer = require("./SharkAttackEventConsumer")();
const DataAcess = require("./data-access/");

module.exports = {
  /**
   * domain start workflow
   */
  start$: DataAcess.start$,
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: DataAcess.start$,
  /**
   * start for getting ready workflow
   * @returns {Observable}
   */
  startForGettingReady$: empty(),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: DataAcess.stop$,
  /**
   * @returns {SharkAttackCRUD}
   */
  SharkAttackCRUD: SharkAttackCRUD,
  /**
   * CRUD request processors Map
   */
  cqrsRequestProcessorMap: SharkAttackCRUD.generateRequestProcessorMap(),
  /**
   * @returns {SharkAttackEventConsumer}
   */
  SharkAttackEventConsumer,
  /**
   * @returns {SharkAttackES}
   */
  SharkAttackES,
  /**
   * EventSoircing event processors Map
   */
  eventSourcingProcessorMap: {
    ...SharkAttackES.generateEventProcessorMap(),
    ...SharkAttackEventConsumer.generateEventProcessorMap()
  },
};
