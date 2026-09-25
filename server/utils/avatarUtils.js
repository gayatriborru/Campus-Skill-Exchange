/**
 * Profile Avatar Utility (Backend)
 *
 * Generates gender-safe, deterministic avatar URLs based strictly on MongoDB user data:
 * - Male -> ONLY male avatar styles (short masculine hairstyles)
 * - Female -> ONLY female avatar styles (feminine hairstyles, 0% facial hair)
 * - No gender / unknown -> Clean neutral avatar
 */

const normalizeGender = (gender) => {
  if (!gender || typeof gender !== 'string') return '';
  const g = gender.trim().toLowerCase();
  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';
  return 'other';
};

const getUserAvatar = (user) => {
  if (!user) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=neutral-campus&facialHairProbability=0';
  }

  if (typeof user === 'string') {
    if (user.startsWith('http://') || user.startsWith('https://') || user.startsWith('data:')) {
      if (!user.includes('dicebear.com')) {
        return user;
      }
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user)}&facialHairProbability=0`;
  }

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
  const seed = (user._id || user.id || 'campus-user').toString();

  if (gender === 'male') {
    const maleTops =
      'shortFlat,shortRound,shortWaved,theCaesar,theCaesarAndSidePart,sides,shavedSides,shortCurly,frizzle';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&top=${maleTops}`;
  }

  if (gender === 'female') {
    const femaleTops =
      'bob,bun,curly,curvy,longButNotTooLong,miaWallace,straight01,straight02,straightAndStrand,bigHair';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&top=${femaleTops}&facialHairProbability=0`;
  }

  const neutralTops = 'shortFlat,shortRound,bob,curly';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&top=${neutralTops}&facialHairProbability=0`;
};

module.exports = {
  normalizeGender,
  getUserAvatar,
};
