import { expect } from 'chai';

import getToken from 'test/utils/getToken';
import client from 'test/utils/client';
import loadFixtures from 'test/utils/loadFixtures';
import truncateTables from 'test/utils/truncateTables';

describe('Mutation', () => {

  beforeEach(() => {
    return truncateTables()
      .then(() => loadFixtures());
  });

  describe('Reaction', () => {

    let token;

    beforeEach(() =>
      getToken({
        username: 'nazar',
        password: 'password'
      }).then(t => (token = t))
    );

    describe('toggleReaction', () => {
      it('Should toggle a reaction', () => {
        return client(`
          mutation toggleReaction($input: ReactionableToggleInput!) {
            toggleReaction(input: $input) {
              id
              reactionableId
              reaction
              
              reactionable {
                stats {
                  reactions {
                    reactions
                  }
                }
              }
            }
          }
        `, {
          variables: {
            input: {
              reactionableId: 2,
              reactionableType: 'comments',
              reaction: 'shark'
            }
          },
          headers: token
        })
          .then(({ data: { toggleReaction } }) => {
            expect(toggleReaction).to.be.ok;
            expect(toggleReaction.reaction).to.equal('shark');
            expect(toggleReaction.reactionable.stats.reactions.reactions).to.equal(4);

          });
      });

      it('Should toggle off a reaction', () => {
        return client(`
          mutation toggleReaction($input: ReactionableToggleInput!) {
            toggleReaction(input: $input) {
              id
              reactionableId
              reaction
              
              reactionable {
                id
                stats {
                  reactions {
                    reactions
                  }
                }
              }
            }
          }
        `, {
          variables: {
            input: {
              reactionableId: 1,
              reactionableType: 'comments',
              reaction: 'shrug'
            }
          },
          headers: token
        })
          .then(({ data: { toggleReaction } }) => {
            expect(toggleReaction).to.be.ok;
            expect(toggleReaction.reaction).to.equal('shrug');
            expect(toggleReaction.reactionable.id).to.equal('1');
            expect(toggleReaction.reactionable.stats.reactions.reactions).to.equal(0);
          });
      });

    });

  });

});
