import _ from 'lodash';

import createVote from './services/vote/createVote';

export const voteTypeDefs = `
  extend type Query {
    vote(id: ID!): Vote!
  }

  extend type Mutation {
    voteOnVoteable(input: VoteableVoteInput!): Vote! @loggedIn
  }
  
  # types

  type Vote {
    id: ID!,
    userId: ID!,
    voteableId: ID!,
    voteableType: VoteableType!,
    vote: Int!,
    
    createdAt: GraphQLDateTime,
    updatedAt: GraphQLDateTime,
    
    voteable: VoteableObject!,
    user: PublicUser
  }
  
  type VoteableObject {
    id: ID!,
    stats: VoteStatsSpace!
  }
  
  type VoteStatsSpace {
    votes: VoteStats
  }
  
  type VoteStats {
    score: Int!,
    count: Int!,
    upvotedPercent: Int!
  }
  
  # the wilson score stats
  type WilsonStats {
    # Lower bound of Wilson score confidence interval for a Bernoulli parameter
    low: Float!,
    center: Float!,
    high: Float!
  }
  
  # enums
  
  enum VoteableType {
    comments
    posts
    recipes
  }
  
  # inputs
  
  input VoteableVoteInput {
    voteableId: ID!, 
    voteableType: VoteableType!, 
    vote: Int!
  }
`;

export const voteResolvers = {
  VoteStats: {
    score: stat => _.get(stat, 'score', 0),
    count: stat => _.get(stat, 'count', 0),
    upvotedPercent: stat => _.get(stat, 'upvotedPercent', 0)
  },
  Vote: {
    voteable: (vote, vars, { loaders }) => loaders.voteable.load(vote),
    user: (vote, vars, { loaders }) => loaders.userById.load(vote.userId)
  },
  Query: {
    vote: (obj, { id }, { loaders }) => loaders.votesById.load(id)
  },
  Mutation: {
    voteOnVoteable: (obj, { input }, { user }) => createVote({ user, input })
  }
};
