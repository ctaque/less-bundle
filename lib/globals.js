"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isString(obj) {
    return typeof obj === 'string';
}
function validate(config) {
    var errors = [];
    if (!isString(config.filename)) {
        errors.push('Error: input config property must be a string');
    }
    if (!isString(config.fileContent)) {
        errors.push('Error: input config property must be a string');
    }
    return errors;
}
/**
 * Creates the config.
 *
 * @param cfg The root config.
 */
function initialize(cfg) {
    if (!cfg) {
        throw new Error('No config specified');
    }
    exports.config = cfg;
    var errors = validate(exports.config);
    if (errors.length > 0) {
        errors.forEach(function (error) { console.log(error); });
        throw new Error('Invalid config');
    }
    return exports.config;
}
exports.initialize = initialize;
exports.writers = [], exports.output = [], 
// hashes the import statements
exports.imports = {}, 
// Finds all the <script src="" /> tags
exports.hrefRegex = /href=("[^"]*)/, 
// Finds the start comment Node
// startRegex = /<!--\s*less-bundle-start/,
// Finds the end comment Node
// endRegex = /<!--\s*less-bundle-end/,
// Finds the string literal in a string
exports.stringLiteralRegex = /.*(?:'|")(.*)(?:'|").*/, 
// Tests for less file
exports.lessFileRegex = /.less$/, 
// Tests for css file
exports.cssFileRegex = /.css$/;
