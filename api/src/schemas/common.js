export default `
  # common application types
  
  type ListsSummary {
    count: Int!
  }
  
  type ViewStats {
    count: Int    
  }
  
  # type used by file Upload type
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }  
  
  # common application inputs¦
  
  input PaginationInput {
    offset: Int
    limit: Int
  }
`;
