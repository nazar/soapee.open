const Bluebird = require('bluebird');

const { markedToHtml } = require('../utils/sanitiseHtml');


exports.up = function(knex) {
  return Bluebird.resolve(knex('recipe_journals'))
    .each((recipeJournal, index, total) => {
      console.log(`Processing Recipe Journal ${index} out of ${total}`);

      let { journal } = recipeJournal;

      journal = markedToHtml(journal);

      if (journal) {
        return knex('recipe_journals')
          .update({ journal })
          .where({ id: recipeJournal.id })
      }
    })
};

exports.down = function() {
  // noop
};
