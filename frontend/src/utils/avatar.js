export const DEFAULT_AVATAR = '/default-avatar.png';

export const getAvatar = (user) => {
  if (!user) return DEFAULT_AVATAR;
  if (typeof user === 'string') return DEFAULT_AVATAR; // fallback for name strings
  return user.profileImage || DEFAULT_AVATAR;
};
