export const initials = (name: string): string => {
  const names = name.split(" ");
  if (names.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }

  return names[0]?.[0] ?? "" + names[names.length - 1]?.[0] ?? "";
};
