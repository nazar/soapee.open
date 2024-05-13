export const imageTypeDefs = `
  # types
  
  type Image {
    id: ID!
    userId: ID!
    fileName: String!
    imageableId: ID!
    imageableType: ImageableType!
    storageUsed: Int!
    
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
  }

  
  # enums
  
  enum ImageableType {
    user_profile
    recipe_image    
  }
  
  
  # inputs
  
  input CreateImageInput {
    file: Upload!
    ImageSizeData: ImageSizeData!
    imageableId: ID!
    imageableType: ImageableType!    
  }
  
  input ImageSizeData {
    left: Int!
    top: Int!
    width: Int!
    height: Int!
  }
`;

export const imageResolvers = {
  Query: {
  },
  Mutation: {
  }
};
