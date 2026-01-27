export const getImageUri = path => {
  if (!path) return null;

  // Already a full URL (S3, Google, etc.)
  if (path.startsWith('http')) {
    return path;
  }

  // Local server image
  return `https://api.reparv.in/${path}`;
};
export const parseFrontView = frontView => {
  try {
    return JSON.parse(frontView || '[]');
  } catch {
    return [];
  }
};