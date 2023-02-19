const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your password: ', (password) => {
  let password_encrypt = bcrypt.hashSync(password, 10);
  console.log(password_encrypt);
  rl.close();
});