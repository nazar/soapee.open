import request from 'supertest';
import { expect } from 'chai';

import app from 'app';
import responseHandler from 'test/utils/graphql';
import getToken from 'test/utils/getToken';
import knex from 'test/utils/knex';
import loadFixtures from 'test/utils/loadFixtures';
import truncateTables from 'test/utils/truncateTables';

describe('Mutation', () => {

  beforeEach(() => {
    return truncateTables()
      .then(() => loadFixtures());
  });

  describe('Vote', () => {

    let token;

    beforeEach(() =>
      getToken({
        username: 'nazar',
        password: 'password'
      }).then(t => (token = t))
    );

    describe('voteOnVoteable', () => {
      let testPost;

      beforeEach(() => knex('posts')
        .limit(1).then(res => ([testPost] = res)));

      it('should vote on a voteable', () => {
        return createVoteHelper(token, testPost.id)
          .then(res => responseHandler(res, () => {
            const { body: { data: { voteOnVoteable } } } = res;

            expect(voteOnVoteable.id).to.exist;
            expect(voteOnVoteable.vote).to.equal(1);
            expect(voteOnVoteable.voteableId).to.exist;
            expect(voteOnVoteable.voteableType).to.exist;
            expect(voteOnVoteable.userId).to.exist;

            expect(voteOnVoteable.voteable).to.exist;
            expect(voteOnVoteable.voteable.id).to.be.ok;

            expect(voteOnVoteable.voteable.stats.votes).to.be.ok;
            expect(voteOnVoteable.voteable.stats.votes.score).to.equal(1);
            expect(voteOnVoteable.voteable.stats.votes.count).to.equal(1);
            expect(voteOnVoteable.voteable.stats.votes.upvotedPercent).to.equal(100);

            expect(voteOnVoteable.user).to.exist;
            expect(voteOnVoteable.user.name).to.be.ok;
          }));
      });

      it('Should unvote a voteable', () => {
        return createVoteHelper(token, testPost.id)
          .then(() => createVoteHelper(token, testPost.id))
          .then(res => responseHandler(res, () => {
            const { body: { data: { voteOnVoteable } } } = res;

            expect(voteOnVoteable.id).to.exist;
            expect(voteOnVoteable.vote).to.equal(1);
            expect(voteOnVoteable.voteableId).to.exist;
            expect(voteOnVoteable.voteableType).to.exist;
            expect(voteOnVoteable.userId).to.exist;

            expect(voteOnVoteable.voteable).to.exist;
            expect(voteOnVoteable.voteable.id).to.be.ok;

            expect(voteOnVoteable.voteable.stats.votes).to.be.ok;
            expect(voteOnVoteable.voteable.stats.votes.score).to.equal(0);
            expect(voteOnVoteable.voteable.stats.votes.count).to.equal(0);
            expect(voteOnVoteable.voteable.stats.votes.upvotedPercent).to.equal(0);

            expect(voteOnVoteable.user).to.exist;
            expect(voteOnVoteable.user.name).to.be.ok;
          }));

      });

      it('Should toggle a voteable', () => {
        return createVoteHelper(token, testPost.id)
          .then(() => createVoteHelper(token, testPost.id, { vote: 1 }))
          .then(res => responseHandler(res, () => {
            const { body: { data: { voteOnVoteable } } } = res;

            expect(voteOnVoteable.id).to.exist;
            expect(voteOnVoteable.vote).to.equal(1);
            expect(voteOnVoteable.voteableId).to.exist;
            expect(voteOnVoteable.voteableType).to.exist;
            expect(voteOnVoteable.userId).to.exist;

            expect(voteOnVoteable.voteable).to.exist;
            expect(voteOnVoteable.voteable.id).to.be.ok;

            expect(voteOnVoteable.voteable.stats.votes).to.be.ok;
            expect(voteOnVoteable.voteable.stats.votes.score).to.equal(0);
            expect(voteOnVoteable.voteable.stats.votes.count).to.equal(0);
            expect(voteOnVoteable.voteable.stats.votes.upvotedPercent).to.equal(0);

            expect(voteOnVoteable.user).to.exist;
            expect(voteOnVoteable.user.name).to.be.ok;
          }));

      });

    });

  });

});

// helpers

function createVoteHelper(token, postId, { vote } = { vote: 1 }) {
  return request(app)
    .post('/api/graphql')
    .set(token)
    .send({
      query: `
        mutation {
          voteOnVoteable(
            input: {
              voteableId: ${postId},
              voteableType: posts,
              vote: ${vote}
            }
          ) {
            id
            voteableId
            voteableType
            userId
            vote
            
            voteable {
              id
              stats {
                votes {
                  count
                  score
                  upvotedPercent
                }
              }
            }
            
            user {
              name
            }
          }
        }
      `
    });
}
