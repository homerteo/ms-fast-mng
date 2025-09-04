"use strict";

const uuidv4 = require("uuid/v4");
const { of, forkJoin, from, iif, throwError, merge } = require("rxjs");
const {
  mergeMap,
  catchError,
  map,
  toArray,
  pluck,
  take,
  tap,
} = require("rxjs/operators");

const Event = require("@nebulae/event-store").Event;
const { CqrsResponseHelper } = require("@nebulae/backend-node-tools").cqrs;
const { ConsoleLogger } = require("@nebulae/backend-node-tools").log;
const { CustomError, INTERNAL_SERVER_ERROR_CODE, PERMISSION_DENIED } =
  require("@nebulae/backend-node-tools").error;
const { brokerFactory } = require("@nebulae/backend-node-tools").broker;

const broker = brokerFactory();
const eventSourcing = require("../../tools/event-sourcing").eventSourcing;
const feedParser = require("../../tools/feed-parser").FeedParser;
const SharkAttackDA = require("./data-access/SharkAttackDA");

const READ_ROLES = ["SHARK_ATTACK_READ"];
const WRITE_ROLES = ["SHARK_ATTACK_WRITE"];
const REQUIRED_ATTRIBUTES = [];
const MATERIALIZED_VIEW_TOPIC = "emi-gateway-materialized-view-updates";

const FAST_FEED_URL =
  process.env.FAST_FEED_URL ||
  "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/global-shark-attack/records";

/**
 * Singleton instance
 * @type { SharkAttackCRUD }
 */
let instance;

class SharkAttackCRUD {
  constructor() {}

  /**
   * Generates and returns an object that defines the CQRS request handlers.
   *
   * The map is a relationship of: AGGREGATE_TYPE VS { MESSAGE_TYPE VS  { fn: rxjsFunction, instance: invoker_instance } }
   *
   * ## Example
   *  { "CreateUser" : { "somegateway.someprotocol.mutation.CreateUser" : {fn: createUser$, instance: classInstance } } }
   */
  generateRequestProcessorMap() {
    return {
      SharkAttack: {
        "emigateway.graphql.query.FastMngSharkAttackListing": {
          fn: instance.getFastMngSharkAttackListing$,
          instance,
          jwtValidation: { roles: READ_ROLES, attributes: REQUIRED_ATTRIBUTES },
        },
        "emigateway.graphql.query.FastMngSharkAttack": {
          fn: instance.getSharkAttack$,
          instance,
          jwtValidation: { roles: READ_ROLES, attributes: REQUIRED_ATTRIBUTES },
        },
        "emigateway.graphql.mutation.FastMngCreateSharkAttack": {
          fn: instance.createSharkAttack$,
          instance,
          jwtValidation: {
            roles: WRITE_ROLES,
            attributes: REQUIRED_ATTRIBUTES,
          },
        },
        "emigateway.graphql.mutation.FastMngImportSharkAttack": {
          fn: instance.importSharkAttack$,
          instance,
          jwtValidation: {
            roles: WRITE_ROLES,
            attributes: REQUIRED_ATTRIBUTES,
          },
        },
        "emigateway.graphql.mutation.FastMngImportByCountrySharkAttack": {
          fn: instance.importByCountrySharkAttack$,
          instance,
          jwtValidation: {
            roles: WRITE_ROLES,
            attributes: REQUIRED_ATTRIBUTES,
          },
        },
        "emigateway.graphql.mutation.FastMngUpdateSharkAttack": {
          fn: instance.updateSharkAttack$,
          jwtValidation: {
            roles: WRITE_ROLES,
            attributes: REQUIRED_ATTRIBUTES,
          },
        },
        "emigateway.graphql.mutation.FastMngDeleteSharkAttacks": {
          fn: instance.deleteSharkAttacks$,
          jwtValidation: {
            roles: WRITE_ROLES,
            attributes: REQUIRED_ATTRIBUTES,
          },
        },
      },
    };
  }

