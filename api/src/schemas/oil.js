import getOils from './services/oil/getOils';


export const oilTypeDefs = `
  extend type Query {
    oil(id: ID!): Oil,
    oils: [Oil!],
  }

  # major types
  
  type Oil {
    id: ID!
    userId: ID
    name: String!
    iodine: Int!
    ins: Int!
    sap: Float!
    totalSaponifiable: Int!

    breakdown: OilBreakdowns
    stats: OilStats
    
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    deletedAt: GraphQLDateTime
    
    myFavourite: Favourite
  }

  # sub types
  
  type OilCountStat {
    count: Int
  }
 
  
  type OilStats {
    comments: OilCountStat
    posts: OilCountStat
    recipes: OilCountStat
  }
  
  type OilBreakdowns {
    oleic: Float
    capric: Float
    lauric: Float
    stearic: Float
    caprylic: Float
    linoleic: Float
    myristic: Float
    palmitic: Float
    linolenic: Float
    ricinoleic: Float
    docosenoid: Float
    eicosenoic: Float
    docosadienoic: Float
    erucic: Float
  }
  
  # inputs
  
  input OilBreakdownsInput {
    oleic: Float,
    capric: Float,
    lauric: Float,
    stearic: Float,
    caprylic: Float,
    linoleic: Float,
    myristic: Float,
    palmitic: Float,
    linolenic: Float,
    ricinoleic: Float
    docosenoid: Float
    eicosenoic: Float
    docosadienoic: Float
    erucic: Float
  }
  
`;

export const oilResolvers = {
  Oil: {
    myFavourite: (comment, vars, { user, loaders }) => user && loaders.userFavourite.load({
      user,
      favouriteableId: comment.id,
      favouriteableType: 'oils'
    })
  },
  Query: {
    oil: (obj, { id }, context) => context.loaders.oilById.load(id),

    oils: () => getOils()
  }
};
