"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs = require("fs");
var path = require("path");
var Writer = require("./writer");
var globals = require("./globals");
var axios_1 = __importDefault(require("axios"));
function buildContents(lines, filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var writers, imports, lessRegex, cssRegex, stringLiteralRegex, currentLines, line, hashPath, imported, file, splitLines, index, deTildedImport, response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    writers = globals.writers, imports = globals.imports, lessRegex = globals.lessFileRegex, cssRegex = globals.cssFileRegex, stringLiteralRegex = globals.stringLiteralRegex, currentLines = [];
                    if (typeof imports[filePath] === 'undefined') {
                        imports[filePath] = true;
                    }
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < lines.length)) return [3 /*break*/, 12];
                    line = lines[index].trim();
                    if (!(line.indexOf('@import ') === 0)) return [3 /*break*/, 10];
                    // We found an import statement
                    if (currentLines.length > 0) {
                        writers.push(new Writer(currentLines));
                        currentLines = [];
                    }
                    imported = line.replace(stringLiteralRegex, '$1');
                    if (!(lessRegex.test(imported) || cssRegex.test(imported))) {
                        // imported += '.less';
                    }
                    // If a path is relative to node_modules, reference the cwd's node_modules folder
                    if (imported.charAt(0) === '~') {
                        deTildedImport = imported.substr(1);
                        hashPath = path.resolve(process.cwd(), 'node_modules', deTildedImport);
                    }
                    else {
                        hashPath = path.resolve(filePath, '..', imported);
                    }
                    if (!(typeof imports[hashPath] === 'undefined')) return [3 /*break*/, 9];
                    imports[hashPath] = true;
                    if (!(!hashPath && imported.startsWith('http'))) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.get(imported)];
                case 3:
                    response = _a.sent();
                    file = response.data;
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 11];
                case 5: return [3 /*break*/, 7];
                case 6:
                    file = fs.readFileSync(hashPath, 'utf8');
                    _a.label = 7;
                case 7:
                    splitLines = file.split(/\r\n|\n/);
                    splitLines[0] = splitLines[0].trim();
                    return [4 /*yield*/, buildContents(splitLines, hashPath)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    currentLines.push(lines[index]);
                    _a.label = 11;
                case 11:
                    ++index;
                    return [3 /*break*/, 1];
                case 12:
                    // Push all remaining lines
                    writers.push(new Writer(currentLines));
                    return [2 /*return*/, index];
            }
        });
    });
}
module.exports = buildContents;