  /**
   * Gets the SharkAttack list
   *
   * @param {*} args args
   */
  getFastMngSharkAttackListing$({ args }, authToken) {
    const { filterInput, paginationInput, sortInput } = args;
    const { queryTotalResultCount = false } = paginationInput || {};

    return forkJoin(
      SharkAttackDA.getSharkAttackList$(
        filterInput,
        paginationInput,
        sortInput
      ).pipe(toArray()),
      queryTotalResultCount
        ? SharkAttackDA.getSharkAttackSize$(filterInput)
        : of(undefined)
    ).pipe(
      map(([listing, queryTotalResultCount]) => ({
        listing,
        queryTotalResultCount,
      })),
      mergeMap((rawResponse) =>
        CqrsResponseHelper.buildSuccessResponse$(rawResponse)
      ),
      catchError((err) =>
        iif(
          () => err.name === "MongoTimeoutError",
          throwError(err),
          CqrsResponseHelper.handleError$(err)
        )
      )
    );
  }

  /**
   * Gets the get SharkAttack by id
   *
   * @param {*} args args
   */
  getSharkAttack$({ args }, authToken) {
    const { id, organizationId } = args;
    return SharkAttackDA.getSharkAttack$(id, organizationId).pipe(
      mergeMap((rawResponse) =>
        CqrsResponseHelper.buildSuccessResponse$(rawResponse)
      ),
      catchError((err) =>
        iif(
          () => err.name === "MongoTimeoutError",
          throwError(err),
          CqrsResponseHelper.handleError$(err)
        )
      )
    );
  }

  /**
   * Create a SharkAttack
   */
  createSharkAttack$({ root, args, jwt }, authToken) {
    const aggregateId = uuidv4();
    const input = {
      active: false,
      ...args.input,
    };

    return SharkAttackDA.createSharkAttack$(
      aggregateId,
      input,
      authToken.preferred_username
    ).pipe(
      mergeMap((aggregate) =>
        forkJoin(
          CqrsResponseHelper.buildSuccessResponse$(aggregate),
          eventSourcing.emitEvent$(
            instance.buildAggregateMofifiedEvent(
              "CREATE",
              "SharkAttack",
              aggregateId,
              authToken,
              aggregate
            ),
            { autoAcknowledgeKey: process.env.MICROBACKEND_KEY }
          ),
          broker.send$(
            MATERIALIZED_VIEW_TOPIC,
            `FastMngSharkAttackModified`,
            aggregate
          )
        )
      ),
      map(([sucessResponse]) => sucessResponse),
      catchError((err) =>
        iif(
          () => err.name === "MongoTimeoutError",
          throwError(err),
          CqrsResponseHelper.handleError$(err)
        )
      )
    );
  }

  /**
   * Import SharkAttacks
   */
  importSharkAttack$({ root, args, jwt }, authToken) {
    ConsoleLogger.i(
      `Importing shark attacks with args: ${JSON.stringify(args)}`
    );

    ConsoleLogger.i(`Fetching data from feed: ${FAST_FEED_URL}`);

    return feedParser.parserFeed$(FAST_FEED_URL).pipe(
      tap((feedData) => {
        ConsoleLogger.i(`Raw feedParser response: ${JSON.stringify(feedData, null, 2)}`);
      }),
      mergeMap((feedData) => {
        if (!feedData || !feedData.results) {
          ConsoleLogger.e(`Invalid feed structure: ${JSON.stringify(feedData)}`);
          return of([]);
        }

        if (feedData.results.length === 0) {
          ConsoleLogger.e(`Feed returned empty results array`);
          return of([]);
        }

        ConsoleLogger.i(`Found ${feedData.results.length} results in feed`);
        ConsoleLogger.i(`Sample result structure: ${JSON.stringify(feedData.results[0], null, 2)}`);
        
        return from(feedData.results);
      }),
      take(args.input?.limit || 3),
      map((attack) => {
        ConsoleLogger.i(
          `Processing attack: ${JSON.stringify(attack, null, 2)}`
        );
        const attackData = attack;
        ConsoleLogger.i(
          `Extracted attackData: ${JSON.stringify(attackData, null, 2)}`
        );
        const mappedAttack = {
          id: uuidv4(),
          name:
            attackData.case_number || attackData.name || attackData.date || `Attack-${uuidv4()}`,
          description: `Shark attack in ${
            attackData.location || "unknown location"
          }`,
          active: true,
          organizationId: authToken.organizationId || "default-org",
          date: attackData.date || null,
          year: attackData.year || null,
          type: attackData.type || null,
          country: attackData.country || null,
          area: attackData.area || null,
          location: attackData.location || null,
          activity: attackData.activity || null,
          sex: attackData.sex || null,
          age: attackData.age || null,
          injury: attackData.injury || null,
          fatal_y_n: attackData.fatal_y_n || null,
          time: attackData.time || null,
          species: attackData.species || null,
          investigator_or_source: attackData.investigator_or_source || null,
          pdf: attackData.pdf || null,
          href_formula: attackData.href_formula || null,
          href: attackData.href || null,
          case_number: attackData.case_number || null,
          case_number0: attackData.case_number0 || null,
          original_order: attackData.original_order || null,
        };
        ConsoleLogger.i(
          `Mapped attack: ${JSON.stringify(mappedAttack, null, 2)}`
        );
        return mappedAttack;
      }),
      mergeMap((attack) =>
        eventSourcing
          .emitEvent$(
            instance.buildSharkAttackReportedEvent(attack, authToken),
            {
              autoAcknowledgeKey: process.env.MICROBACKEND_KEY,
            }
          )
          .pipe(map(() => attack))
      ),
      toArray(),
      map((attacks) => {
        const message = `Successfully reported ${attacks.length} shark attacks via events`;
        console.log(message);
        return { code: attacks.length, message };
      }),
      mergeMap((result) => CqrsResponseHelper.buildSuccessResponse$(result)),
      catchError((err) => {
        console.error("Error in importSharkAttack$:", err);
        return CqrsResponseHelper.handleError$(err);
      })
    );
  }

