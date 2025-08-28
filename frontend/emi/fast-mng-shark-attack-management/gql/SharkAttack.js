import { gql } from "apollo-boost";

export const FastMngSharkAttackListing = (variables) => ({
  query: gql`
    query FastMngSharkAttackListing(
      $filterInput: FastMngSharkAttackFilterInput
      $paginationInput: FastMngSharkAttackPaginationInput
      $sortInput: FastMngSharkAttackSortInput
    ) {
      FastMngSharkAttackListing(
        filterInput: $filterInput
        paginationInput: $paginationInput
        sortInput: $sortInput
      ) {
        listing {
          id
          name
          active
          organizationId
          date
          year
          type
          country
          area
          location
          activity
          sex
          age
          injury
          fatal_y_n
          time
          species
          investigator_or_source
          pdf
          href_formula
          href
          case_number
          case_number0
        }
        queryTotalResultCount
      }
    }
  `,
  variables,
  fetchPolicy: "network-only",
});

export const FastMngSharkAttack = (variables) => ({
  query: gql`
    query FastMngSharkAttack($id: ID!, $organizationId: String!) {
      FastMngSharkAttack(id: $id, organizationId: $organizationId) {
        id
        name
        description
        active
        organizationId
        date
        year
        type
        country
        area
        location
        activity
        sex
        age
        injury
        fatal_y_n
        time
        species
        investigator_or_source
        pdf
        href_formula
        href
        case_number
        case_number0
        metadata {
          createdBy
          createdAt
          updatedBy
          updatedAt
        }
      }
    }
  `,
  variables,
  fetchPolicy: "network-only",
});

export const FastMngCreateSharkAttack = (variables) => ({
  mutation: gql`
    mutation FastMngCreateSharkAttack($input: FastMngSharkAttackInput!) {
      FastMngCreateSharkAttack(input: $input) {
        id
        name
        description
        active
        organizationId
        date
        year
        type
        country
        area
        location
        activity
        sex
        age
        injury
        fatal_y_n
        time
        species
        investigator_or_source
        pdf
        href_formula
        href
        case_number
        case_number0
        metadata {
          createdBy
          createdAt
          updatedBy
          updatedAt
        }
      }
    }
  `,
  variables,
});

export const FastMngImportSharkAttack = (variables) => ({
  mutation: gql`
    mutation FastMngImportSharkAttack($input: FastMngSharkAttackImportInput!) {
      FastMngImportSharkAttack(input: $input) {
        code
        message
      }
    }
  `,
  variables,
});

export const FastMngImportByCountrySharkAttack = (variables) => ({
  mutation: gql`
    mutation FastMngImportByCountrySharkAttack($input: FastMngSharkAttackByCountryInput!) {
      FastMngImportByCountrySharkAttack(input: $input) {
        code
        message
      }
    }
  `,
  variables,
});

export const FastMngDeleteSharkAttack = (variables) => ({
  mutation: gql`
    mutation FastMngSharkAttackListing($ids: [ID]!) {
      FastMngDeleteSharkAttacks(ids: $ids) {
        code
        message
      }
    }
  `,
  variables,
});

export const FastMngUpdateSharkAttack = (variables) => ({
  mutation: gql`
    mutation FastMngUpdateSharkAttack(
      $id: ID!
      $input: FastMngSharkAttackInput!
      $merge: Boolean!
    ) {
      FastMngUpdateSharkAttack(id: $id, input: $input, merge: $merge) {
        id
        organizationId
        name
        description
        active
        date
        year
        type
        country
        area
        location
        activity
        sex
        age
        injury
        fatal_y_n
        time
        species
        investigator_or_source
        pdf
        href_formula
        href
        case_number
        case_number0
      }
    }
  `,
  variables,
});

export const onFastMngSharkAttackModified = (variables) => [
  gql`
    subscription onFastMngSharkAttackModified($id: ID!) {
      FastMngSharkAttackModified(id: $id) {
        id
        organizationId
        name
        description
        active
        date
        year
        type
        country
        area
        location
        activity
        sex
        age
        injury
        fatal_y_n
        time
        species
        investigator_or_source
        pdf
        href_formula
        href
        case_number
        case_number0
        metadata {
          createdBy
          createdAt
          updatedBy
          updatedAt
        }
        metadata {
          createdBy
          createdAt
          updatedBy
          updatedAt
        }
      }
    }
  `,
  { variables },
];
