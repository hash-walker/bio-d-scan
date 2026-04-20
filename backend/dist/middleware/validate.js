"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
/** Validates req.body against a Zod schema. Attaches parsed data to req.body. */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: "Validation error", details: result.error.errors });
            return;
        }
        req.body = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map