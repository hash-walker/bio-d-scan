"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseSchema = exports.RedeemSchema = void 0;
const zod_1 = require("zod");
exports.RedeemSchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive().default(1),
});
exports.ReleaseSchema = zod_1.z.object({
    farmerId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().int().positive(),
    description: zod_1.z.string().optional(),
});
//# sourceMappingURL=credits.schema.js.map