"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const getDatabaseUrl = () => {
    if (process.env.NODE_ENV === 'development' && process.env.DIRECT_URL) {
        console.log('🔄 Using direct database connection for development');
        return process.env.DIRECT_URL;
    }
    return process.env.DATABASE_URL;
};
const prisma = globalThis.prisma || new client_1.PrismaClient({
    datasources: {
        db: {
            url: getDatabaseUrl()
        }
    }
});
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map