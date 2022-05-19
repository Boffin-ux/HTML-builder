const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;
const outputFolder = path.join(__dirname, 'project-dist');
const cssInputFolder = path.join(__dirname, 'styles');
const htmlInputFolder = path.join(__dirname, 'components');
const copyInputFolder = path.join(__dirname, 'assets');
const createOutputFolder = path.join(outputFolder, 'assets');

const createDir = async (folder) => {
  try {
    await fsPromises.mkdir(folder, { recursive: true });
  } catch (err) {
    console.log(err);
  }
};

const bundleCss = async () => {
  const getFiles = await fsPromises.readdir(cssInputFolder, { withFileTypes: true });
  const filterFiles = getFiles.filter(file => !file.isDirectory() && file.isFile() && path.extname(file.name).trim() === '.css');
  let result = '';

  filterFiles.forEach(file => {
    const rs = fs.createReadStream(path.join(cssInputFolder, file.name), 'utf-8');
    const ws = fs.createWriteStream(path.join(outputFolder, 'style.css'));

    rs.on('data', chunk => result += chunk);
    rs.on('end', () => ws.write(result));
    rs.on('error', error => console.log('Error', error.message));
  });
};

const copyDir = async () => {
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
  const readDir = (input = copyInputFolder, output = createOutputFolder) => {
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
      await fsPromises.access(createOutputFolder, fs.constants.F_OK);
      await fsPromises.rm(createOutputFolder, { recursive: true, force: true });
      await createDir(createOutputFolder);
      readDir();
    } catch {
      await createDir(createOutputFolder);
      readDir();
    }

  };
  init();
};

const bundleHtml = async () => {
  const getContent = async (name) => {
    try {
      const getFiles = await fsPromises.readdir(htmlInputFolder, { withFileTypes: true });
      const filterFiles = getFiles.filter(file => !file.isDirectory() && file.isFile() && path.extname(file.name).trim() === '.html');

      for await (const file of filterFiles) {
        const fileLocation = path.join(htmlInputFolder, file.name);
        const baseName = path.parse(fileLocation).name;
        if (baseName === name) {
          let data = await fsPromises.readFile(fileLocation, 'utf8');
          return data;
        }
      }
    } catch (err) {
      console.error(err);
    }

  };

  const writeContent = async () => {
    try {
      let data = await fsPromises.readFile(path.join(__dirname, 'template.html'), 'utf8');
      let result = '';
      const arrTags = data.match(/\{\{\w+\}\}/g);

      for await (const item of arrTags) {
        if (data.includes(item)) {
          const getName = item.match(/\w+/g).join('');
          result = data.replace(new RegExp(item, 'g'), await getContent(getName));
          data = result;
        }
      }

      await fsPromises.writeFile(path.join(outputFolder, 'index.html'), result, 'utf8');
    } catch (err) {
      console.error(err);
    }

  };
  writeContent();
};

const runBuild = async () => {
  await createDir(outputFolder);
  await bundleCss();
  await copyDir();
  await bundleHtml();
};

runBuild();