import getFeed from './services/feed/getFeed';
import getFeedSummary from './services/feed/getFeedSummary';

export const feedTypeDefs = `
  extend type Query {
    getFeed(
      page: PaginationInput
      order: FeedOrderInput
    ): [Feed!]
    
    # get recipes summary
    getFeedSummary: ListsSummary!
  }
  

  # types

  type Feed {
    id: ID!
    feedableId: ID!
    feedableType: FeedableType!
    feedMeta: JSON
    
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    
    # associations
    
    # belongs to
    
    user: PublicUser!
  }
  

  # enums
  
  enum FeedOrderField {
    createdAt
  }
  
  enum FeedableType {
    comments
    posts
    recipes
    recipe_journals
    users
  }
  
  
  # inputs
  
  input FeedOrderInput {
    field: FeedOrderField!
    direction: SortDirection!  
  }
`;

export const feedResolvers = {
  Feed: {
    user: (feedItem, vars, { loaders }) => loaders.userById.load(feedItem.userId)
  },
  Query: {
    getFeed: (obj, { page, order }) => getFeed({ page, order }),
    getFeedSummary: () => getFeedSummary()
  }
};
