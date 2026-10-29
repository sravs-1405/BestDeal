const fs = require('fs');
const path = require('path');
const dir = __dirname;
module.exports = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
