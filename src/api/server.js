"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', routes_1.default);
// error handler
app.use((err, req, res, next) => {
    if (err && err.errors) { // zod
        return res.status(422).json({ errors: err.errors });
    }
    console.error(err);
    res.status(500).json({ error: err.message || 'internal' });
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`TN10 API listening on ${port}`));
exports.default = app;
//# sourceMappingURL=server.js.map