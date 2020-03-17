"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_binding_1 = require("graphql-binding");
/**
 * Get the named fields from the selection of info's root field
 */
function getFieldsByName(name, info) {
    var infoField = info.fieldNodes[0];
    var selectionSet = infoField.selectionSet;
    if (!selectionSet)
        throw new Error("Field '" + infoField.name.value + "' have no selection.");
    var selections = selectionSet.selections;
    var found = selections.filter(function (field) { return field.kind === "Field" && field.name.value === name; });
    if (found.length > 0)
        return found;
    throw new Error("Field '" + name + "' not found in '" + infoField.name.value + "' selection");
}
function flatMap(array, mapper) {
    return [].concat.apply([], array.map(mapper));
}
function pluck(rootFieldName, operation, schema, fieldName, info, required) {
    var fields = getFieldsByName(fieldName, info);
    var oldSelections = flatMap(fields, function (field) {
        return [].concat(field.selectionSet.selections);
    });
    var newInfo = graphql_binding_1.buildInfo(rootFieldName, operation, schema, required);
    var selectionSet = newInfo.fieldNodes[0].selectionSet;
    if (required) {
        selectionSet.selections = selectionSet.selections.concat(oldSelections);
    }
    else {
        selectionSet.selections = oldSelections;
    }
    return newInfo;
}
exports.pluck = pluck;
//# sourceMappingURL=pluck.js.map