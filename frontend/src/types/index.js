/**
 * @typedef {'OWNER'|'EDITOR'|'COMMENTER'|'VIEWER'} DocumentRole
 */

/**
 * @typedef {'ROLE_ADMIN'|'ROLE_USER'|'ROLE_GUEST'} SystemRole
 */

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} name
 * @property {string} surname
 * @property {string} displayName
 * @property {string} email
 * @property {string|null} avatarUrl
 * @property {SystemRole} role
 * @property {string} createdAt
 * @property {string} lastSeenAt
 */

/**
 * @typedef {Object} Document
 * @property {number} id
 * @property {User} owner
 * @property {string} title
 * @property {string} content
 * @property {boolean} is_template
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} DocumentPermission
 * @property {number} id
 * @property {User} user
 * @property {Document} document
 * @property {DocumentRole} role
 * @property {string} invitedAt
 * @property {string|null} expiresAt
 */

/**
 * @typedef {Object} Comment
 * @property {number} id
 * @property {User} author
 * @property {Document} document
 * @property {Comment|null} parentComment
 * @property {string} content
 * @property {boolean} resolved
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} DocumentAsset
 * @property {number} id
 * @property {Document} document
 * @property {User} uploader
 * @property {string} fileName
 * @property {string} mimeType
 * @property {number} sizeBytes
 * @property {string} filePath
 * @property {string} createdAt
 */

/**
 * @typedef {Object} DocumentVersion
 * @property {number} id
 * @property {Document} document
 * @property {User} author
 * @property {string} snapshot
 * @property {number} versionNumber
 * @property {string} label
 * @property {string} createdAt
 */

/**
 * @typedef {Object} DocUpdateDto
 * @property {string} fromUserId
 * @property {'text-change'|'cursor'|'presence'} type
 * @property {Object} content
 * @property {string} timestamp
 */
