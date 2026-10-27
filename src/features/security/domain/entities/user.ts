export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly roles: string[];

  constructor(id: string, username: string, roles: string[]) {
    this.id = id;
    this.username = username;
    this.roles = roles;
  }

  public hasPermission(permission: string): boolean {
    if (this.roles.includes('admin')) return true;
    return this.roles.includes(permission);
  }
}
