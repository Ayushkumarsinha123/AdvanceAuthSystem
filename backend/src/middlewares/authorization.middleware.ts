import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import {prisma} from '../lib/prisma.js'


export const requirePermission = (requirePermission: string) => {
  return async (req : Request, res: Response , next : NextFunction) : Promise<void> => {
    try {
      if(!req.user || !req.user.id) {
        throw new AppError('authentication context missing',401);
      }

      // query postgressql to pull all permission associated with this user's roles
      // we look through User -> UserRole -> Role -> RolePermission -> Permission

      const userWithPermissions = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!userWithPermissions) {
        throw new AppError('User account associated with this token no longer exists.', 404);
      }
        //Flatten out the complex deep relationship tree array into a clean array of string names
      const userPermissionName = userWithPermissions.userRoles.flatMap((userRole) => 
        userRole.role.rolePermissions.map((rp) => rp.permission.name)
      );

      // Inspect if the target permission string exists inside our flattened user privileges list
      const hasAccess = userPermissionName.includes(requirePermission);

      // if they dont have permission to view this content
      if(!hasAccess) {
        throw new AppError(`you do not have the permission ${requirePermission}`, 403)
      }

      next();
    } catch(error) {
      next(error);
    }
  }
}