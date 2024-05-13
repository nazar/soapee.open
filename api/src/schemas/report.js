import createReport from './services/report/createReport';

export const reportTypeDefs = `
  extend type Query {
    report(id: ID!): Report!
  }

  extend type Mutation {
    reportReportable(input: ReportReportableInput!): Report! @loggedIn
  }
  
  # types

  type Report {
    id: ID!
    userId: ID!
    reviewedById: Int
    reportableId: ID!
    reportableType: ReportableType!
    report: Int!
    notes: String
    
    reviewedAt: GraphQLDateTime
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    
    reviewedBy: PublicUser
    user: PublicUser
  }
      
  # enums
  
  enum ReportableType {
    comments
    forums
    posts
    recipes
  }
  
  # inputs
  
  input ReportReportableInput {
    reportableId: ID!,
    reportableType: ReportableType!
    report: Int!
    notes: String
  }
`;

export const reportResolvers = {
  Report: {
    reviewedBy: (report, vars, { loaders }) => loaders.userById.load(report.reviewedById),
    user: (report, vars, { loaders }) => loaders.userById.load(report.userId)
  },
  Query: {
    report: (obj, { id }, { loaders }) => loaders.reportsById.load(id)
  },
  Mutation: {
    reportReportable: (obj, { input }, { user }) => createReport({ user, input })
  }
};
