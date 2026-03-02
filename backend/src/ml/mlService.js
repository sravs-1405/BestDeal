const { spawn } = require('child_process');
const path = require('path');

class MLService {
  constructor() {
    // ✅ On Render (Linux): use system python3
    // ✅ On Windows (local): use venv python
    if (process.platform === 'win32') {
      this.pythonCommand = path.join(__dirname, '..', '..', 'python_ml', 'venv', 'Scripts', 'python.exe');
    } else {
      this.pythonCommand = 'python3';
    }

    // ✅ __dirname = backend/src/ml → go up 2 levels to reach backend/python_ml
    this.scriptsPath = path.join(__dirname, '..', '..', 'python_ml');

    console.log(`🐍 Python command: ${this.pythonCommand}`);
    console.log(`📁 Scripts path: ${this.scriptsPath}`);
  }

  async callPythonScript(scriptName, products) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptsPath, scriptName);
      console.log(`🐍 Calling Python script: ${scriptPath}`);

      const pythonProcess = spawn(this.pythonCommand, [scriptPath]);

      let outputData = '';
      let errorData = '';

      pythonProcess.stdin.write(JSON.stringify(products));
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => { outputData += data.toString(); });
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.log('🐍 Python log:', data.toString());
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
          console.error(`❌ Failed to parse Python output:`, outputData);
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
      // ✅ Capital S in deal_Scorer.py
      return await this.callPythonScript('deal_Scorer.py', products);
    } catch (error) {
      console.error('⚠️ Python ML failed, using JS fallback scorer:', error.message);
      return products.map(p => ({
        ...p,
        dealScore: this.basicDealScore(p),
        deal_score: this.basicDealScore(p),
      }));
    }
  }

  // ✅ Fallback JS deal scorer if Python fails on Render
  basicDealScore(product) {
    let score = 50;

    const rating = parseFloat(product.rating) || 0;
    if (rating >= 4.5) score += 20;
    else if (rating >= 4.0) score += 15;
    else if (rating >= 3.5) score += 8;
    else if (rating < 3.0 && rating > 0) score -= 10;

    const discount = parseFloat(product.discount) || 0;
    if (discount >= 40) score += 15;
    else if (discount >= 20) score += 10;
    else if (discount >= 10) score += 5;

    if (product.shippingCost === 0 || product.hasFreeShipping) score += 8;
    if (product.hasCOD) score += 5;

    const reviews = parseInt(product.reviews) || 0;
    if (reviews > 1000) score += 7;
    else if (reviews > 100) score += 4;

    const days = product.deliveryDays;
    if (days === 0) score += 8;
    else if (days === 1) score += 6;
    else if (days <= 3) score += 3;

    return Math.min(100, Math.max(0, Math.round(score)));
  }
}

module.exports = MLService;