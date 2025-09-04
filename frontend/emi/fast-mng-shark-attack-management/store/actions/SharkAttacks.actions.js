import { defer } from "rxjs";
import { mergeMap, map } from "rxjs/operators";

import graphqlService from "../../../../services/graphqlService";
import {
  FastMngSharkAttackListing,
  FastMngDeleteSharkAttack,
  FastMngImportSharkAttack,
  FastMngImportByCountrySharkAttack,
} from "../../gql/SharkAttack";

export const SET_SHARK_ATTACKS = "[SHARK_ATTACK_MNG] SET SHARK_ATTACKS";
export const SET_SHARK_ATTACKS_PAGE =
  "[SHARK_ATTACK_MNG] SET SHARK_ATTACKS PAGE";
export const SET_SHARK_ATTACKS_ROWS_PER_PAGE =
  "[SHARK_ATTACK_MNG] SET SHARK_ATTACKS ROWS PER PAGE";
export const SET_SHARK_ATTACKS_ORDER =
  "[SHARK_ATTACK_MNG] SET SHARK_ATTACKS ORDER";
export const SET_SHARK_ATTACKS_FILTERS_ORGANIZATION_ID =
  "[SHARK_ATTACK_MNG] SET SHARK_ATTACKS FILTERS ORGANIZATION_ID";
export const SET_SHARK_ATTACKS_FILTERS_NAME =
  "[SHARK_ATTACK_MNG] SET SHARK_ATTACKS FILTERS NAME";
export const SET_SHARK_ATTACKS_FILTERS_ACTIVE =
  "[SHARK_ATTACK_MNG] SET SHARK_ATTACKS FILTERS ACTIVE";
export const SET_LOADING = "[SHARK_ATTACK_MNG] SET SHARK_LOADING";
export const SET_SHARK_ATTACK_STATISTICS = "[SHARK_ATTACK_MNG] SET SHARK_ATTACK_STATISTICS";
export const SET_STATISTICS_LOADING = "[SHARK_ATTACK_MNG] SET STATISTICS_LOADING";

/**
 * Common function to generate the arguments for the FastMngSharkAttackListing query based on the user input
 * @param {Object} queryParams
 */
function getListingQueryArguments({
  filters: { name, organizationId, active },
  order,
  page,
  rowsPerPage,
}) {
  const args = {
    filterInput: { organizationId },
    paginationInput: {
      page: page,
      count: rowsPerPage,
      queryTotalResultCount: page === 0,
    },
    sortInput: order.id
      ? { field: order.id, asc: order.direction === "asc" }
      : undefined,
  };
  if (name.trim().length > 0) {
    args.filterInput.name = name;
  }
  if (active !== null) {
    args.filterInput.active = active;
  }
  return args;
}

/**
 * Queries the SharkAttack Listing based on selected filters, page and order
 * @param {{ filters, order, page, rowsPerPage }} queryParams
 */
export function getSharkAttacks({ filters, order, page, rowsPerPage }) {
  const args = getListingQueryArguments({ filters, order, page, rowsPerPage });
  return (dispatch) =>
    graphqlService.client
      .query(FastMngSharkAttackListing(args))
      .then((result) => {
        return dispatch({
          type: SET_SHARK_ATTACKS,
          payload: result.data.FastMngSharkAttackListing,
        });
      });
}

/**
 * Executes the mutation to remove the selected rows
 * @param {*} selectedForRemovalIds
 * @param {*} param1
 */
export function removeSharkAttacks(
  selectedForRemovalIds,
  { filters, order, page, rowsPerPage }
) {
  const deleteArgs = { ids: selectedForRemovalIds };
  const listingArgs = getListingQueryArguments({
    filters,
    order,
    page,
    rowsPerPage,
  });
  return (dispatch) =>
    defer(() =>
      graphqlService.client.mutate(FastMngDeleteSharkAttack(deleteArgs))
    )
      .pipe(
        mergeMap(() =>
          defer(() =>
            graphqlService.client.query(FastMngSharkAttackListing(listingArgs))
          )
        ),
        map((result) =>
          dispatch({
            type: SET_SHARK_ATTACKS,
            payload: result.data.FastMngSharkAttackListing,
          })
        )
      )
      .toPromise();
}

/**
 * Executes the mutation to import shark attacks
 */
export function importSharkAttack({ filters, order, page, rowsPerPage }) {
  const importArgs = { input: { limit: 50 } };
  const listingArgs = getListingQueryArguments({
    filters,
    order,
    page,
    rowsPerPage,
  });
  return (dispatch) =>
    defer(() =>
      graphqlService.client.mutate(FastMngImportSharkAttack(importArgs))
    )
      .pipe(
        mergeMap(() =>
          defer(() =>
            graphqlService.client.query(FastMngSharkAttackListing(listingArgs))
          )
        ),
        map((result) =>
          dispatch({
            type: SET_SHARK_ATTACKS,
            payload: result.data.FastMngSharkAttackListing,
          })
        )
      )
      .toPromise();
}

