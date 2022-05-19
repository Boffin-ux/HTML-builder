const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;
const inputFolder = path.join(__dirname, 'styles');
const outputFolder = path.join(__dirname, 'project-dist');

const joinCss = async () => {
  const getFiles = await fsPromises.readdir(inputFolder, { withFileTypes: true });
  const filterFiles = getFiles.filter(file => !file.isDirectory() && file.isFile() && path.extname(file.name).trim() === '.css');
  let result = '';

  filterFiles.forEach(file => {
    const rs = fs.createReadStream(path.join(inputFolder, file.name), 'utf-8');
    const ws = fs.createWriteStream(path.join(outputFolder, 'bundle.css'));

    rs.on('data', chunk => result += chunk);
    rs.on('end', () => ws.write(result));
    rs.on('error', error => console.log('Error', error.message));
  });
};
joinCss();