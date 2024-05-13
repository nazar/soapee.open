export const recipeOilTypeDefs = `
  extend type Query {
    recipeOil(id: ID!): RecipeOil!
  }

  type RecipeOil {
    id: ID!
    oilId: ID!
    recipeId: ID!
    weight: Float!
    
    oil: Oil!
    recipe: Recipe!
  }
`;

export const recipeOilResolvers = {
  RecipeOil: {
    oil: (recipeOil, vars, context) => context.loaders.oilById.load(recipeOil.oilId),
    recipe: (recipeOil, vars, context) => context.loaders.recipeById.load(recipeOil.recipeId)
  },
  Query: {
    recipeOil: (obj, { id }, context) => context.loaders.recipeOilById.load(id)
  }
};
