const User = require('../models/User');
const Rating = require('../models/Rating');

/**
 * Reconciles averageRating and ratingsCount for all users in MongoDB
 * based strictly on real ratings present in the ratings collection.
 * Users with no ratings are reset to averageRating: 0 and ratingsCount: 0.
 */
const reconcileAllUserRatings = async () => {
  try {
    const users = await User.find({});
    let updatedCount = 0;

    for (const u of users) {
      const realRatings = await Rating.find({ teacher: u._id });
      const actualCount = realRatings.length;
      const actualAvg =
        actualCount > 0
          ? Number(
              (
                realRatings.reduce((sum, r) => sum + Number(r.overallRating || 0), 0) /
                actualCount
              ).toFixed(1)
            )
          : 0;

      if (u.averageRating !== actualAvg || u.ratingsCount !== actualCount) {
        await User.findByIdAndUpdate(u._id, {
          averageRating: actualAvg,
          ratingsCount: actualCount,
        });
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`[Rating Reconciler] Successfully synchronized real ratings for ${updatedCount} user(s).`);
    }
  } catch (err) {
    console.error('[Rating Reconciler] Error reconciling user ratings:', err.message);
  }
};

/**
 * Recomputes and updates a single user's averageRating and ratingsCount
 * based on actual ratings in the database.
 */
const reconcileSingleUserRating = async (userId) => {
  try {
    const realRatings = await Rating.find({ teacher: userId });
    const actualCount = realRatings.length;
    const actualAvg =
      actualCount > 0
        ? Number(
            (
              realRatings.reduce((sum, r) => sum + Number(r.overallRating || 0), 0) /
              actualCount
            ).toFixed(1)
          )
        : 0;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        averageRating: actualAvg,
        ratingsCount: actualCount,
      },
      { new: true }
    );

    return {
      averageRating: actualAvg,
      ratingsCount: actualCount,
      user: updatedUser,
    };
  } catch (err) {
    console.error(`[Rating Reconciler] Error reconciling rating for user ${userId}:`, err.message);
    throw err;
  }
};

module.exports = {
  reconcileAllUserRatings,
  reconcileSingleUserRating,
};