  /**
   * Import SharkAttacks by country
   */
  importByCountrySharkAttack$({ root, args, jwt }, authToken) {
    const limit = args.input?.limit || 5;
    const whereClause = args.input?.where || "";
    const params = new URLSearchParams();
    if (whereClause) {
      params.append("where", whereClause);
    }
    params.append("limit", limit.toString());

    const feedUrl = `${FAST_FEED_URL}?${params.toString()}`;

    ConsoleLogger.i(`Fetching data from feed: ${feedUrl}`);

    return feedParser.parserFeed$(feedUrl).pipe(
      tap((feedData) => {
        ConsoleLogger.i(`Country feed response: ${JSON.stringify(feedData, null, 2)}`);
      }),
      mergeMap((feedData) => {
        if (!feedData || !feedData.results || feedData.results.length === 0) {
          ConsoleLogger.i(`No results found for country filter`);
          return of([]);
        }
        return from(feedData.results);
      }),
      take(args.input?.limit || 3),
      map((attack) => {
        ConsoleLogger.i(
          `Processing country attack: ${JSON.stringify(attack, null, 2)}`
        );
        // ✅ Los datos vienen directamente en el objeto attack
        const attackData = attack; // Ya no necesitamos .record.fields
        ConsoleLogger.i(
          `Extracted country attackData: ${JSON.stringify(attackData, null, 2)}`
        );
        const mappedAttack = {
          id: uuidv4(),
          name:
            attackData.case_number || attackData.name || attackData.date || `Attack-${uuidv4()}`,
          description: `Shark attack in ${
            attackData.location || "unknown location"
          }`,
          active: true,
          organizationId: authToken.organizationId || "default-org",
          date: attackData.date || null,
          year: attackData.year || null,
          type: attackData.type || null,
          country: attackData.country || null,
          area: attackData.area || null,
          location: attackData.location || null,
          activity: attackData.activity || null,
          sex: attackData.sex || null,
          age: attackData.age || null,
          injury: attackData.injury || null,
          fatal_y_n: attackData.fatal_y_n || null,
          time: attackData.time || null,
          species: attackData.species || null,
          investigator_or_source: attackData.investigator_or_source || null,
          pdf: attackData.pdf || null,
          href_formula: attackData.href_formula || null,
          href: attackData.href || null,
          case_number: attackData.case_number || null,
          case_number0: attackData.case_number0 || null,
          original_order: attackData.original_order || null,
        };
        ConsoleLogger.i(
          `Mapped country attack: ${JSON.stringify(mappedAttack, null, 2)}`
        );
        return mappedAttack;
      }),
      mergeMap((attack) =>
        eventSourcing
          .emitEvent$(
            instance.buildSharkAttackReportedEvent(attack, authToken),
            {
              autoAcknowledgeKey: process.env.MICROBACKEND_KEY,
            }
          )
          .pipe(map(() => attack))
      ),
      toArray(),
      map((attacks) => {
        const message = `Successfully reported ${attacks.length} shark attacks via events`;
        ConsoleLogger.i(message);
        return { code: attacks.length, message };
      }),
      mergeMap((result) => CqrsResponseHelper.buildSuccessResponse$(result)),
      catchError((err) => {
        ConsoleLogger.e(`Import error: ${err.message}`);
        return CqrsResponseHelper.handleError$(err);
      })
    );
  }

