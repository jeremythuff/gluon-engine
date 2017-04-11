"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameControllereRegistry = require("../registries/GameControllerRegistry");
function While() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return function (targetClass, methodName, descriptor) {
        var rbMap = GameControllereRegistry.getWhileCBMapByName(targetClass.constructor.name);
        inputs.forEach(function (input) {
            input = input instanceof Array ? input : [input];
            var cbMap = rbMap.get(input);
            cbMap ? cbMap.push(descriptor.value) : rbMap.set(input, [descriptor.value]);
        });
    };
}
exports.default = While;
;
//# sourceMappingURL=WhileAny.js.map