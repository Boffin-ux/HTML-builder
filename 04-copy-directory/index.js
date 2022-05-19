const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;
const inputFolder = path.join(__dirname, 'files');
const outputFolder = path.join(__dirname, 'files-copy');

const copyDir = () => {
  const createDir = async (folder) => {
    try {
      await fsPromises.mkdir(folder, { recursive: true });
    } catch (err) {
      console.log(err);
    }
  };
  const copyFiles = async (inputFile, outputFile) => {
    try {
      await fsPromises.copyFile(inputFile, outputFile);
    } catch (err) {
      console.error(err);
    }
  };
  const readDir = (input = inputFolder, output = outputFolder) => {
    fs.readdir(input, { withFileTypes: true }, (err, files) => {
      if (err) throw new Error(err);
      files.forEach(file => {
        const inputLocation = path.join(input, file.name);
        const outputLocation = path.join(output, file.name);
        if (file.isFile()) {
          copyFiles(inputLocation, outputLocation);
        } else if (file.isDirectory()) {
          createDir(outputLocation)
          readDir(inputLocation, outputLocation);
        }
      });
    });
  };
  const init = async () => {
    try {
      await fsPromises.access(outputFolder, fs.constants.F_OK);
      await fsPromises.rm(outputFolder, { recursive: true, force: true });
      await createDir(outputFolder);
      readDir();
    } catch {
      await createDir(outputFolder);
      readDir();
    }

  };
  init();
};

copyDir();