/**
 * Executes the mutation to import shark attacks by country
 */
export function importByCountrySharkAttack(
  { filters, order, page, rowsPerPage },
  country = "EGYPT"
) {
  const whereClause = `country='${country.toUpperCase()}'`;
  const importArgs = { input: { limit: 5, where: whereClause } };
  const listingArgs = getListingQueryArguments({
    filters,
    order,
    page,
    rowsPerPage,
  });
  return (dispatch) => {
    dispatch({
      type: SET_LOADING,
      payload: true,
    });

    return defer(() =>
      graphqlService.client.mutate(
        FastMngImportByCountrySharkAttack(importArgs)
      )
    )
      .pipe(
        mergeMap(() =>
          defer(() =>
            graphqlService.client.query(FastMngSharkAttackListing(listingArgs))
          )
        ),
        map((result) =>
          dispatch({
            type: SET_SHARK_ATTACKS,
            payload: result.data.FastMngSharkAttackListing,
          })
        ),
        map(() =>
          dispatch({
            type: SET_LOADING,
            payload: false,
          })
        )
      )
      .toPromise();
  };
}

/**
 * Set the listing page
 * @param {int} page
 */
export function setSharkAttacksPage(page) {
  return {
    type: SET_SHARK_ATTACKS_PAGE,
    page,
  };
}

/**
 * Set the number of rows to see per page
 * @param {*} rowsPerPage
 */
export function setSharkAttacksRowsPerPage(rowsPerPage) {
  return {
    type: SET_SHARK_ATTACKS_ROWS_PER_PAGE,
    rowsPerPage,
  };
}

/**
 * Set the table-column order
 * @param {*} order
 */
export function setSharkAttacksOrder(order) {
  return {
    type: SET_SHARK_ATTACKS_ORDER,
    order,
  };
}

/**
 * Set the name filter
 * @param {string} name
 */
export function setSharkAttacksFilterName(name) {
  return {
    type: SET_SHARK_ATTACKS_FILTERS_NAME,
    name,
  };
}

/**
 * Set the filter active flag on/off/both
 * @param {boolean} active
 */
export function setSharkAttacksFilterActive(active) {
  return {
    type: SET_SHARK_ATTACKS_FILTERS_ACTIVE,
    active,
  };
}

/**
 * set the organizationId filter
 * @param {string} organizationId
 */
export function setSharkAttacksFilterOrganizationId(organizationId) {
  return {
    type: SET_SHARK_ATTACKS_FILTERS_ORGANIZATION_ID,
    organizationId,
  };
}

/**
 * Get shark attack statistics by processing all available data
 * @param {Object} filters - Filter parameters
 */
export function getSharkAttackStatistics(filters = {}) {
  const args = {
    filterInput: { 
      organizationId: filters.organizationId 
    },
    paginationInput: {
      page: 0,
      count: 10000, // Get all records for statistics
      queryTotalResultCount: true,
    },
  };
  
  return (dispatch) => {
    dispatch({
      type: SET_STATISTICS_LOADING,
      payload: true,
    });

    return graphqlService.client
      .query(FastMngSharkAttackListing(args))
      .then((result) => {
        const listing = result.data.FastMngSharkAttackListing.listing || [];
        
        // Calculate statistics from the data
        const statistics = calculateStatistics(listing);
        
        dispatch({
          type: SET_SHARK_ATTACK_STATISTICS,
          payload: statistics,
        });
        dispatch({
          type: SET_STATISTICS_LOADING,
          payload: false,
        });
        return statistics;
      })
      .catch((error) => {
        console.error('Error loading statistics:', error);
        dispatch({
          type: SET_STATISTICS_LOADING,
          payload: false,
        });
        throw error;
      });
  };
}

/**
 * Calculate statistics from shark attack data
 * @param {Array} data - Array of shark attack records
 * @returns {Object} Statistics object
 */
function calculateStatistics(data) {
  if (!data || data.length === 0) {
    return {
      totalAttacks: 0,
      attacksByCountry: [],
      attacksByYear: []
    };
  }

  // Total attacks
  const totalAttacks = data.length;

  // Attacks by country
  const countryMap = {};
  data.forEach(attack => {
    if (attack.country) {
      const country = attack.country.trim();
      countryMap[country] = (countryMap[country] || 0) + 1;
    }
  });

  const attacksByCountry = Object.entries(countryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // Attacks by year
  const yearMap = {};
  data.forEach(attack => {
    if (attack.year) {
      const year = parseInt(attack.year);
      if (!isNaN(year)) {
        yearMap[year] = (yearMap[year] || 0) + 1;
      }
    }
  });

  const attacksByYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  return {
    totalAttacks,
    attacksByCountry,
    attacksByYear
  };
}
