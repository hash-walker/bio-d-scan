"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
exports.authController = {
    async registerFarmer(req, res, next) {
        try {
            const result = await auth_service_1.authService.registerFarmer(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async registerGovernment(req, res, next) {
        try {
            const result = await auth_service_1.authService.registerGovernment(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async me(req, res, next) {
        try {
            const user = await auth_service_1.authService.getMe(req.auth.userId);
            res.json(user);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map