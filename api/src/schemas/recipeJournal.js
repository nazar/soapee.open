import getRecipeJournals from './services/recipeJournal/getRecipeJournals';
import createRecipeJournal from './services/recipeJournal/createRecipeJournal';
import updateRecipeJournal from './services/recipeJournal/updateRecipeJournal';

export const recipeJournalTypeDefs = `
  extend type Query {
    recipeJournals(search: RecipeJournalSearchInput!): [RecipeJournal]!
  }
  
  extend type Mutation {
    createRecipeJournal(input: RecipeJournalCreateInput!) : RecipeJournal!  @loggedIn
    updateRecipeJournal(id: ID!, input: RecipeJournalUpdateInput!) : RecipeJournal! @loggedIn
  }

  type RecipeJournal {
    id: ID!
    recipeId: ID!
    journal: String
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
  }
  
  
  # inputs
  
  input RecipeJournalSearchInput {
    recipeId: ID!
  }
  
  input RecipeJournalCreateInput {
    recipeId: ID!
    journal: String!
  }
  
  input RecipeJournalUpdateInput {
    journal: String!
  }
`;

export const recipeJournalResolvers = {
  Query: {
    recipeJournals: (obj, { search }, { user }) => getRecipeJournals({ search, user })
  },
  Mutation: {
    createRecipeJournal: (obj, { input }, { user }) => createRecipeJournal({ input, user }),
    updateRecipeJournal: (obj, { id, input }, { user }) => updateRecipeJournal({ id, input, user })
  }
};
