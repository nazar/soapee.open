import _ from 'lodash';

import { stripAllHtml } from 'services/sanitiseHtml';

import getRecipe from './services/recipe/getRecipe';
import getRecipes from './services/recipe/getRecipes';
import getRecipesSummary from './services/recipe/getRecipesSummary';
import getRecipeImageUrl from './services/recipe/getRecipeImageUrl';
import safeRecipeGetForDataLoader from './services/recipe/safeRecipeGetForDataLoader';

import createRecipe from './services/recipe/createRecipe';
import updateRecipe from './services/recipe/updateRecipe';
import deleteRecipe from './services/recipe/deleteRecipe';
import toggleBestRecipe from './services/recipe/toggleBestRecipe';

export const recipeTypeDefs = `
  extend type Query {
    # get recipe by ID. Checks recipe visibility before returning results
    recipe(id: ID!): Recipe
    
    # get recipes
    recipes(
      page: PaginationInput
      search: RecipeSearchInput
      order: RecipeSortOrderInput
    ): [Recipe!]
    
    # get recipes summary
    recipesSummary(
      search: RecipeSearchInput
    ): ListsSummary
  }

  extend type Mutation {
    createRecipe(recipe: RecipeInput!): Recipe @loggedIn
    updateRecipe(id: ID!, recipe: RecipeInput!): Recipe @loggedIn
    
    # marks a recipe as deleted
    deleteRecipe(id: ID!): Recipe @loggedIn
    
    # toggles best flag on a recipe
    toggleBestRecipe(id: ID!): Recipe @admin
  }  

  # major types
  
  type Recipe {
    id: ID!
    userId: ID!
    
    # recipe id if this recipe was copied
    fromRecipeId: ID
    
    # recipe name
    name: String!
    description: String
    # returns the description stripped of HTML
    descriptionStr: String
    notes: String
    recipeImage(type: RecipeImageFieldType): String
    
    # 0 - private, 1 - public, 2 - friends
    visibility: Int!
    best: Boolean
    settings: RecipeSetting
    summary: RecipeSummary
    stats: RecipeStats
    
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    deletedAt: GraphQLDateTime
    
    fromRecipe: Recipe
    myFavourite: Favourite
    myVote: Vote
    myReport: Report
    reactions: [Reaction]
    recipeAdditives: [RecipeAdditive] 
    recipeOils: [RecipeOil!] 
    user: PublicUser!
  }
  
  # sub types
  
  type RecipeStats {
    comments: CommentableStats
    favourites: FavouriteStats
    scores: WilsonStats
    views: ViewStats
    votes: VoteStats
  }
  
  type RecipeSetting {
    uom: Uom!
    uomType: UomType
    uomDimensionType: UomDimensionType
    dimensionWidth: Float
    dimensionHeight: Float
    dimensionLength: Float
    dimensionDiameter: Float
    ratioKoh: Float
    soapType: SoapType!
    superFat: Float!
    superfatAfter: Boolean
    totalUom: Uom
    kohPurity: Float
    naohPurity: Float
    ratioNaoh: Float
    waterRatio: Float
    lyeCalcType: LyeCalcType!
    totalWeight: Float
    totalsIncludeWater: Boolean
    fragrance: Float
    fragrancePpo: Float
    fragranceType: FragranceType
    waterDiscount: Float
    lyeWaterLyeRatio: Float
    lyeWaterWaterRatio: Float
    recipeLyeConcentration: Float
    enableCitricAdjust: Boolean
    citricAdjustPercent: Float
  }
  
  type RecipeSummaryTotals {
    totalLye: Float!
    totalSuperfat: Float!
    waterLyeRatio: Float!
    totalOilWeight: Float!
    fragranceWeight: Float!
    lyeConcentration: Float!
    totalBatchWeight: Float!
    totalWaterWeight: Float!
  }
  
  type RecipeSummaryProperties {
    ins: Float
    bubbly: Float
    iodine: Float
    stable: Float
    hardness: Float
    cleansing: Float
    condition: Float
    longevity: Float
  }
  
  type RecipeSummarySaturations {
    saturated: Float
    unsaturated: Float
  }
  
  type RecipeSummary {
    totals: RecipeSummaryTotals
    breakdowns: OilBreakdowns
    properties: RecipeSummaryProperties
    saturations: RecipeSummarySaturations
  }
  
  
  # enums
  
  enum Uom {
    percent
    gram
    kilo
    pound
    ounce
  }
  
  enum UomType {
    weights
    dimensions
  }
  
  enum UomDimensionType {
    box
    cylinder
  }
  
  enum SoapType {
    koh
    mixed
    naoh
  }
  
  enum LyeCalcType {
    concentration
    ratio
    lyewater
  }
  
  enum FragranceType {
    ppo
    ratio
  }
  
  enum RecipeSearchField {
    name
    score
    createdAt
    views
    comments
    favourites
    updatedAt
    best
  }
  
  enum RecipeImageFieldType {
    full
    thumb
  }
  

  # inputs
  
   
  input RecipeSortOrderInput {
    field: RecipeSearchField!
    direction: SortDirection!
  }  
  
  input RecipeSearchInput {
    # search recipes by name
    name: String
    # search public recipes for userId
    userId: ID
    oilIds: [ID!]
    soapTypes: [SoapType!]
    properties: JSON
    showDeleted: Boolean
  }
  
  input RecipeSummaryTotalsInput {
    totalLye: Float!
    totalKoh: Float
    totalNaoh: Float
    totalSuperfat: Float!
    waterLyeRatio: Float!
    totalOilWeight: Float!
    fragranceWeight: Float!
    lyeConcentration: Float!
    totalBatchWeight: Float!
    totalWaterWeight: Float!
    citricAdjustKoh: Float
    citricAdjustNaoh: Float
    citricAdjustLye: Float
  }
  
  input RecipeSummarySaturationsInput {
    saturated: Float,
    unsaturated: Float
  }
  
  input RecipeSummaryPropertiesInput {
    ins: Float
    bubbly: Float
    iodine: Float
    stable: Float
    hardness: Float
    cleansing: Float
    condition: Float
    longevity: Float
  }

  input RecipeSummaryInput {
    totals: RecipeSummaryTotalsInput!
    breakdowns: OilBreakdownsInput!
    properties: RecipeSummaryPropertiesInput!
    saturations: RecipeSummarySaturationsInput!
  }
  
  input RecipeOilsInput {
    id: ID!
    weight: Float!
  }
  
  input RecipeAdditivesInput {
    id: ID!
    weight: String
  }
  
  input RecipeSettingInput {
    uom: Uom!
    uomType: UomType
    uomDimensionType: UomDimensionType
    dimensionWidth: Float
    dimensionHeight: Float
    dimensionLength: Float
    dimensionDiameter: Float
    ratioKoh: Float
    soapType: SoapType!
    superFat: Float!
    superfatAfter: Boolean
    totalUom: Uom
    kohPurity: Float
    naohPurity: Float
    ratioNaoh: Float
    waterRatio: Float
    lyeCalcType: LyeCalcType!
    totalWeight: Float
    totalsIncludeWater: Boolean
    fragrance: Float
    fragrancePpo: Float
    fragranceType: FragranceType
    waterDiscount: Float
    lyeWaterLyeRatio: Float
    lyeWaterWaterRatio: Float
    recipeLyeConcentration: Float
    additives: [RecipeAdditivesInput!]
    oils: [RecipeOilsInput!]
    enableCitricAdjust: Boolean
    citricAdjustPercent: Float
  }
  
  input RecipeInput {
    name: String!
    description: String
    notes: String
    visibility: Int!
    fromRecipeId: ID
    settings: RecipeSettingInput!
    summary: RecipeSummaryInput!   
    recipeImage: Upload
    recipeImageSizeData: ImageSizeData
  }
`;

