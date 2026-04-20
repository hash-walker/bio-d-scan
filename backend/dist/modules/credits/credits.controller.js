"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditsController = void 0;
const credits_service_1 = require("./credits.service");
const credits_schema_1 = require("./credits.schema");
exports.creditsController = {
    async getBalance(req, res, next) {
        try {
            const balance = await credits_service_1.creditsService.getBalance(req.params.farmerId);
            res.json({ balance });
        }
        catch (err) {
            next(err);
        }
    },
    async getTransactions(req, res, next) {
        try {
            const txns = await credits_service_1.creditsService.getTransactions(req.params.farmerId);
            res.json(txns);
        }
        catch (err) {
            next(err);
        }
    },
    async redeem(req, res, next) {
        try {
            const input = credits_schema_1.RedeemSchema.parse(req.body);
            const result = await credits_service_1.creditsService.redeem(req.params.farmerId, input);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async release(req, res, next) {
        try {
            const input = credits_schema_1.ReleaseSchema.parse(req.body);
            const result = await credits_service_1.creditsService.release(input);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async getMarketplace(req, res, next) {
        try {
            const items = await credits_service_1.creditsService.getMarketplaceItems();
            res.json(items);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=credits.controller.js.map