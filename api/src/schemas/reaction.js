import Reaction from 'models/reaction';

import toggleReaction from './services/reaction/toggleReaction';

export const reactionTypeDefs = `
  extend type Query {
    reaction(id: ID!): Reaction!
  }

  extend type Mutation {
    toggleReaction(input: ReactionableToggleInput!): Reaction @loggedIn
  }
  
  # types

  type Reaction {
    id: ID!
    userId: ID!
    reactionableId: ID!
    reactionableType: ReactionableType!
    reaction: String!
    
    createdAt: GraphQLDateTime,
    updatedAt: GraphQLDateTime,
    
    reactionable: ReactionableObject!
    user: PublicUser
  }
  
  type ReactionableObject {
    id: ID!
    stats: ReactionableStatsSpace!
  }
  
  type ReactionableStatsSpace {
    reactions: ReactionStats
  }
  
  type ReactionStats {
    reactions: Int!
  }

  
  # enums
  
  enum ReactionableType {
    comments
    posts
    recipes
  }
  
  # inputs
  
  input ReactionableToggleInput {
    reactionableId: ID!, 
    reactionableType: FavouriteableType!
    reaction: String! 
  }
`;

export const reactionResolvers = {
  Reaction: {
    user: (rection, vars, { loaders }) => loaders.userById.load(rection.userId),
    reactionable: (reaction, vars, { loaders }) => loaders.reactionable.load(reaction)
  },
  Query: {
    reaction: (obj, { id }) => Reaction.query().findById(id)
  },
  Mutation: {
    toggleReaction: (obj, { input }, { user }) => toggleReaction({ user, input })
  }
};
