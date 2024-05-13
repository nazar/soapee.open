import createAdditive from './services/additive/createAdditive';
import deleteAdditive from './services/additive/deleteAdditive';
import updateAdditive from './services/additive/updateAdditive';

import getAdditives from './services/additive/getAdditives';
import getAdditivesSummary from './services/additive/getAdditivesSummary';

export const additiveTypeDefs = `
  extend type Query {
    additive(id: ID!): Additive 
    
    additives(
      search: AdditiveSearchInput
      page: PaginationInput
      order: AdditiveSortOrderInput
    ): [Additive!] 
    
    additivesSummary(
      search: AdditiveSearchInput
    ): ListsSummary! 
  }
  
  extend type Mutation {  
    createAdditive(input: CreateAdditiveInput!): Additive! @loggedIn
    deleteAdditive(id: ID!): Additive! @loggedIn
    updateAdditive(id: ID!, input: UpdateAdditiveInput!): Additive! @loggedIn
  }

  # major types
  
  type Additive {
    id: ID!
    userId: ID
    name: String!
    notes: String
    stats: AdditiveStats
    
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    deletedAt: GraphQLDateTime
  }
  
  type AdditiveStats {
    recipes: AdditiveCountStat
  }
  
  type AdditiveCountStat {
    count: Int
  }

  
  #enums
  
  enum AdditiveSearchField {
    name
    recipeCount
    createdAt
  }
  
  # inputs
  
  input AdditiveSearchInput {
    name: String
  }
  
  input AdditiveSortOrderInput {
    field: AdditiveSearchField!
    direction: SortDirection!
  }
  
  input CreateAdditiveInput {
    name: String!
    notes: String
  }  
  
  input UpdateAdditiveInput {
    name: String!
    notes: String
  }  
`;

export const additiveResolvers = {
  Query: {
    additive: (obj, { id }, { loaders }) => loaders.additiveById.load(id),
    additives: (obj, { search, page, order }, { user }) => getAdditives({ search, page, order, user }),
    additivesSummary: (obj, { search }, { user }) => getAdditivesSummary({ search, user })
  },
  Mutation: {
    createAdditive: (obj, { input }, { user }) => createAdditive({ input, user }),
    deleteAdditive: (obj, { id }, { user }) => deleteAdditive({ id, user }),
    updateAdditive: (obj, { id, input }, { user }) => updateAdditive({ id, input, user })
  }
};
