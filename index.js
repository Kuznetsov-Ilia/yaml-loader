var yaml = require('js-yaml');
var path = require('path');
var fs = require('graceful-fs');
var os = require('os');
var JsonToTS = require('json-to-ts');

//import {parseQuery} from 'loader-utils';

module.exports = function (source) {
  this.cacheable && this.cacheable();
  const callback = this.async();
  try {
    const res = yaml.safeLoad(source);
    var yamlDefenitions = JsonToTS(res)
      .concat(['export default _'])
      .join('\n')
      .replace('interface RootObject', 'declare const _:');
    const filename = this.resourcePath;
    const yamlInterfaceFilename = filenameToTypingsFilename(filename);
    
    writeToFileIfChanged(yamlInterfaceFilename, yamlDefenitions);
    
    callback(null, JSON.stringify(res, undefined, '\t'));
  }
  catch (err) {
    this.emitError(err);
    return null;
  }
};


function filenameToTypingsFilename (filename) {
  const dirName = path.dirname(filename);
  const baseName = path.basename(filename);
  return path.join(dirName, `${baseName}.d.ts`);
}

function writeToFileIfChanged (filename, content) {
  if (fs.existsSync(filename)) {
    const currentInput = fs.readFileSync(filename, 'utf-8');

    if (currentInput !== content) {
      writeFile(filename, content);
    }
  } else {
    writeFile(filename, content);
  }
}

function writeFile (filename, content) {
  //Replace new lines with OS-specific new lines
  content = content.replace(/\n/g, os.EOL);

  fs.writeFileSync(filename, content, 'utf8');
};
