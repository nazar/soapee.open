import {
  selectOilAndSetWeight,
  assertRecipeOilsTotal,
  assertTotalWaterWeight,
  assertTotalNaohWeight,
  assertTotalOilWeight,
  assertTotalFragranceOilWeight,
  assertTotalBatchWeight,
  assertTotalSuperfat,
  assertTotalLyeConcentration,
  assertTotalWaterLyeRation,
  assertTotalSaturatedRatio,
  assertRecipeProperties,
  assertFattyAcids
} from '../../utils/calculatorHelpers';

describe('Calculator', () => {

  context('Solid Soaps', () => {

    beforeEach(() => cy.visit('/calculator'));

    it('Should calculate recipe correctly - 1', () => {
      cy.get('[data-cy=soap-type-naoh]').click()
        .get('[data-cy=uom-grams]').click()
        .get('[data-cy=amount-water-type-ratio]').click()
        .get('[data-cy=amount-water-type-ratio-input]').type('{selectall}38')
        .get('[data-cy=superfat-input]').type('{selectall}5');

      selectOilAndSetWeight('Cocoa Butter', '70');
      selectOilAndSetWeight('Coconut Oil, 76 deg', '557');
      selectOilAndSetWeight('Olive Oil', '1527');
      selectOilAndSetWeight('Shea Butter', '70');
      assertRecipeOilsTotal('2,224 g');

      assertTotalWaterWeight('845.1 grams');
      assertTotalNaohWeight('311.1 grams');
      assertTotalOilWeight('2,224 grams');
      assertTotalFragranceOilWeight('66.7 grams');
      assertTotalBatchWeight('3,446.9 grams');
      assertTotalSuperfat('5%');
      assertTotalLyeConcentration('26.9%');
      assertTotalWaterLyeRation('2.717 : 1');
      assertTotalSaturatedRatio('35 : 65');

      assertRecipeProperties({
        bubbly: 17,
        cleansing: 17,
        condition: 62,
        hardness: 35,
        longevity: 18,
        stable: 18,
        iodine: 64,
        ins: 145
      });

      assertFattyAcids({
        lauric: 12,
        linoleic: 9,
        linolenic: 1,
        myristic: 5,
        oleic: 52,
        palmitic: 13,
        stearic: 5
      });
    });
  });

});