export const recipeResolvers = {
  Recipe: {
    fromRecipe: ({ fromRecipeId }, vars, { loaders, user }) =>
      safeRecipeGetForDataLoader({ fromRecipeId, user, loaders }),

    myVote: (recipe, vars, { loaders, user }) => user && loaders.userVote.load({
      user,
      voteableId: recipe.id,
      voteableType: 'recipes'
    }),

    myReport: (recipe, vars, { loaders, user }) => user && loaders.userReports.load({
      user,
      reportableId: recipe.id,
      reportableType: 'recipes'
    }),

    reactions: (recipe, vars, { loaders }) =>
      loaders.reactionsForReactionable.load({ reactionableId: recipe.id, reactionableType: 'recipes' }),

    recipeAdditives: (recipe, vars, { loaders }) =>
      loaders.recipeAdditivesByRecipeId.load(recipe.id),

    recipeOils: (recipe, vars, { loaders }) =>
      loaders.recipeOilsByRecipeId.load(recipe.id),

    recipeImage: (recipe, { type }, { loaders }) =>
      loaders
        .recipeImageFromImageable
        .load(recipe.id)
        .then(image => image && getRecipeImageUrl({ image, thumbnail: type === 'thumb' })),

    myFavourite: (comment, vars, { loaders, user }) => user && loaders.userFavourite.load({
      user,
      favouriteableId: comment.id,
      favouriteableType: 'recipes'
    }),

    user: (recipe, vars, context) =>
      context.loaders.userById.load(recipe.userId),

    stats: (recipe) => {
      const stats = _.get(recipe, 'stats', {});
      const defaultStats = {
        comments: {},
        favourites: {},
        views: {},
        votes: {}
      };

      return {
        ...defaultStats,
        ...stats
      };
    },

    descriptionStr: recipe => recipe?.description && stripAllHtml(recipe.description)
  },
  // set defaults for older recipes which don't have all the following keys
  RecipeSetting: {
    fragrance: obj => toNumberIfNilDefault(obj?.fragrance, 3),
    fragrancePpo: obj => toNumberIfNilDefault(obj?.fragrancePpo, 30),
    citricAdjustPercent: obj => toNumberIfNilDefault(obj?.citricAdjustPercent, 0),
    fragranceType: obj => obj?.fragranceType || 'ratio',
    kohPurity: obj => _.toNumber(obj?.kohPurity) || 90,
    lyeWaterLyeRatio: obj => _.toNumber(obj?.lyeWaterLyeRatio) || 1,
    lyeWaterWaterRatio: obj => _.toNumber(obj?.lyeWaterWaterRatio) || 3,
    naohPurity: obj => _.toNumber(obj?.naohPurity) || 100,
    ratioNaoh: obj => _.toNumber(obj?.ratioNaoh) || 50,
    ratioKoh: obj => _.toNumber(obj?.ratioKoh) || 50,
    recipeLyeConcentration: obj => _.toNumber(obj?.recipeLyeConcentration) || 30,
    superFat: obj => _.toNumber(obj?.superFat) || 0,
    totalWeight: obj => _.toNumber(obj?.totalWeight) || 500,
    waterDiscount: obj => _.toNumber(obj?.waterDiscount) || 0,
    waterRatio: obj => _.toNumber(obj?.waterRatio) || 38
  },
  Query: {
    recipe: (obj, { id }, { user }) => getRecipe({ id, user }),

    recipes: (obj, {
      search,
      page: { offset, limit = 10 } = {},
      order: { field = 'score', direction = 'desc' } = {}
    }, { user }) =>
      getRecipes({
        user,
        search,
        page: {
          offset,
          limit
        },
        order: {
          field,
          direction
        }
      }),

    recipesSummary: (obj, { page, search, order }, { user }) =>
      getRecipesSummary({ user, page, search, order })
  },
  Mutation: {
    createRecipe: (obj, { recipe }, { user }) => createRecipe({ user, recipe }),
    deleteRecipe: (obj, { id }, { user }) => deleteRecipe({ id, user }),
    toggleBestRecipe: (obj, { id }, { user }) => toggleBestRecipe({ id, user }),
    updateRecipe: (obj, { id, recipe }, { user }) => updateRecipe({ id, user, recipe })
  }
};

function toNumberIfNilDefault(input, defaultValue) {
  return _.isNil(input) ? defaultValue : _.toNumber(input);
}
