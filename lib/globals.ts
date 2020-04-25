import Writer = require('./writer');

export interface IConfig {
    /**
     * The path to a LESS file that imports all the desired files 
     * in the order you wish them to be bundled in.
     */
    filename: string;

    /**
     * The content of the input file as a string
     */
    fileContent: string;
    /**
     * The version number used in conjunction with the license.
     */
    version?: string;

    /**
     * The path to the license file to be added to the build as a
     * comment. If a version is specified, the v.0.0.0 in the 
     * license will be replaced with the version.
     */
    license?: string;
}

export interface IObject<T> {
    [x: string]: T;
}

function isString(obj: any): boolean {
    return typeof obj === 'string';
}

function validate(config: IConfig): Array<string> {
    var errors: Array<string> = [];

    if (!isString(config.input)) {
        errors.push('Error: input config property must be a string');
    }

    return errors;
}

/**
 * Creates the config.
 * 
 * @param cfg The root config.
 */
export function initialize(cfg?: IConfig) {
    if (!cfg) {
        throw new Error('No config specified');
    }
    config = cfg;

    var errors = validate(config);

    if (errors.length > 0) {
        errors.forEach((error) => { console.log(error); });
        throw new Error('Invalid config');
    }

    return config;
}

export var config: IConfig,
    writers: Array<Writer> = [],
    output: Array<string> = [],

    // hashes the import statements
    imports: IObject<boolean> = {},

    // Finds all the <script src="" /> tags
    hrefRegex = /href=("[^"]*)/,

    // Finds the start comment Node
    // startRegex = /<!--\s*less-bundle-start/,

    // Finds the end comment Node
    // endRegex = /<!--\s*less-bundle-end/,

    // Finds the string literal in a string
    stringLiteralRegex = /.*(?:'|")(.*)(?:'|").*/,

    // Tests for less file
    lessFileRegex = /.less$/,

    // Tests for css file
    cssFileRegex = /.css$/;
