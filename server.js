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


const propertiesFile = 'ping_french_translations.properties';
const charactersToBeReplaced = ['Â', 'â', 'À', 'à', 'Æ', 'æ', 'Ç', 'ç', 'É', 'é', 'Ê', 'ê', 'È', 'è', 'Ë', 'ë', 'Î', 'î', 'Ï', 'ï', 'Ñ', 'ñ', 'Ô', 'ô', 'OE', 'oe', 'Û', 'û', 'Ù', 'ù', 'Ÿ', 'ÿ'];

const Crlf = require('crlf');
const Fs = require('fs');
const Path = require('path');
const filePath = Path.join(__dirname, propertiesFile);
const unicodefilePath = Path.join(__dirname, `${propertiesFile}.unicode`);

let file = Fs.readFileSync(filePath, { encoding: 'utf8' }, (error, data) => {
    if (!error) {
        return data;
    } else { 
        console.log(error);
    }
});

const toUnicode = function(theString) {
    let prefix = '\\u';
    let unicodeString = '';
    for (let i=0; i < theString.length; i++) {
        if (charactersToBeReplaced.includes(theString[i])) {
            let theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
            while (theUnicode.length < 4) {
                theUnicode = '0' + theUnicode;
            }
            theUnicode = prefix + theUnicode;
            unicodeString += theUnicode;
        } else {
            unicodeString += theString[i];
        }
    }
    return unicodeString;
};

Crlf.get(filePath, null, (error, endingType) => {
    if (!error) {
        let lineEnding = '\n';
        if (endingType === 'CRLF') {
            lineEnding = '\r\n';
        }

        let arrayOfLines = file.split(lineEnding);
        arrayOfLines.forEach(function(row, index, arr) {
            if (row.search('=') != -1) {
                let rowParts = row.split('=');
                arr[index] = rowParts[0] + '=' + toUnicode(rowParts[1]);
            }
        });
        
        const data = arrayOfLines.map(function(v){ 
            return v + '\n';
        });
        
        const newFile = Fs.createWriteStream(unicodefilePath);
        newFile.on('error', function(err) { console.log(err); });
        data.forEach(function(v) { newFile.write(v); });
        newFile.end();
    }
});

process.on('unhandledRejection', (err) => {
    console.log(err);
} );