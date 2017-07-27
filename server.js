/*eslint no-console: ["error", { allow: ["log", warn", "error"] }] */
'use strict';

/*
  This script will substitute unicode hex in for foreign characters.

  Tested with node v6 and coded in Visual Studio Code.

  To run:
    Install node v6 or higher
    clone source (Which is basically a copy of server.js and package.json)
    npm install
    
    Update const propertiesFile and charactersToBeReplaced below if needed.
    save server.js file you just updated
    node server.js
    
    Now go find the new file that the script created. It ends with .unicode.
*/

//File name to be processed.  Assumed to be in the same directory with the script.js file.
const propertiesFile = 'ping_french_translations.properties';
//Foreign characters we're looking to replace.
const charactersToBeReplaced = ['Â', 'â', 'À', 'à', 'Æ', 'æ', 'Ç', 'ç', 'É', 'é', 'Ê', 'ê', 'È', 'è', 'Ë', 'ë', 'Î', 'î', 'Ï', 'ï', 'Ñ', 'ñ', 'Ô', 'ô', 'OE', 'oe', 'Û', 'û', 'Ù', 'ù', 'Ÿ', 'ÿ', '’'];

const Crlf = require('crlf'); //To deal with Window's files

const Fs = require('fs');
const Path = require('path');

//Path of file being read in
const filePath = Path.join(__dirname, propertiesFile);
//Path of file we'll be writing out
const unicodefilePath = Path.join(__dirname, `${propertiesFile}.unicode`);

//Check the version of node that is being used to run this script.
if (process.versions.node.split('.')[0] < 6) { console.error('Node.js version 6.x.x or greater is required to run this script.  The current version you have installed is: ' + process.versions.node); process.exit(1); }

//Reading the whole file into memory
let file = Fs.readFileSync(filePath, { encoding: 'utf8' }, (error, data) => {
    if (!error) {
        return data;
    } else { 
        throw error;
    }
});

//process string by unicode foreign characters
const toUnicode = function(theString) {
    let prefix = '\\u';
    let unicodeString = '';
    for (let i=0; i < theString.length; i++) {
        if (charactersToBeReplaced.includes(theString[i])) {
            let theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();  //charCodeAt returns UTF-16 decimal code, toString(16) (converts decimal number to a base above 10) returns UTF-8 HEX.
            while (theUnicode.length < 4) {
                theUnicode = '0' + theUnicode;
            }
            theUnicode = prefix + theUnicode; //Prefix the UTF-8 HEX
            unicodeString += theUnicode;
        } else {
            unicodeString += theString[i];
        }
    }
    return unicodeString;
};

//Handle lineEnding - Windows is CRLF while *nix's are LF.  Callback does the rest of the work for this script.
Crlf.get(filePath, null, (error, endingType) => {
    if (!error) {
        let lineEnding = '\n';
        if (endingType === 'CRLF') {
            lineEnding = '\r\n';
        }

        //Process each row
        let arrayOfLines = file.split(lineEnding);
        arrayOfLines.forEach(function(row, index, arr) {
            if (row.search('=') != -1) { //Process a row only if it includes a '='
                let rowParts = row.split('=');
                arr[index] = rowParts[0] + '=' + toUnicode(rowParts[1]);
            }
        });
        
        //For adding back in a line ending for processed rows.
        const data = arrayOfLines.map(function(v){ 
            return v + '\n';
        });
        
        //Write process file / data to the file system.  Using a stream.
        const newFile = Fs.createWriteStream(unicodefilePath);
        newFile.on('error', function(err) { console.log(err); });
        data.forEach(function(v) { newFile.write(v); });
        newFile.end();
    }
});

process.on('unhandledRejection', (err) => {
    console.log(err);
} );