"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertUserByEmail = upsertUserByEmail;
exports.getUserById = getUserById;
const prisma_1 = require("../infrastructure/prisma");
async function upsertUserByEmail(email, password, role) {
    return prisma_1.prisma.user.upsert({
        where: { email },
        update: { password, role },
        create: { email, password, role },
    });
}
async function getUserById(id) {
    return prisma_1.prisma.user.findUnique({ where: { id } });
}
//# sourceMappingURL=userService.js.map