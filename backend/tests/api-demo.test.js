const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

async function freePort() {
  const server=net.createServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const port=server.address().port;
  await new Promise(resolve=>server.close(resolve));
  return port;
}
async function request(base,route,options={}) {
  const response=await fetch(base+route,options);
  const data=await response.json();
  return {status:response.status,data};
}
async function main() {
  const port=await freePort();
  const dataDir=path.join(__dirname,`.tmp-api-demo-${process.pid}`);
  const env={...process.env,PORT:String(port),DATA_DIR:dataDir,DEMO_MODE:'true',JWT_SECRET:'local-test-secret-change-this',};
  const server=spawn(process.execPath,['backend/src/server.js'],{cwd:path.resolve(__dirname,'..','..'),env,stdio:'ignore',windowsHide:true});
  const base=`http://127.0.0.1:${port}/api`;
  try {
    let ready=false,lastError=null;
    for(let i=0;i<50;i++) { try { if((await fetch(base+'/health')).ok){ready=true;break} } catch(error) { lastError=error; } await new Promise(r=>setTimeout(r,200)); }
    if(!ready) throw Error(`Backend health check failed${lastError?.cause?.code?`: ${lastError.cause.code}`:''}`);
    const health=await request(base,'/health'); if(health.data.status!=='healthy')throw Error('health failed');
    const categories=await request(base,'/categories'); if(categories.data.categories.length!==5)throw Error('categories failed');
    const first=await request(base,'/search?q=Samsung&category=mobiles');
    if(first.status!==200||first.data.source!=='demo'||!first.data.products.length)throw Error('demo search failed'); if(!['default','learned'].includes(first.data.model?.status))throw Error('Python ML ranking did not run'); if(first.data.products.some(p=>typeof p.dealScore!=='number'||!p.features))throw Error('ML scores or features are missing');
    for(const [query,category] of [['laptop','laptops'],['running shoes','footwear'],['earbuds','audio'],['smartwatch','all'],['smart TV','tvs'],['Bluetooth speaker','audio']]) {
      const response=await request(base,`/search?q=${encodeURIComponent(query)}&category=${category}`);
      if(response.status!==200||!response.data.products.length)throw Error(`demo category search failed: ${query}`);
      if(response.data.products.some(p=>!p.image||!/^https:\/\//i.test(p.image)||!p.originalUrl))throw Error(`demo image or retailer link missing: ${query}`);
    }
    const repeat=await request(base,'/search?q=Samsung&category=mobiles');if(repeat.data.source!=='cache')throw Error('search cache failed');
    const product=first.data.products[0];
    if(product.cod_available!==null||product.delivery_days!==null)throw Error('demo unknown data must stay null');
    const history=await request(base,`/history?productId=${encodeURIComponent(product.id)}&days=30`);if(history.status!==200)throw Error('history failed');
    const registered=await request(base,'/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'demo@example.test',password:'Test-password-928'})});if(registered.status!==201)throw Error('register failed');
    const loggedIn=await request(base,'/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'demo@example.test',password:'Test-password-928'})});if(loggedIn.status!==200)throw Error('login failed');
    const token=loggedIn.data.token,auth={Authorization:`Bearer ${token}`,'content-type':'application/json'};
    if((await request(base,'/auth/me',{headers:auth})).status!==200)throw Error('auth me failed');
    const saved=await request(base,'/wishlist',{method:'POST',headers:auth,body:JSON.stringify({productId:product.id})});if(saved.status!==201)throw Error('wishlist create failed');
    if((await request(base,'/wishlist',{headers:auth})).data.items.length!==1)throw Error('wishlist list failed');
    if((await request(base,`/wishlist/${saved.data.id}`,{method:'DELETE',headers:auth})).status!==200)throw Error('wishlist delete failed');
    const second=first.data.products[1]||first.data.products[0];
    const comparison=await request(base,'/comparisons',{method:'POST',headers:auth,body:JSON.stringify({productIds:[product.id,second.id]})});
    if(comparison.status!==201)throw Error('comparison create failed');
    if((await request(base,'/comparisons',{headers:auth})).data.items.length!==1)throw Error('comparison list failed');
    if((await request(base,`/comparisons/${comparison.data.id}`,{method:'DELETE',headers:auth})).status!==200)throw Error('comparison delete failed');
    if((await request(base,'/survey/pair')).status!==404)throw Error('survey empty state failed');
    if((await request(base,'/survey/vote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pairId:999999,choice:0})})).status!==404)throw Error('survey vote validation failed');
    if((await request(base,'/missing')).status!==404)throw Error('API 404 failed');
    console.log('DEMO API checks passed: health, categories, demo/cache search, history, register/login/me, wishlist CRUD, comparison CRUD, survey states and 404.');
  } finally {
    if(server.exitCode===null) {
      server.kill();
      await new Promise(resolve=>server.once('exit',resolve));
    }
    const resolved=path.resolve(dataDir);
    if(resolved.startsWith(path.resolve(__dirname)+path.sep))fs.rmSync(resolved,{recursive:true,force:true});
  }
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
