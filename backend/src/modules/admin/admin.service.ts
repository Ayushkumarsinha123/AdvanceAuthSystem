import { IAdminRepository } from "./admin.interface.js";
import { AppError } from "../../utils/AppError.js";

export class AdminService {
  constructor(private adminRepository : IAdminRepository) {}
  async assignRole(userId : string , roleName : string) {
    // verify the user exist
    const user = await this.adminRepository.findUserById(userId);
    if(!user) {
      throw new AppError('the target user account does not exist', 404);
    }
    // verify the requested role exist in the database
    const role = await this.adminRepository.findRoleByName(roleName.toUpperCase());
    if(!role) {
      throw new AppError(`the role ${roleName} does not exist`, 404);
    }
    // check if user already hold the role to prevent duplication
    const userPrivileges = await this.adminRepository.getUserRolesAndPermissions(userId);
    const alreadyHasRole = userPrivileges?.userRoles.some((ur: any) => ur.roleId === role.id);

    if(alreadyHasRole) {
      throw new AppError('user already has this role', 400);
    }

    //commit assignment
    return this.adminRepository.assignRoleToUser({userId, roleId : role.id});
  }
}