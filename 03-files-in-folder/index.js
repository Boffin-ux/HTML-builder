const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'secret-folder');

fs.readdir(folder, { withFileTypes: true }, (err, files) => {
  if (err) throw new Error(err);
  const getFiles = files.filter(file => !file.isDirectory() && file.isFile());

  getFiles.forEach(file => {
    const fileLocation = path.join(folder, file.name);
    const baseName = path.parse(fileLocation).name;
    const extName = path.extname(file.name).slice(1);

    fs.stat(fileLocation, (err, stats) => {
      if (err) throw new Error(err);
      const getSize = `${stats['size'] / 1024}kb`;
      console.log(`${baseName} - ${extName} - ${getSize}`);
    });
  });
});