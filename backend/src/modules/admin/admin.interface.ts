import { User , Role , UserRole} from '../../../generated/prisma/index.js'

export interface IAssignRoleDTO {
  userId: string;
  roleId: string;
}

export interface IAdminRepository {
  findUserById(userId: string): Promise<User | null>;
  findRoleByName(roleName: string): Promise<Role | null>;
  assignRoleToUser(data: IAssignRoleDTO): Promise<UserRole>;
  removeRoleFromUser(userId: string, roleId: string): Promise<void>;
  getUserRolesAndPermissions(userId: string): Promise<any>;
}