"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.govController = void 0;
const gov_service_1 = require("./gov.service");
exports.govController = {
    async getOverview(req, res, next) {
        try {
            const overview = await gov_service_1.govService.getOverview();
            res.json(overview);
        }
        catch (err) {
            next(err);
        }
    },
    async getFarmerDetails(req, res, next) {
        try {
            const data = await gov_service_1.govService.getFarmerDetails(req.params.farmerId);
            if (!data) {
                res.status(404).json({ error: "Farmer not found" });
                return;
            }
            res.json(data);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=gov.controller.js.map