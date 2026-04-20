"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureBackupsController = void 0;
const capture_backups_service_1 = require("./capture-backups.service");
const error_handler_1 = require("../../middleware/error-handler");
function parsePositiveInt(value, fallback) {
    if (!value)
        return fallback;
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0)
        return fallback;
    return parsed;
}
exports.captureBackupsController = {
    async listCaptures(req, res, next) {
        try {
            const limit = Math.min(parsePositiveInt(req.query.limit, 100), 500);
            const offset = parsePositiveInt(req.query.offset, 0);
            const payload = await capture_backups_service_1.captureBackupsService.listCaptures(limit, offset);
            res.json(payload);
        }
        catch (err) {
            next(err);
        }
    },
    async listRuns(req, res, next) {
        try {
            const limit = Math.min(parsePositiveInt(req.query.limit, 5), 20);
            const offset = parsePositiveInt(req.query.offset, 0);
            const payload = await capture_backups_service_1.captureBackupsService.listRuns(limit, offset);
            res.json(payload);
        }
        catch (err) {
            next(err);
        }
    },
    async getRunCaptures(req, res, next) {
        try {
            const runId = req.params.runId;
            if (!runId)
                throw (0, error_handler_1.createError)("Backup run id is required", 400);
            const limit = Math.min(parsePositiveInt(req.query.limit, 24), 100);
            const offset = parsePositiveInt(req.query.offset, 0);
            const payload = await capture_backups_service_1.captureBackupsService.getRunCaptures(runId, limit, offset);
            res.json(payload);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=capture-backups.controller.js.map