import _ from 'lodash';

import Comment from 'models/comment';
import Forum from 'models/forum';
import Post from 'models/post';
import Recipe from 'models/recipe';
import User from 'models/user';
import Verification from 'models/verification';

import summariser from 'services/summariser';

import localLogin from './services/user/localLogin';
import localSignup from './services/user/localSignup';
import updateMe from './services/user/updateMe';
import updateMyPassword from './services/user/updateMyPassword';
import verificationUserLoginOrSignup from './services/user/verificationUserLoginOrSignup';
import sendResetEmailPassword from './services/user/sendResetEmailPassword';
import sendResetFacebookPassword from './services/user/sendResetFacebookPassword';
import verifyPasswordResetCode from './services/user/verifyPasswordResetCode';
import verifyFacebookRecoveryCode from './services/user/verifyFacebookRecoveryCode';
import updatePasswordWithVerificationToken from './services/user/updatePasswordWithVerificationToken';
import convertFacebookAccountToLocalProvider from './services/user/convertFacebookAccountToLocalProvider';
import deleteMyAccount from './services/user/deleteMyAccount';
import renewToken from './services/user/renewToken';
import updateAvatarImage from './services/user/updateAvatarImage';
import getGravatarHash from './services/user/getGravatarHash';
import getUsers from './services/user/getUsers';
import userFriendStatus from './services/user/userFriendStatus';

import getImageUrl from './services/image/getImageUrl';
import getComments from './services/comment/getComments';
import getForums from './services/forum/getForums';
import getFriendsRecipes from './services/recipe/getFriendsRecipes';
import getFavouriteRecipesForUser from './services/recipe/getFavouriteRecipesForUser';
import getPosts from './services/post/getPosts';
import getRecipes from './services/recipe/getRecipes';


