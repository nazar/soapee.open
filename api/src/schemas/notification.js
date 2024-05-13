import approveFriendFromNotification from './services/notification/approveFriendFromNotification';
import getUserNotifications from './services/notification/getUserNotifications';
import getUserNotificationsSummary from './services/notification/getUserNotificationsSummary';
import getUserUnreadNotificationCount from './services/notification/getUserUnreadNotificationCount';
import markAllMyNotificationsAsRead from './services/notification/markAllMyNotificationsAsRead';

export const notificationTypeDefs = `
  extend type Query {
    # returns the logged in user's unread notifications count
    userNotificationUnreadCount: Int
      @loggedIn
    
    # returns logged in user's notifications
    userNotifications(
      page: PaginationInput
      search: NotificationSearchInput
      order: NotificationSortOrderInput    
    ): [Notification]
      @loggedIn
    
    # returns notification summary for the given search input
    userNotificationsSummary(search: NotificationSearchInput): ListsSummary
      @loggedIn
  }
  
  extend type Mutation {
    # accepts a friend request from a notification
    approveFriendFromNotification(notificationId: ID): Notification!
      @loggedIn
    
    # marks all the current user's notifications as read
    markAllMyNotificationsAsRead: Boolean
      @loggedIn
  }
  
  # types

  type Notification {
    id: ID!
    # the user that triggered the notification
    sourceUserId: ID!
    # the user the notification is for
    targetUserId: ID!
    
    notifiableId: ID!
    notifiableType: NotifiableType!
    read: Boolean
    notificationMeta: JSON
    
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    
    # belongs-to associations
    
    sourceUser: PublicUser!
    targetUser: PublicUser!
  }
  
  # enums
  
  enum NotifiableType {
    comments
    friendships
    favourites
    forums
    posts
    reactions
    recipes
    votes
  }
  
  enum NotificationReadStatusType {
    any
    read
    unread
  }
  
  enum NotificationSortField {
    createdAt
  }
  
  # inputs
  
  input NotificationSearchInput {
    readStatus: NotificationReadStatusType
  }
  
  input NotificationSortOrderInput {
    field: NotificationSortField!
    direction: SortDirection!
  } 
`;

export const notificationResolvers = {
  Notification: {
    targetUser: ({ targetUserId }, vars, { loaders }) => loaders.userById.load(targetUserId),
    sourceUser: ({ sourceUserId }, vars, { loaders }) => loaders.userById.load(sourceUserId)
  },
  Query: {
    userNotifications: (obj, { page, search, order }, { user }) =>
      getUserNotifications({ page, search, order, user }),

    userNotificationsSummary: (obj, { search }, { user }) =>
      getUserNotificationsSummary({ search, user }),

    userNotificationUnreadCount: (obj, vars, { user }) => getUserUnreadNotificationCount({ user })
  },
  Mutation: {
    approveFriendFromNotification: (obj, { notificationId }, { user }) =>
      approveFriendFromNotification({ notificationId, user }),

    markAllMyNotificationsAsRead: (obj, vars, { user }) =>
      markAllMyNotificationsAsRead({ user })
  }
};
