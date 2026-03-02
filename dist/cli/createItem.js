"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const itemService_1 = require("../services/itemService");
(async () => {
    const item = await (0, itemService_1.createItem)(process.env.OWNER_ID, undefined);
    console.log(item.id);
})();
//# sourceMappingURL=createItem.js.map