import fs = require('fs');
import path = require('path');
import globals = require('./globals');
import buildContents = require('./buildcontents');
import generateOutput = require('./generateoutput');

function writeToFile(path: string, data: Array<string>) {
    try {
        var fd = fs.openSync(path, 'w'),
            buffer = new Buffer(data.join('\n'), 'utf8');

        fs.writeSync(fd, buffer, 0, buffer.length, 0);
        fs.closeSync(fd);
    } catch (err) {
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
async function compress(config: globals.IConfig, callback?: (err: Error) => void) {
    globals.initialize(config);

    var data = config.fileContent,
        filename = config.filename,
        writers = globals.writers,
        output = globals.output,
        version = globals.config.version,
        license = globals.config.license;

    // Reads the src file, builds the contents for each 
    // file in the proper order, and generates the output file.
    try {
        var splitLines = data.split(/\r\n|\n/);
        splitLines[0] = splitLines[0].trim();
        buildContents(splitLines, filename);

        // generate the output
        generateOutput();

        // If a license file is specified, we want to prepend it to the output.
        if (!!license) {
            var licenseFile = path.resolve(license),
                licenseData = fs.readFileSync(licenseFile, 'utf8'),
                lines = licenseData.split(/\r\n|\n/),
                regex = /(.*)v\d+\.\d+\.\d+(.*)/;

            // If a version is specified, we want to go through and find where 
            // the version is specified in the license, then replace it with the 
            // passed-in version.
            if (!!version) {
                lines.some((line, index) => {
                    if (regex.test(line)) {
                        lines[index] = line.replace(regex, '$1v' + version + '$2');
                        return true;
                    }
                    return false;
                });
            }

            // Add the lines as a comment block
            lines.forEach((line, index) => {
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
        return output;
    } catch (e) {
        if (callback) {
            callback(e);
        }
    }
}

export = compress;