export const userTypeDefs = `
  extend type Query {
    # lookup user
    user(id: ID!): PublicUser!
    
    # the current user
    me: User

    # the current user's comments
    myComments(order: CommentableOrderInput, page: PaginationInput): [Comment!] @loggedIn
    myCommentsSummary: ListsSummary! @loggedIn
    
    # the current user's comments
    myFavouriteComments(order: CommentableOrderInput, page: PaginationInput): [Comment!] @loggedIn
    myFavouriteCommentsSummary: ListsSummary! @loggedIn
    
    # the current user's forums
    myForums(order: ForumOrderInput, page: PaginationInput): [Forum!] @loggedIn
    myForumsSummary: ListsSummary! @loggedIn
    
    # the current user's subscribed forums
    mySubscribedForums(order: ForumOrderInput, page: PaginationInput): [Forum!] @loggedIn
    mySubscribedForumsSummary: ListsSummary! @loggedIn

    # the current user's favourited recipes
    myFavouriteRecipes(
      search: MyRecipesSearchInput
      page: PaginationInput
      order: RecipeSortOrderInput
    ): [Recipe!] @loggedIn
    myFavouriteRecipesSummary(search: MyRecipesSearchInput): ListsSummary! @loggedIn

    # the current user's recipes
    myRecipes(search: MyRecipesSearchInput, order: RecipeSortOrderInput, page: PaginationInput): [Recipe!] @loggedIn
    myRecipesSummary(search: MyRecipesSearchInput): ListsSummary! @loggedIn
    
    # the current user's posts
    myPosts(order: PostOrderInput, page: PaginationInput): [Post!] @loggedIn
    myPostsSummary: ListsSummary! @loggedIn
    
    # the current users favourite posts
    myFavouritePosts(order: PostOrderInput, page: PaginationInput): [Post!] @loggedIn
    myFavouritePostsSummary: ListsSummary! @loggedIn

    # the current user's friend's recipes
    myFriendsRecipes(
      search: MyRecipesSearchInput
      order: RecipeSortOrderInput
      page: PaginationInput
    ): [Recipe!] @loggedIn
    myFriendsRecipesSummary(search: MyRecipesSearchInput): ListsSummary! @loggedIn

    # the current user's friends
    myFriends(page: PaginationInput): [PublicUser!] @loggedIn
    myFriendsSummary: ListsSummary! @loggedIn
    
    # the current user's incoming friend requests that are still pending - i.e. these are users
    # that want to be the current user's friends but are yet to be approved by the current user
    myIncomingPendingFriends(page: PaginationInput): [PublicUser!] @loggedIn
    myIncomingPendingFriendsSummary: ListsSummary! @loggedIn
    
    # given a userId, returns the friendship status
    userFriendStatus(userId: ID!): FriendStatus! @loggedIn
    
    # check username validity, specifically if the username is taken 
    validUsername(username: String!): Boolean!
  }
  
  extend type Mutation {
    # user signup using username and password
    localSignup(username: String!, password: String!, email: String): UserToken
    
    # user local login using username / password
    localUserLogin(username: String!, password: String!, rememberMe: Boolean): UserToken
    
    # user login or signup using third party services like Facebook and Google. Token represents either the
    # FB or Google user tokens used to confirm the user id from the server
    verificationUserLoginOrSignup(provider: String!, token: String!, rememberMe: Boolean): UserToken
    
    # update the current user details
    updateMe(input: UserUpdateMeInput!): User! @loggedIn
    
    # update my password
    updatePassword(input: UserPasswordUpdateInput!): User @loggedIn    
    
    # starts the email based Password reset process for local logins
    sendResetEmailPassword(input: UserEmailResetPasswordInput!): EmailResetPasswordResult
    
    # verifies the password reset code
    verifyPasswordResetCode(input: VerifyResetCodeInput!): Boolean
    
    # resets password to a new password from the Password Reset page - returns the affected username
    updatePasswordWithVerificationToken(input: UpdatePasswordWithVerificationInput!): String
    
    # marks account deleted - sets name to deleted and removes all identifiable information
    deleteMyAccount: Boolean @loggedIn
    
    # given an non-expired token, this mutation renews the token with a new expiry time
    renewToken(token: String!): String! @loggedIn
    
    updateAvatarImage(input: UpdateAvatarImageInput!): User! @loggedIn

    # starts the email based Facebook account reset process for local logins
    sendRecoverFacebookAccount(input: UserEmailResetPasswordInput!): EmailResetPasswordResult

    # verifies the facebook recovery code
    verifyFacebookRecoveryCode(input: VerifyResetCodeInput!): Boolean
    
    # converts facebook based account to username password based account
    convertFacebookAccountToLocalProvider(input: ConvertFacebookAccountToLocalProviderInput!): String
  }

  # major types

  # User type is only accessible to the current user
  type User {
    id: ID!
    # the user's full name
    name: String
    email: String
    about: String
    imageUrl: String
    gravatarHash: String
    canonicalImage: String
    
    stats: UserStats
    isAdmin: Boolean
    
    lastLoggedIn: GraphQLDateTime
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
  }
  
  # PublicUser exposes fields for all users and mainly hides the user email
  type PublicUser {
    id: ID!
    name: String
    about: String
    canonicalImage: String
    createdAt: GraphQLDateTime

    stats: UserStats
  }
  
  type UserStats {
    counts: UserStatsCounts
    karma: UserStatsKarma
  }
  
  type UserStatsCounts {
    posts: Int
    comments: Int
    forums: Int
    recipes: Int
    votes: Int
  }
  
  type UserStatsKarma {
    posts: Int
    comments: Int
    recipes: Int
  }
  
  type UserToken {
    token: String!,
    user: User
  }
  
  type EmailResetPasswordResult {
    token: String
  }
  
  
  # inputs
  
  input UserUpdateMeInput {
    name: String!,
    email: String,
    about: String,
    imageUrl: String
  }
  
  input UserPasswordUpdateInput {
    currentPassword: String!
    newPassword: String!
  }
  
  input UserEmailResetPasswordInput {
    email: String!
  }
  
  input VerifyResetCodeInput {
    code: String!
    token: String!
  }
  
  input UpdatePasswordWithVerificationInput {
    newPassword: String!
    confirmPassword: String!
    token: String!
  }
  
  input ConvertFacebookAccountToLocalProviderInput {
    username: String!
    newPassword: String!
    confirmPassword: String!
    token: String!
  }
  
  input UpdateAvatarImageInput {
    file: Upload!
    sizeData: ImageSizeData!
  }
  
  input MyRecipesSearchInput {
    # search recipes by name
    name: String
    # search public recipes for userId
    userId: ID
    oilIds: [ID!]
    soapTypes: [SoapType!]
    properties: JSON
    showDeleted: Boolean
    additiveId: ID
  }
  
  
  # enums
  
  enum FriendStatus {
    friend
    notFriend
    pending
  }
`;

