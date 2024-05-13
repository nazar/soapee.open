import _ from 'lodash';

import toggleFavourite from './services/favourite/toggleFavourite';

export const favouriteTypeDefs = `

  extend type Mutation {
    toggleFavourite(input: FavouriteableToggleInput!): Favourite @loggedIn
  }
  
  # types

  type Favourite {
    id: ID!
    userId: ID!
    favouriteableId: ID!
    favouriteableType: FavouriteableType!
    
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    
    user: PublicUser
  }
  
  type FavouriteStats {
    favourites: Int
  }
  
  # enums
  
  enum FavouriteableType {
    comments
    oils
    posts
    recipes
  }
  
  # inputs
  
  input FavouriteableToggleInput {
    favouriteableId: ID! 
    favouriteableType: FavouriteableType! 
  }
`;

export const favouriteResolvers = {
  FavouriteStats: {
    favourites: stats => _.get(stats, 'favourites', 0)
  },
  Favourite: {
    user: (favourite, vars, context) => context.loaders.userById.load(favourite.userId)
  },
  Mutation: {
    toggleFavourite: (obj, { input }, { user }) => toggleFavourite({ user, input })
  }
};
