"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const errors_1 = require("../../application/errors");
function validate(schemas) {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.params) {
                schemas.params.parse(req.params);
            }
            if (schemas.query) {
                schemas.query.parse(req.query);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const firstIssue = error.issues[0];
                const suffix = firstIssue ? `: ${firstIssue.message}` : '';
                return next(new errors_1.AppError(422, 'VALIDATION_ERROR', `Validation failed${suffix}`));
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validation.js.map