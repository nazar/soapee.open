import _ from 'lodash';

export function selectOil(oil) {
  cy
    .get('[data-cy=oil-input-filter]')
    .type(`{selectall}${oil}`)
    .get('.oil-cell')
    .contains(oil)
    .parents('tr')
    .within(() => cy.get('button').click());
}

export function setOilWeight(oil, weight) {
  cy
    .get('[data-cy=list-oil-weights] td')
    .contains(oil)
    .parents('tr')
    .within(() => cy.get('input').type(weight));
}

export function selectOilAndSetWeight(oil, weight) {
  selectOil(oil);
  setOilWeight(oil, weight);
}

export function assertRecipeOilsTotal(total) {
  cy
    .get(`[data-cy=recipe-oils-total]:contains("${total}")`)
    .should('exist');
}

export function assertTotalWaterWeight(weight) {
  cy
    .get('[data-cy=recipe-totals-total-water-weight]')
    .contains(weight)
    .should('exist');
}

export function assertTotalNaohWeight(weight) {
  cy
    .get('[data-cy=recipe-totals-total-lye-weight]')
    .contains(weight)
    .should('exist');
}

export function assertTotalMixedNoahWeight(weight) {
  cy
    .get('[data-cy=recipe-totals-total-mixed-naoh-weight]')
    .contains(weight)
    .should('exist');
}

export function assertTotalKohWeight(weight) {
  cy
    .get('[data-cy=recipe-totals-total-mixed-koh-weight]')
    .contains(weight)
    .should('exist');
}

export function assertTotalMixedLyeWeight(weight) {
  cy
    .get('[data-cy=recipe-totals-total-mixed-lye-weight]')
    .contains(weight)
    .should('exist');
}

export function assertTotalOilWeight(weight) {
  cy
    .get('[data-cy=recipe-totals-total-oil-weight]')
    .contains(weight)
    .should('exist');
}

export function assertTotalFragranceOilWeight(weight) {
  cy
    .get('[data-cy=recipe-totals-total-fragrance-weight]')
    .contains(weight)
    .should('exist');
}

export function assertTotalBatchWeight(weight) {
  cy
    .get('[data-cy=recipe-totals-total-batch-weight]')
    .contains(weight)
    .should('exist');
}

export function assertTotalSuperfat(weight) {
  cy
    .get('[data-cy=recipe-totals-superfat]')
    .contains(weight)
    .should('exist');
}

export function assertTotalLyeConcentration(weight) {
  cy
    .get('[data-cy=recipe-totals-lye-concentration]')
    .contains(weight)
    .should('exist');
}

export function assertTotalWaterLyeRation(weight) {
  cy
    .get('[data-cy=recipe-totals-water-lye-ratio]')
    .contains(weight)
    .should('exist');
}

export function assertTotalNaohKohRatio(ratio) {
  cy
    .get('[data-cy=recipe-totals-total-mixed-ratio]')
    .contains(ratio)
    .should('exist');
}

export function assertTotalSaturatedRatio(weight) {
  cy
    .get('[data-cy=recipe-totals-saturated-ratio]')
    .contains(weight)
    .should('exist');
}

export function assertRecipeProperties(properties) {
  _.each(properties, (value, name) => {
    cy
      .get(`[data-cy=property-cell-${name}]`)
      .contains(value)
      .should('exist');
  });
}

export function assertFattyAcids(acids) {
  _.each(acids, (value, name) => {
    cy
      .get(`[data-cy=fatty-acid-prop-${name}]`)
      .contains(value)
      .should('exist');
  });
}
