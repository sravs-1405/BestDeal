const { spawn } = require('child_process');
const path = require('path');

class MLService {
  constructor() {
    this.pythonCommand = process.platform === 'win32'
      ? path.join(__dirname, '..', '..', 'python_ml', 'venv', 'Scripts', 'python.exe')
      : path.join(__dirname, '..', '..', 'python_ml', 'venv', 'bin', 'python3');
    
    this.scriptsPath = path.join(__dirname, '..', '..', 'python_ml');
  }

  async callPythonScript(scriptName, products) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptsPath, scriptName);
      
      console.log(`🐍 Calling Python: ${scriptName}`);
      
      const pythonProcess = spawn(this.pythonCommand, [scriptPath]);
      
      let outputData = '';
      let errorData = '';

      pythonProcess.stdin.write(JSON.stringify(products));
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.log(data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`❌ Python Error:`, errorData);
          reject(new Error(`Python script failed: ${errorData}`));
          return;
        }

        try {
          const result = JSON.parse(outputData);
          console.log(`✅ Python completed successfully`);
          resolve(result);
        } catch (error) {
          console.error(`❌ Failed to parse Python output`);
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error(`❌ Failed to start Python:`, error);
        reject(new Error(`Failed to start Python: ${error.message}`));
      });
    });
  }

  async scoreDeal(products) {
    try {
      return await this.callPythonScript('deal_scorer.py', products);
    } catch (error) {
      console.error('Deal scoring failed:', error.message);
      return products;
    }
  }
}

module.exports = MLService;