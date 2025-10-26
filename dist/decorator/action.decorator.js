"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Actions = void 0;
const common_1 = require("@nestjs/common");
const Actions = (...actions) => (0, common_1.SetMetadata)("actions", actions);
exports.Actions = Actions;
//# sourceMappingURL=action.decorator.js.map