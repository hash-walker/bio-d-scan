"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFarmerSchema = exports.CreateFarmerSchema = void 0;
const zod_1 = require("zod");
exports.CreateFarmerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    farm_name: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
    location: zod_1.z.string().min(1),
    lat: zod_1.z.number().optional().default(0),
    lng: zod_1.z.number().optional().default(0),
    field_area_ha: zod_1.z.number().positive(),
    farming_method: zod_1.z.enum(["organic", "transitioning", "commercial"]),
    water_source: zod_1.z.enum(["rainFed", "irrigated", "mixed"]),
    primary_crops: zod_1.z.string().optional(),
});
exports.UpdateFarmerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    farm_name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
    field_area_ha: zod_1.z.number().positive().optional(),
    farming_method: zod_1.z
        .enum(["organic", "transitioning", "commercial"])
        .optional(),
    water_source: zod_1.z.enum(["rainFed", "irrigated", "mixed"]).optional(),
    primary_crops: zod_1.z.string().optional(),
});
//# sourceMappingURL=farmer.schema.js.map