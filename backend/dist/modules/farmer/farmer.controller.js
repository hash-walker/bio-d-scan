"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.farmerController = void 0;
const farmer_service_1 = require("./farmer.service");
exports.farmerController = {
    async create(req, res, next) {
        try {
            const farmer = await farmer_service_1.farmerService.create(req.body);
            res.status(201).json(farmer);
        }
        catch (err) {
            next(err);
        }
    },
    async getAll(req, res, next) {
        try {
            const farmers = await farmer_service_1.farmerService.getAll();
            res.json(farmers);
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            const farmer = await farmer_service_1.farmerService.getById(req.params.id);
            res.json(farmer);
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            const farmer = await farmer_service_1.farmerService.update(req.params.id, req.body);
            res.json(farmer);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=farmer.controller.js.map