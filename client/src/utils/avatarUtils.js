/**
 * Profile Avatar Utility
 *
 * Provides gender-safe, deterministic avatar selection based strictly on MongoDB user data:
 * - Male -> ONLY male avatar styles (short masculine hairstyles)
 * - Female -> ONLY female avatar styles (feminine hairstyles, 0% facial hair)
 * - No gender / unknown -> Clean neutral avatar
 *
 * Guarantees:
 * 1. Gender is never inferred from name or email.
 * 2. Avatars are deterministic per user (keyed by user._id) so page reload & re-login keep the same avatar.
 * 3. Multiple male or female users receive different, unique avatars (not a single fixed image).
 * 4. Never random (no Math.random()) and never based on array index.
 */

export const normalizeGender = (gender) => {
  if (!gender || typeof gender !== 'string') return '';
  const g = gender.trim().toLowerCase();
  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';
  return 'other';
};

export const getUserAvatar = (user) => {
  if (!user) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=neutral-campus&facialHairProbability=0';
  }

  // Handle direct string input
  if (typeof user === 'string') {
    if (user.startsWith('http://') || user.startsWith('https://') || user.startsWith('data:')) {
      // If it's a custom uploaded photo, return as-is
      if (!user.includes('dicebear.com')) {
        return user;
      }
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user)}&facialHairProbability=0`;
  }

  // If user has a genuine custom uploaded photo (not DiceBear), preserve it
  if (
    user.profileImage &&
    typeof user.profileImage === 'string' &&
    !user.profileImage.includes('dicebear.com') &&
    (user.profileImage.startsWith('http://') ||
      user.profileImage.startsWith('https://') ||
      user.profileImage.startsWith('data:'))
  ) {
    return user.profileImage;
  }

  const gender = normalizeGender(user.gender);

  // Deterministic seed based on unique user ID (never name or email)
  const seed = (user._id || user.id || 'campus-user').toString();

  if (gender === 'male') {
    // Strictly male hair cuts and styling
    const maleTops =
      'shortFlat,shortRound,shortWaved,theCaesar,theCaesarAndSidePart,sides,shavedSides,shortCurly,frizzle';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&top=${maleTops}`;
  }

  if (gender === 'female') {
    // Strictly female hair cuts and styling, 0% facial hair
    const femaleTops =
      'bob,bun,curly,curvy,longButNotTooLong,miaWallace,straight01,straight02,straightAndStrand,bigHair';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&top=${femaleTops}&facialHairProbability=0`;
  }

  // Neutral / default avatar for unselected gender or other
  const neutralTops = 'shortFlat,shortRound,bob,curly';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&top=${neutralTops}&facialHairProbability=0`;
};
