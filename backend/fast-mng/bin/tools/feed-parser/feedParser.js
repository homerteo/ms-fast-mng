"use strict";

const { from } = require("rxjs");
const { mergeMap, catchError } = require("rxjs/operators");
var fetch = require("node-fetch");


class FeedParserClass {
  static getSharkAttacks$(feed) {
    // Agregar timeout al fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

    return from(fetch(feed, { signal: controller.signal })).pipe(
        mergeMap(res => {
          clearTimeout(timeoutId);
          return res.json();
        }),
        mergeMap(response => from(response.results || [])),
        catchError(err => {
          clearTimeout(timeoutId);
          console.error('Feed parser error:', err.message);
          return from([]); // Devolver array vacío en caso de error
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