export const userResolvers = {
  User: {
    canonicalImage: (user, vars, { loaders }) => canonicalImage({ user, loaders }),
    gravatarHash: user => getGravatarHash(user),
    isAdmin: (obj, vars, { user }) => user.isAdmin
  },
  PublicUser: {
    canonicalImage: (user, vars, { loaders }) => canonicalImage({ user, loaders })
  },
  Query: {
    me: (obj, obj2, { user }) => user,

    user: (obj, { id }, { loaders }) => loaders.userById.load(id),

    myComments: (obj, { order, page }, { user }) =>
      getComments({ page, order, user, search: { userId: user.id } }),

    myCommentsSummary: (obj, obj2, { user }) =>
      summariser(Comment, getComments({ user, search: { userId: user.id } })),

    myFavouriteComments: (obj, { order, page }, { user }) =>
      getComments({ order, page, search: { favouriteForUserId: user.id } }),

    myFavouriteCommentsSummary: (obj, vars, { user }) =>
      summariser(Comment, getComments({ search: { favouriteForUserId: user.id } })),

    myFavouriteRecipes: (obj, { search, order, page: { offset, limit = 10 } = {} }, { user }) =>
      getFavouriteRecipesForUser({ user, search, offset, limit, order }),

    myFavouriteRecipesSummary: (obj, { search }, { user }) =>
      summariser(Recipe, getFavouriteRecipesForUser({ search, user })),

    myFavouritePosts: (obj, { page, order }, { user }) =>
      getPosts({ page, order, search: { favouriteForUserId: user.id } }),

    myFavouritePostsSummary: (obj, vars, { user }) =>
      summariser(Post, getPosts({ search: { favouriteForUserId: user.id } })),

    myForums: (obj, { page, order }, { user }) =>
      getForums({ currentUser: user, page, order, search: { mine: true, official: false } }),

    myForumsSummary: (obj, vars, { user }) =>
      summariser(Forum, getForums({ currentUser: user, search: { mine: true, official: false } })),

    mySubscribedForums: (obj, { page, order }, { user }) =>
      getForums({ currentUser: user, page, order, search: { subscribed: true } }),

    mySubscribedForumsSummary: (obj, { page, order }, { user }) =>
      summariser(Forum, getForums({ currentUser: user, page, order, search: { subscribed: true } })),

    myFriends: (obj, { page }, { user }) =>
      getUsers({ page, currentUser: user, search: { friendType: 'approved' } }),

    myFriendsSummary: (obj, vars, { user }) =>
      summariser(User, getUsers({ currentUser: user, search: { friendType: 'approved' } })),

    myIncomingPendingFriends: (obj, { page }, { user }) =>
      getUsers({ page, currentUser: user, search: { friendType: 'pendingIncoming' } }),

    myIncomingPendingFriendsSummary: (obj, vars, { user }) =>
      summariser(User, getUsers({ currentUser: user, search: { friendType: 'pendingIncoming' } })),

    myRecipes: (obj, { order, page, search }, { user }) =>
      getRecipes({ user, order, page, search: { userId: user.id, ...search } }),

    myRecipesSummary: (obj, { order, page, search }, { user }) =>
      // eslint-disable-next-line max-len
      summariser(Recipe, getRecipes({ user, order, page, search: { userId: user.id, additiveId: search?.additiveId } })),

    myPosts: (obj, { order, page }, { user }) =>
      getPosts({ order, page, search: { userId: user.id } }),

    myPostsSummary: (obj, { order, page }, { user }) =>
      summariser(Post, getPosts({ order, page, search: { userId: user.id } })),

    myFriendsRecipes: (obj, { search, page, order }, { user }) => getFriendsRecipes({ user, search, page, order }),

    myFriendsRecipesSummary: (obj, { search }, { user }) =>
      summariser(Recipe, getFriendsRecipes({ user, search })),

    validUsername: (obj, { username }) => Verification.query()
      .where({
        providerId: username,
        providerName: 'local'
      })
      .limit(1)
      .then(v => _.isEmpty(v)),

    userFriendStatus: (obj, { userId }, { user }) => userFriendStatus({ userId, user })
  },
  Mutation: {
    localSignup: (obj, { username, password, email }) => localSignup({
      username,
      password,
      email
    }),

    localUserLogin: (obj, { username, password, rememberMe }) => localLogin({
      username,
      password,
      rememberMe
    }),

    verificationUserLoginOrSignup: (obj, { provider, token, rememberMe }) => verificationUserLoginOrSignup({
      provider,
      token,
      rememberMe
    }),

    updateMe: (obj, { input }, { user }) => updateMe({
      user,
      input
    }),

    updatePassword: (obj, { input }, { user }) => updateMyPassword({
      user,
      input
    }),

    sendResetEmailPassword: (obj, { input }) => sendResetEmailPassword({ input }),
    sendRecoverFacebookAccount: (obj, { input }) => sendResetFacebookPassword({ input }),

    verifyPasswordResetCode: (obj, { input }) => verifyPasswordResetCode({ input }),
    verifyFacebookRecoveryCode: (obj, { input }) => verifyFacebookRecoveryCode({ input }),

    updatePasswordWithVerificationToken: (obj, { input }) => updatePasswordWithVerificationToken({ input }),
    convertFacebookAccountToLocalProvider: (obj, { input }) => convertFacebookAccountToLocalProvider({ input }),

    deleteMyAccount: (obj, input, { user }) => deleteMyAccount({ user }),
    renewToken: (obj, { token }, { user }) => renewToken({ user, token }),
    updateAvatarImage: (obj, { input }, { user }) => updateAvatarImage({ input, user })
  }
};

function canonicalImage({ user, loaders }) {
  return loaders.userProfileImageFromImageable.load(user.id)
    .then((image) => {
      if (image) {
        return getImageUrl(image);
      } else if (user.imageUrl) {
        return user.imageUrl;
      } else if (user.email) {
        const hash = getGravatarHash(user);

        return `https://www.gravatar.com/avatar/${hash}?s=300&r=g`;
      } else {
        return '/images/avatar.png';
      }
    });
}
