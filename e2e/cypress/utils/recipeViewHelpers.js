import _ from 'lodash';

export function assertOils(oils) {
  _.each(oils, ({ oil, ratio, weight, grams }) => {
    cy
      .get(`[data-cy=recipe-comps-oil-row-name]:contains("${oil}")`).should('exist')
      .get(`[data-cy=recipe-comps-oil-row-ratio]:contains("${ratio}")`).should('exist');

    if (weight) {
      cy
        .get(`[data-cy=recipe-comps-oil-row-weight]:contains("${weight}")`).should('exist');
    }

    if (grams) {
      cy.get(`[data-cy=recipe-comps-oil-row-grams]:contains("${grams}")`).should('exist');
    }
  });
}

export function assertOilsGrams(oils) {
  _.each(oils, ({ oil, ratio, weight, grams }) => {
    cy
      .get(`[data-cy=recipe-comps-oil-row-name]:contains("${oil}")`).should('exist')
      .get(`[data-cy=recipe-comps-oil-row-ratio]:contains("${ratio}")`).should('exist');

    if (grams) {
      cy.get(`[data-cy=recipe-comps-oils-total-weight]:contains("${grams}")`).should('exist');
    }
  });
}

export function assertOilTotals({ ratio, weight, grams }) {
  cy
    .get(`[data-cy=recipe-comps-oils-total-ratio]:contains("${ratio}")`).should('exist');

  if (weight) {
    cy
      .get(`[data-cy=recipe-comps-oils-total-weight]:contains("${weight}")`).should('exist');
  }

  if (grams) {
    cy
      .get(`[data-cy=recipe-comps-oils-total-grams]:contains("${grams}")`).should('exist');
  }
}

export function assertOilTotalsGram({ ratio, grams }) {
  cy
    .get(`[data-cy=recipe-comps-oils-total-ratio]:contains("${ratio}")`).should('exist');

  if (grams) {
    cy
      .get(`[data-cy=recipe-comps-oils-total-weight]:contains("${grams}")`).should('exist');
  }
}


