"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameControllereRegistry = require("../registries/GameControllerRegistry");
function When() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return function (targetClass, methodName, descriptor) {
        var rbMap = GameControllereRegistry.getWhenCBMapByName(targetClass.constructor.name);
        var cbMap = rbMap.get(inputs);
        inputs.forEach(function (input) {
            cbMap ? cbMap.push(descriptor.value) : rbMap.set([input], [descriptor.value]);
        });
    };
}
exports.default = When;
;
//# sourceMappingURL=WhenAny.js.map