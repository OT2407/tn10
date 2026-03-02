export declare function upsertUserByEmail(email: string, password: string, role: string): Promise<{
    password: string;
    id: string;
    createdAt: Date;
    role: string;
    email: string;
}>;
export declare function getUserById(id: string): Promise<{
    password: string;
    id: string;
    createdAt: Date;
    role: string;
    email: string;
} | null>;
//# sourceMappingURL=userService.d.ts.map