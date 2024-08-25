const db = require("../config/dbConfig"); // Adjust the path based on your project structure

exports.findShare = async (reviewId, userId) => {
  try {
    const query = 'SELECT * FROM shares WHERE review_id = ? AND user_id = ?';
    const [result] = await db.execute(query, [reviewId, userId]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    throw new Error('Failed to find share record');
  }
};
exports.isReviewShared = async (reviewId, userId) => {
  try {
    const query = 'SELECT * FROM shares WHERE review_id = ? AND user_id = ?';
    const [result] = await db.execute(query, [reviewId, userId]);
    return result.length > 0; // Returns true if shared, false otherwise
  } catch (error) {
    throw new Error('Failed to check if review is shared');
  }
};
exports.createShare = async (reviewId, userId) => {
  try {
    // Get the current date and time
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0]; // HH:MM:SS

    const query = `
      INSERT INTO shares (review_id, user_id, date, time) 
      VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [reviewId, userId, date, time]);
  } catch (error) {
    throw new Error('Failed to create share record');
  }
};
exports.incrementShareCount = async (reviewId, userId) => {
  try {
    const query = 'UPDATE shares SET share_count = share_count + 1 WHERE review_id = ? AND user_id = ?';
    await db.execute(query, [reviewId, userId]);
  } catch (error) {
    throw new Error('Failed to increment share count');
  }
};
exports.incrementShareCount = async (reviewId, userId) => {
  try {
    const query = 'UPDATE shares SET share_count = share_count + 1 WHERE review_id = ? AND user_id = ?';
    await db.execute(query, [reviewId, userId]);
  } catch (error) {
    throw new Error('Failed to increment share count');
  }
};
exports.removeShare = async (reviewId, userId) => {
  try {
    const query = 'DELETE FROM shares WHERE review_id = ? AND user_id = ?';
    await db.execute(query, [reviewId, userId]);
  } catch (error) {
    throw new Error('Failed to remove share record');
  }
};


exports.getSharedReviewsByUser = async (userId) => {
  try {
    console.log('Fetching shared reviews for user:', userId); // Log the incoming user ID

    const query = `
      SELECT reviewed.review_id, 
             reviewed.book_id, 
             reviewed.user_id, 
             s1.user_id AS sharedUserId,   -- Add sharedUserId to the select statement
             book.imageUrl, 
             book.title, 
             book.author, 
             reviewed.context, 
             reviewed.rating, 
             reviewed.date,
             u1.username AS reviewer_username,   -- Username of the person who wrote the review
             u2.username AS sharer_username,     -- Username of the person who shared the review
             COUNT(DISTINCT likes.user_id) AS likesCount,
             COUNT(DISTINCT comments.comment_id) AS commentsCount,
             COUNT(DISTINCT s2.share_id) AS sharesCount
      FROM shares s1
      INNER JOIN reviewed ON s1.review_id = reviewed.review_id
      INNER JOIN user u1 ON reviewed.user_id = u1.user_id   -- Join to get the reviewer's username
      INNER JOIN book ON reviewed.book_id = book.book_id
      LEFT JOIN likes ON likes.review_id = reviewed.review_id
      LEFT JOIN comments ON comments.review_id = reviewed.review_id
      LEFT JOIN shares s2 ON s2.review_id = reviewed.review_id
      INNER JOIN user u2 ON s1.user_id = u2.user_id         -- Join to get the sharer's username
      WHERE s1.user_id = ?
      GROUP BY reviewed.review_id, reviewed.book_id, reviewed.user_id, s1.user_id, book.imageUrl, book.title, book.author, reviewed.context, reviewed.rating, reviewed.date, u1.username, u2.username;
    `;

    console.log('Executing query:', query); // Log the query being executed
    const [rows] = await db.execute(query, [userId]);
    console.log('Query result:', rows); // Log the results of the query
    return rows;
  } catch (error) {
    console.error('Error in getSharedReviewsByUser:', error.message); // Log the error message
    throw new Error('Failed to fetch shared reviews');
  }
};

exports.getUsersWhoSharedReview = async (reviewId) => {
  try {
    const query = `
      SELECT user.user_id, user.username
      FROM shares
      JOIN user ON shares.user_id = user.user_id
      WHERE shares.review_id = ?
    `;

    const [rows] = await db.execute(query, [reviewId]);
    return rows;
  } catch (error) {
    throw new Error(`Failed to retrieve users who shared the review: ${error.message}`);
  }
};

exports.getReviewsSharedByUserOrderofTime = async (userId) => {
  try {
    const query = `
      SELECT reviewed.review_id, 
             reviewed.book_id, 
             reviewed.user_id, 
             book.imageUrl, 
             book.title, 
             book.author, 
             reviewed.context, 
             reviewed.rating, 
             shares.date, 
             shares.time,
             u1.username AS reviewer_username,  
             COUNT(DISTINCT likes.user_id) AS likesCount,
             COUNT(DISTINCT comments.comment_id) AS commentsCount,
             COUNT(DISTINCT shares2.share_id) AS sharesCount
      FROM shares
      INNER JOIN reviewed ON shares.review_id = reviewed.review_id
      INNER JOIN user u1 ON reviewed.user_id = u1.user_id
      INNER JOIN book ON reviewed.book_id = book.book_id
      LEFT JOIN likes ON likes.review_id = reviewed.review_id
      LEFT JOIN comments ON comments.review_id = reviewed.review_id
      LEFT JOIN shares shares2 ON shares2.review_id = reviewed.review_id
      WHERE shares.user_id = ?
      GROUP BY reviewed.review_id, reviewed.book_id, reviewed.user_id, shares.date, shares.time, book.imageUrl, book.title, book.author, reviewed.context, reviewed.rating, u1.username
      ORDER BY shares.date DESC, shares.time DESC;
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  } catch (error) {
    throw new Error('Failed to fetch shared reviews for the user: ' + error.message);
  }
};
