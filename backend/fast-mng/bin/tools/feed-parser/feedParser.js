"use strict";

const { from } = require("rxjs");
const { mergeMap, catchError } = require("rxjs/operators");
const fetch = require("node-fetch");


class FeedParserClass {
  static getSharkAttacks$(feed) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    return from(fetch(feed, { signal: controller.signal })).pipe(
        mergeMap(res => {
          clearTimeout(timeoutId);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        }),
        // Se devuelve la estructura completa
        catchError(err => {
          clearTimeout(timeoutId);
          console.error('Feed parser error:', err.message);
          return from([{ results: [] }]); // Devolver estructura consistente
        })
    )
  }

  static parserFeed$(feed) {
    return this.getSharkAttacks$(feed);
  }
}

/**
 * @returns {FeedParserClass}
 */
module.exports = FeedParserClass;