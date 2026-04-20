"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capturesController = void 0;
const captures_service_1 = require("./captures.service");
const captures_schema_1 = require("./captures.schema");
const error_handler_1 = require("../../middleware/error-handler");
const capture_backups_controller_1 = require("./capture-backups.controller");
exports.capturesController = {
    getBackupCaptures: capture_backups_controller_1.captureBackupsController.listCaptures,
    getBackupRuns: capture_backups_controller_1.captureBackupsController.listRuns,
    getBackupRunCaptures: capture_backups_controller_1.captureBackupsController.getRunCaptures,
    async getAll(req, res, next) {
        try {
            const { farmerId, kind, limit } = req.query;
            const captures = await captures_service_1.capturesService.getAll({
                farmerId,
                kind,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json(captures);
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            const capture = await captures_service_1.capturesService.getById(req.params.id);
            if (!capture)
                throw (0, error_handler_1.createError)("Capture not found", 404);
            res.json(capture);
        }
        catch (err) {
            next(err);
        }
    },
    async getStats(req, res, next) {
        try {
            const stats = await captures_service_1.capturesService.getStats();
            res.json(stats);
        }
        catch (err) {
            next(err);
        }
    },
    /** HTTP POST endpoint — alternative to MQTT for the AI model to push captures. */
    async ingest(req, res, next) {
        try {
            const parsed = captures_schema_1.MqttCaptureSchema.parse(req.body);
            const capture = await captures_service_1.capturesService.ingest(parsed);
            res.status(201).json(capture);
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=captures.controller.js.map