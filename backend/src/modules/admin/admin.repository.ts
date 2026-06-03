import {prisma} from '../../lib/prisma.js';
import { User, Role, UserRole } from '../../../generated/prisma/index.js';
import { IAdminRepository, IAssignRoleDTO } from './admin.interface.js';

export class AdminRepository implements IAdminRepository {
  async findUserById(userId : string) : Promise<User | null> {
    return prisma.user.findUnique({where : {id: userId}});
     }

     async findRoleByName(roleName : string) : Promise<Role | null> {
      return prisma.role.findUnique({ where : {name : roleName}});
    }

    async assignRoleToUser(data: IAssignRoleDTO): Promise<UserRole> {
      return prisma.userRole.create({
        data: {
          userId : data.userId,
          roleId : data.roleId,
        }
      })
    }

    async removeRoleFromUser(userId : string, roleId: string): Promise<void> {
      await prisma.userRole.delete({
        where: {
          userId_roleId : {userId, roleId},
        },
      });
    }

    async getUserRolesAndPermissions(userId: string): Promise<any> {
      return prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
    }
}