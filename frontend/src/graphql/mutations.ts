/**
 * GraphQL Mutations
 * Defines all GraphQL mutation queries
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { gql } from '@apollo/client'

/**
 * Login mutation
 * Authenticates user and returns access token and user data
 * Refresh token is sent as HTTP-only cookie (not in response)
 */
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        uuid
        firstName
        lastName
        email
        role
      }
    }
  }
`

/**
 * Register mutation
 * Creates a new user account and returns access token and user data
 * Refresh token is sent as HTTP-only cookie (not in response)
 */
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        uuid
        firstName
        lastName
        email
        role
      }
    }
  }
`

/**
 * Refresh token mutation
 * Generates new access token using refresh token from HTTP-only cookie
 * Refresh token is sent as HTTP-only cookie (not in mutation parameter or response)
 * @param extendSession - If true, always rotates refresh token (user clicked "Yes" on dialog)
 *                        If false or undefined, only rotates if refresh token has >10 seconds remaining
 */
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($extendSession: Boolean) {
    refreshToken(extendSession: $extendSession) {
      accessToken
    }
  }
`

/**
 * Update user mutation
 * Updates user information (firstName, lastName, email, role)
 * @param id - User ID to update
 * @param input - User update input fields
 */
export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      uuid
      firstName
      lastName
      email
      role
      createdAt
      updatedAt
    }
  }
`

/**
 * Create user mutation
 * Creates a new user account (admin function)
 * @param input - User creation input fields
 */
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      uuid
      firstName
      lastName
      email
      role
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete user mutation
 * Soft deletes user by setting is_deleted flag to true
 * @param id - User ID to delete
 */
export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`

/**
 * Create project mutation
 * Creates a new project
 * @param input - Project creation input fields
 */
export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      status
      createdAt
      updatedAt
    }
  }
`

/**
 * Update project mutation
 * Updates project information (name, description, status)
 * @param id - Project ID to update
 * @param input - Project update input fields
 */
export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      status
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete project mutation
 * Deletes a project permanently
 * @param id - Project ID to delete
 */
export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`

/**
 * Like project mutation
 * Allows authenticated users to like a project
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param projectId - Project ID to like
 */
export const LIKE_PROJECT_MUTATION = gql`
  mutation LikeProject($projectId: ID!) {
    likeProject(projectId: $projectId) {
      success
      message
      likesCount
      isLiked
    }
  }
`

/**
 * Like task mutation
 * Allows authenticated users to like a task
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param taskId - Task ID to like
 */
export const LIKE_TASK_MUTATION = gql`
  mutation LikeTask($taskId: ID!) {
    likeTask(taskId: $taskId) {
      success
      message
      likesCount
      isLiked
    }
  }
`

/**
 * Like comment mutation
 * Allows authenticated users to like a comment
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param commentId - Comment ID to like
 */
export const LIKE_COMMENT_MUTATION = gql`
  mutation LikeComment($commentId: ID!) {
    likeComment(commentId: $commentId) {
      success
      message
      likesCount
      isLiked
    }
  }
`

/**
 * Create comment mutation
 * Creates a new comment for a project
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param projectId - Project ID to comment on
 * @param content - Comment content
 */
export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($projectId: ID!, $content: String!) {
    createComment(projectId: $projectId, content: $content) {
      id
      uuid
      content
      taskId
      user {
        id
        firstName
        lastName
        email
      }
      likesCount
      isLiked
      createdAt
      updatedAt
    }
  }
`

/**
 * Update comment mutation
 * Updates an existing comment
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param commentId - Comment ID to update
 * @param content - New comment content
 */
export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($commentId: ID!, $content: String!) {
    updateComment(commentId: $commentId, content: $content) {
      id
      uuid
      content
      taskId
      user {
        id
        firstName
        lastName
        email
      }
      likesCount
      isLiked
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete comment mutation
 * Deletes a comment
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param commentId - Comment ID to delete
 */
export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId)
  }
`

/**
 * Create tag mutation
 * Creates a new tag
 * @param input - Tag creation input fields
 */
export const CREATE_TAG_MUTATION = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      name
      description
      title
      type
      category
      createdAt
      updatedAt
    }
  }
`

