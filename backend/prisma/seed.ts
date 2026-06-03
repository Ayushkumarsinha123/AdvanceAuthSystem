// prisma/seed.ts
import {prisma} from "../src/lib/prisma.js";

declare const process: { exit(code?: number): never };



async function main() {
  console.log(" Starting database seeding operations...");

  // 1. Clear out any existing seed states safely to prevent duplicate key violations
  await prisma.rolePermission.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});

  console.log("Cleaned old RBAC table rows.");

  // 2. Create foundational Permissions inside the database
  const manageUserRoles = await prisma.permission.create({
    data: { name: "MANAGE_USER_ROLES" },
  });

  const readAdminData = await prisma.permission.create({
    data: { name: "READ_ADMIN_DATA" },
  });

  console.log("Base permissions successfully generated.");

  // 3. Create foundational Roles inside the database
  const adminRole = await prisma.role.create({
    data: { name: "ADMIN" },
  });

  const userRole = await prisma.role.create({
    data: { name: "USER" },
  });

  console.log("Base system roles successfully generated.");

  // 4. Bind Permissions to the ADMIN Role using your join table (RolePermission)
  await prisma.rolePermission.createMany({
    data: [
      { roleId: adminRole.id, permissionId: manageUserRoles.id },
      { roleId: adminRole.id, permissionId: readAdminData.id },
    ],
  });

  console.log(" Successfully mapped permissions to the ADMIN role.");
  console.log(" Database seeding sequence complete!");
}

main()
  .catch((e) => {
    console.error("Seeding process encountered a severe failure:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
