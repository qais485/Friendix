export const USERNAME_REGEX = /^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$/;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export function isValidUsername(value: string): boolean {
  return (
    value.length >= USERNAME_MIN_LENGTH &&
    value.length <= USERNAME_MAX_LENGTH &&
    USERNAME_REGEX.test(value)
  );
}

export function smartUsername(fullName: string): string {
  const slug = fullName.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  return slug || "user";
}
