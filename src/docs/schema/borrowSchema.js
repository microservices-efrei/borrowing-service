/**
 * @swagger
 * components:
 *   schemas:
 *     Borrowing:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the borrowing record (UUID)
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The UUID of the user who borrowed the book
 *         bookId:
 *           type: string
 *           format: uuid
 *           description: The UUID of the book that was borrowed
 *         borrowedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the book was borrowed
 *         returnedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the book was returned (null if not returned)
 *         isAvailable:
 *           type: boolean
 *           description: Indicates whether the book is available for borrowing (false if borrowed)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the borrowing record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last time the borrowing record was updated
 *       required:
 *         - userId
 *         - bookId
 *         - isAvailable
 *         - borrowedAt
 */
