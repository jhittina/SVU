const STORAGE_KEY = "svu_brick_types";
const DEFAULTS = [
  "Fly Ash Brick",
  "Cement Brick",
  "Pond Ash Brick",
  "Pavers Block",
  "Type A",
  "Type B",
];

export const getBrickTypes = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [...DEFAULTS];
  } catch {
    return [...DEFAULTS];
  }
};

export const saveBrickType = (type) => {
  if (!type || !type.trim()) return;
  const types = getBrickTypes();
  const trimmed = type.trim();
  if (!types.includes(trimmed)) {
    types.push(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
  }
};

export const deleteBrickType = (type) => {
  const types = getBrickTypes().filter((t) => t !== type);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
};
