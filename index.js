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
define("lib/writer", ["require", "exports"], function (require, exports) {
    "use strict";
    var Writer = /** @class */ (function () {
        /**
         * Creates a new Writer.
         *
         * @param operator The array of lines to associate with this writer.
         */
        function Writer(operator) {
            this.__lines = [];
            if (Array.isArray(operator)) {
                this.__lines = operator;
                return;
            }
        }
        /**
         * Writes the lines for this writer into the output array.
         *
         * @param output The output lines to which the Writer's lines should be appended.
         * @param previousLine The previous line that was added to output.
         */
        Writer.prototype.write = function (output, previousLine) {
            // If this writer has a module associated with it, we want to first add the 
            // lines for the module before adding the lines for this writer.
            var trim;
            // Add every line to the output.
            this.__lines.forEach(function (line) {
                trim = line.trim();
                if (!previousLine && !trim) {
                    return;
                }
                output.push(line);
                previousLine = trim;
            });
            return previousLine;
        };
        return Writer;
    }());
    return Writer;
});
define("lib/globals", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isString(obj) {
        return typeof obj === 'string';
    }
    function validate(config) {
        var errors = [];
        if (!(isString(config.src) && exports.lessFileRegex.test(config.src))) {
            errors.push('Error: src config property must be a string path locating the LESS file for the bundle');
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
});
define("lib/buildcontents", ["require", "exports", "fs", "path", "lib/writer", "lib/globals"], function (require, exports, fs, path, Writer, globals) {
    "use strict";
    function buildContents(lines, filePath) {
        var writers = globals.writers, imports = globals.imports, lessRegex = globals.lessFileRegex, cssRegex = globals.cssFileRegex, stringLiteralRegex = globals.stringLiteralRegex, currentLines = [], line, hashPath, imported, file, splitLines;
        if (typeof imports[filePath] === 'undefined') {
            imports[filePath] = true;
        }
        for (var index = 0; index < lines.length; ++index) {
            line = lines[index].trim();
            if (line.indexOf('@import ') === 0) {
                // We found an import statement
                if (currentLines.length > 0) {
                    writers.push(new Writer(currentLines));
                    currentLines = [];
                }
                imported = line.replace(stringLiteralRegex, '$1');
                if (!(lessRegex.test(imported) || cssRegex.test(imported))) {
                    imported += '.less';
                }
                // If a path is relative to node_modules, reference the cwd's node_modules folder
                if (imported.charAt(0) === '~') {
                    var deTildedImport = imported.substr(1);
                    hashPath = path.resolve(process.cwd(), 'node_modules', deTildedImport);
                }
                else {
                    hashPath = path.resolve(filePath, '..', imported);
                }
                if (typeof imports[hashPath] === 'undefined') {
                    imports[hashPath] = true;
                    file = fs.readFileSync(hashPath, 'utf8');
                    splitLines = file.split(/\r\n|\n/);
                    splitLines[0] = splitLines[0].trim();
                    buildContents(splitLines, hashPath);
                }
                continue;
            }
            currentLines.push(lines[index]);
        }
        // Push all remaining lines
        writers.push(new Writer(currentLines));
        return index;
    }
    return buildContents;
});
define("lib/generateoutput", ["require", "exports", "lib/globals"], function (require, exports, globals) {
    "use strict";
    var output = globals.output;
    function removeEmptyStringsFromEnd(output) {
        while (!output[output.length - 1]) {
            output.pop();
        }
    }
    /**
     * Iterates through writers and invokes their write
     * function, building the output array.
     */
    function generateOutput() {
        var writers = globals.writers, previousLine = '';
        writers.forEach(function (writer) {
            previousLine = writer.write(output, previousLine);
        });
        removeEmptyStringsFromEnd(output);
    }
    return generateOutput;
});
define("lib/compressor", ["require", "exports", "fs", "path", "lib/globals", "lib/buildcontents", "lib/generateoutput"], function (require, exports, fs, path, globals, buildContents, generateOutput) {
    "use strict";
    function writeToFile(path, data) {
        try {
            var fd = fs.openSync(path, 'w'), buffer = new Buffer(data.join('\n'), 'utf8');
            fs.writeSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);
        }
        catch (err) {
            console.log('Could not write to file: ' + JSON.stringify(err, null, 4));
        }
    }
    /**
     * Uses the config to go through all of the framework *.less files in the
     * proper order and compresses them into a single file for packaging.
     *
     * @param config The configuration for compressing the files.
     * @param callback Since this is asynchronous, we need a callback to know
     * when the task is complete.
     */
    function compress(config, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var src, writers, output, version, license, data, splitLines, licenseFile, licenseData, lines, regex;
            return __generator(this, function (_a) {
                globals.initialize(config);
                src = path.resolve(globals.config.src), writers = globals.writers, output = globals.output, version = globals.config.version, license = globals.config.license;
                // Reads the src file, builds the contents for each 
                // file in the proper order, and generates the output file.
                try {
                    data = fs.readFileSync(src, 'utf8');
                    splitLines = data.split(/\r\n|\n/);
                    splitLines[0] = splitLines[0].trim();
                    buildContents(splitLines, src);
                    // generate the output
                    generateOutput();
                    // If a license file is specified, we want to prepend it to the output.
                    if (!!license) {
                        licenseFile = path.resolve(license), licenseData = fs.readFileSync(licenseFile, 'utf8'), lines = licenseData.split(/\r\n|\n/), regex = /(.*)v\d+\.\d+\.\d+(.*)/;
                        // If a version is specified, we want to go through and find where 
                        // the version is specified in the license, then replace it with the 
                        // passed-in version.
                        if (!!version) {
                            lines.some(function (line, index) {
                                if (regex.test(line)) {
                                    lines[index] = line.replace(regex, '$1v' + version + '$2');
                                    return true;
                                }
                                return false;
                            });
                        }
                        // Add the lines as a comment block
                        lines.forEach(function (line, index) {
                            lines[index] = ' * ' + line;
                        });
                        lines.unshift('/**');
                        lines.push(' */');
                        output.unshift(lines.join('\n'));
                    }
                    // Make sure the file ends in a new line.
                    if (!!output[output.length - 1].trim()) {
                        output.push('');
                    }
                    return [2 /*return*/, output];
                }
                catch (e) {
                    if (callback) {
                        callback(e);
                    }
                }
                return [2 /*return*/];
            });
        });
    }
    return compress;
});
define("index", ["require", "exports", "lib/compressor"], function (require, exports, compress) {
    "use strict";
    return compress;
});
