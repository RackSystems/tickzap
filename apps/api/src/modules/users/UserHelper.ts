import { UserStatus } from "./UserStatusEnum";

export function isValidUserStatus(status: string): boolean {
  return Object.keys(UserStatus)
    .map((key) => UserStatus[key as keyof typeof UserStatus] === status)
    .some(Boolean);
}
