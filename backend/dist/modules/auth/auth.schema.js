"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterGovernmentSchema = exports.RegisterFarmerSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.RegisterFarmerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    farm_name: zod_1.z.string().min(2),
    phone: zod_1.z.string().optional(),
    location: zod_1.z.string().min(2),
    lat: zod_1.z.number().optional().default(0),
    lng: zod_1.z.number().optional().default(0),
    field_area_ha: zod_1.z.number().positive(),
    farming_method: zod_1.z.enum(["organic", "transitioning", "commercial"]),
    water_source: zod_1.z.enum(["rainFed", "irrigated", "mixed"]),
    primary_crops: zod_1.z.string().optional(),
});
exports.RegisterGovernmentSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    department: zod_1.z.string().min(2),
});
//# sourceMappingURL=auth.schema.js.map