  /**
   * updates an SharkAttack
   */
  updateSharkAttack$({ root, args, jwt }, authToken) {
    const { id, input, merge } = args;

    return (
      merge
        ? SharkAttackDA.updateSharkAttack$
        : SharkAttackDA.replaceSharkAttack$
    )(id, input, authToken.preferred_username).pipe(
      mergeMap((aggregate) =>
        forkJoin(
          CqrsResponseHelper.buildSuccessResponse$(aggregate),
          eventSourcing.emitEvent$(
            instance.buildAggregateMofifiedEvent(
              merge ? "UPDATE_MERGE" : "UPDATE_REPLACE",
              "SharkAttack",
              id,
              authToken,
              aggregate
            ),
            { autoAcknowledgeKey: process.env.MICROBACKEND_KEY }
          ),
          broker.send$(
            MATERIALIZED_VIEW_TOPIC,
            `FastMngSharkAttackModified`,
            aggregate
          )
        )
      ),
      map(([sucessResponse]) => sucessResponse),
      catchError((err) =>
        iif(
          () => err.name === "MongoTimeoutError",
          throwError(err),
          CqrsResponseHelper.handleError$(err)
        )
      )
    );
  }

  /**
   * deletes an SharkAttack
   */
  deleteSharkAttacks$({ root, args, jwt }, authToken) {
    const { ids } = args;
    return forkJoin(
      SharkAttackDA.deleteSharkAttacks$(ids),
      from(ids).pipe(
        mergeMap((id) =>
          eventSourcing.emitEvent$(
            instance.buildAggregateMofifiedEvent(
              "DELETE",
              "SharkAttack",
              id,
              authToken,
              {}
            ),
            { autoAcknowledgeKey: process.env.MICROBACKEND_KEY }
          )
        ),
        toArray()
      )
    ).pipe(
      map(([ok, esResps]) => ({
        code: ok ? 200 : 400,
        message: `SharkAttack with id:s ${JSON.stringify(ids)} ${
          ok ? "has been deleted" : "not found for deletion"
        }`,
      })),
      mergeMap((r) =>
        forkJoin(
          CqrsResponseHelper.buildSuccessResponse$(r),
          broker.send$(MATERIALIZED_VIEW_TOPIC, `FastMngSharkAttackModified`, {
            id: "deleted",
            name: "",
            active: false,
            description: "",
          })
        )
      ),
      map(([cqrsResponse, brokerRes]) => cqrsResponse),
      catchError((err) =>
        iif(
          () => err.name === "MongoTimeoutError",
          throwError(err),
          CqrsResponseHelper.handleError$(err)
        )
      )
    );
  }

  /**
   * Generate an Modified event
   * @param {string} modType 'CREATE' | 'UPDATE' | 'DELETE'
   * @param {*} aggregateType
   * @param {*} aggregateId
   * @param {*} authToken
   * @param {*} data
   * @returns {Event}
   */
  buildAggregateMofifiedEvent(
    modType,
    aggregateType,
    aggregateId,
    authToken,
    data
  ) {
    return new Event({
      eventType: `${aggregateType}Modified`,
      eventTypeVersion: 1,
      aggregateType: aggregateType,
      aggregateId,
      data: {
        modType,
        ...data,
      },
      user: authToken.preferred_username,
    });
  }

  /**
   * Builds a SharkAttackReported event
   * @param {Object} attack SharkAttack object
   * @param {Object} authToken Auth token object
   * @returns {Event} Event object
   */
  buildSharkAttackReportedEvent(attack, authToken) {
    return new Event({
      eventType: "SharkAttackReported",
      eventTypeVersion: 1,
      aggregateType: "SharkAttack",
      aggregateId: attack.id,
      data: attack,
      user: authToken.preferred_username,
      timestamp: Date.now(),
    });
  }
}
/**
 * @returns {SharkAttackCRUD}
 */
module.exports = () => {
  if (!instance) {
    instance = new SharkAttackCRUD();
    ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