/**
 * Update tag mutation
 * Updates tag information (name, description, title, type, category)
 * @param id - Tag ID to update
 * @param input - Tag update input fields
 */
export const UPDATE_TAG_MUTATION = gql`
  mutation UpdateTag($id: ID!, $input: UpdateTagInput!) {
    updateTag(id: $id, input: $input) {
      id
      name
      description
      title
      type
      category
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete tag mutation
 * Deletes a tag permanently
 * @param id - Tag ID to delete
 */
export const DELETE_TAG_MUTATION = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`

/**
 * Create task mutation
 * Creates a new task with optional tag associations
 *
 * @author Thang Truong
 * @date 2025-11-25
 * @param input - Task creation input fields including tagIds
 */
export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      uuid
      title
      description
      status
      priority
      dueDate
      projectId
      assignedTo
      tags {
        id
        name
        description
        category
      }
      createdAt
      updatedAt
    }
  }
`

/**
 * Update task mutation
 * Updates task information including tag associations
 *
 * @author Thang Truong
 * @date 2025-11-25
 * @param id - Task ID to update
 * @param input - Task update input fields including tagIds
 */
export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      uuid
      title
      description
      status
      priority
      dueDate
      projectId
      assignedTo
      tags {
        id
        name
        description
        category
      }
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete task mutation
 * Deletes a task (soft delete)
 * @param id - Task ID to delete
 */
export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`

/**
 * Create notification mutation
 * Creates a new notification
 * @param input - Notification creation input fields
 */
export const CREATE_NOTIFICATION_MUTATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
      id
      userId
      message
      isRead
      createdAt
      updatedAt
    }
  }
`

/**
 * Update notification mutation
 * Updates notification information
 * @param id - Notification ID to update
 * @param input - Notification update input fields
 */
export const UPDATE_NOTIFICATION_MUTATION = gql`
  mutation UpdateNotification($id: ID!, $input: UpdateNotificationInput!) {
    updateNotification(id: $id, input: $input) {
      id
      userId
      message
      isRead
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete notification mutation
 * Deletes a notification permanently
 * @param id - Notification ID to delete
 */
export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`

/**
 * Create activity mutation
 * Creates a new activity log entry
 * @param input - Activity log creation input fields
 */
export const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($input: CreateActivityLogInput!) {
    createActivity(input: $input) {
      id
      userId
      targetUserId
      projectId
      taskId
      action
      type
      metadata
      createdAt
      updatedAt
    }
  }
`

/**
 * Update activity mutation
 * Updates activity log information
 * @param id - Activity log ID to update
 * @param input - Activity log update input fields
 */
export const UPDATE_ACTIVITY_MUTATION = gql`
  mutation UpdateActivity($id: ID!, $input: UpdateActivityLogInput!) {
    updateActivity(id: $id, input: $input) {
      id
      userId
      targetUserId
      projectId
      taskId
      action
      type
      metadata
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete activity mutation
 * Deletes an activity log entry permanently
 * @param id - Activity log ID to delete
 */
export const DELETE_ACTIVITY_MUTATION = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`

/**
 * Create team member mutation
 * Adds a user to a project team
 */
export const CREATE_TEAM_MEMBER_MUTATION = gql`
  mutation CreateTeamMember($input: CreateTeamMemberInput!) {
    createTeamMember(input: $input) {
      id
      projectId
      projectName
      userId
      memberName
      memberEmail
      role
      createdAt
      updatedAt
    }
  }
`

/**
 * Update team member mutation
 * Updates role for a project team member
 */
export const UPDATE_TEAM_MEMBER_MUTATION = gql`
  mutation UpdateTeamMember($input: UpdateTeamMemberInput!) {
    updateTeamMember(input: $input) {
      id
      projectId
      projectName
      userId
      memberName
      memberEmail
      role
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete team member mutation
 * Removes user from project team (soft delete)
 */
export const DELETE_TEAM_MEMBER_MUTATION = gql`
  mutation DeleteTeamMember($projectId: ID!, $userId: ID!) {
    deleteTeamMember(projectId: $projectId, userId: $userId)
  }
`

