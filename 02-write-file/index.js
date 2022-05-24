const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;

const exitNode = () => {
  stdout.write('Goodbye!');
  process.exit();
};

fs.writeFile(
  path.join(__dirname, 'output.txt'),
  '',
  (err) => {
    if (err) throw err;
  }
);

stdout.write('Hello!\n');
stdout.write('Enter any text:\n');

stdin.on('data', data => {
  const exit = data.toString().trimEnd() === 'exit';
  if (exit) exitNode();
  fs.appendFile(
    path.join(__dirname, 'output.txt'),
    data.toString(),
    err => {
      if (err) throw err;
    }
  );
});

process.on('SIGINT', () => exitNode());