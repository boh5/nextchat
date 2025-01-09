// Generate placeholder avatars using DiceBear API
// https://www.dicebear.com/playground

export const generatePlaceholderAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=65c9ff,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

// For user avatars
export const userAvatars = {
  user1: generatePlaceholderAvatar('alex'),
  user2: generatePlaceholderAvatar('bella'),
  user3: generatePlaceholderAvatar('chris'),
  user4: generatePlaceholderAvatar('diana'),
  user5: generatePlaceholderAvatar('ethan'),
};

// For group avatars
export const groupAvatars = {
  group1: generatePlaceholderAvatar('tech-team'),
  group2: generatePlaceholderAvatar('project-alpha'),
  group3: generatePlaceholderAvatar('design-team'),
  group4: generatePlaceholderAvatar('marketing'),
  group5: generatePlaceholderAvatar('general'),
};
