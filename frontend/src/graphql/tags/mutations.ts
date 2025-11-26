/**
 * Tags Mutations
 * GraphQL mutations for tag management
 * CRUD operations for tags
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Create tag mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
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
 *
 * @author Thang Truong
 * @date 2025-11-26
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
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_TAG_MUTATION = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`

