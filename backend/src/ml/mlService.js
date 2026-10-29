const { spawn } = require('child_process');
const path = require('path');
class MLService {
  constructor() {
    this.pythonCommand = process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');
    this.scriptPath = path.join(__dirname, '..', '..', 'python_ml', 'deal_Scorer.py');
  }
  rankProducts(payload) {
    return new Promise((resolve, reject) => {
      const child = spawn(this.pythonCommand, [this.scriptPath], { windowsHide:true });
      let stdout = ''; let stderr = '';
      child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
      child.stdout.on('data', chunk => stdout += chunk);
      child.stderr.on('data', chunk => stderr += chunk);
      child.on('error', reject);
      child.on('close', code => {
        if (code !== 0) return reject(new Error(stderr.trim() || `Python exited with code ${code}`));
        try { resolve(JSON.parse(stdout)); } catch (error) { reject(new Error(`Invalid Python response: ${error.message}`)); }
      });
      child.stdin.end(JSON.stringify(payload));
    });
  }
}
module.exports = MLService;
