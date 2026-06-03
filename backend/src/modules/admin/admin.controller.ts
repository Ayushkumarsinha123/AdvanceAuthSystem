import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service.js";

export class AdminController {
  constructor(private adminService: AdminService) {}

  assignRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId, roleName } = req.body;

      const assignment = await this.adminService.assignRole(userId, roleName);
      res.status(200).json({
        success: true,
        message: `Successfully assigned the role '${roleName.toUpperCase()}' to the target user.`,
        data: {
          userId: assignment.userId,
          roleId: assignment.roleId,
          assignedAt: assignment.assignedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
