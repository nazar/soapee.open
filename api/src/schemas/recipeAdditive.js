export const recipeAdditiveTypeDefs = `
  extend type Query {
    recipeAdditive(id: ID!): RecipeAdditive!
  }

  type RecipeAdditive {
    id: ID!
    additiveId: ID!
    recipeId: ID!
    weight: String
    
    additive: Additive!
    recipe: Recipe!
  }
`;

export const recipeAdditiveResolvers = {
  RecipeAdditive: {
    additive: ({ additiveId }, vars, { loaders }) => loaders.additiveById.load(additiveId),
    recipe: ({ recipeId }, vars, { loaders }) => loaders.recipeById.load(recipeId)
  },
  Query: {
    recipeAdditive: (obj, { id }, { loaders }) => loaders.recipeOilById.load(id)
  }
};
