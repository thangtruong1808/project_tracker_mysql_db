/**
 * Tags Queries
 * GraphQL queries for tag data
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Tags query - fetch all tags
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const TAGS_QUERY = gql`
  query Tags {
    tags {
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

