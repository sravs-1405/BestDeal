import {useCallback,useEffect,useRef,useState} from 'react'
const API='/api', money=n=>n==null?'Not listed':new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n)
const translations={
 en:{home:'Home',wishlist:'Wishlist',compare:'Compare',search:'Search deals',all:'All categories',save:'Save',saved:'Saved',not:'Not listed',browse:'Browse by category',browseTitle:'What are you shopping for?',headline:'Find the right deal.',headline2:'Know what’s listed.',subhead:'Compare real listing details and choose what matters to you.',placeholder:'Search for any product...',filters:'Filters and budget',priority:'Priority',budget:'Budget up to ₹',minRating:'Minimum rating',free:'Free shipping',apply:'Apply filters',overall:'Best overall',live:'LIVE LISTINGS',cache:'CACHED LISTINGS',stale:'SAVED RESULTS',demo:'DEMO SAMPLE',updated:'Last updated',listings:'listings',sourceNote:'Showing offers returned by Google Shopping. Store coverage and details like delivery or COD vary, so missing details stay Not listed.',rating:'Rating',reviews:'reviews',shipping:'Shipping',delivery:'Delivery',dealScore:'Deal score',confidence:'listing data',why:'Why it ranked',history:'Price history',noHistory:'No history yet. Live searches record at most one snapshot per six hours.',account:'Keep your shopping shortlist',accountSub:'Sign in to save wishlist items and comparison snapshots.',signIn:'Sign in',create:'Create account',noResults:'No listings match these filters.',noSaved:'No saved listings yet',browseDeals:'Browse deals',changed:'Prices changed since this snapshot.',unchanged:'Prices have not changed since this snapshot.',surveyTitle:'Help improve BestDeal',surveyPrompt:'Which live listing would you buy? Your choice helps tune ranking weights.',buy:'I’d buy this',saveCompare:'Save comparison snapshot'},
 hi:{home:'होम',wishlist:'इच्छा सूची',compare:'तुलना',search:'डील खोजें',all:'सभी श्रेणियाँ',save:'सहेजें',saved:'सहेजा गया',not:'सूची में नहीं',browse:'श्रेणी के अनुसार देखें',browseTitle:'आप क्या खरीदना चाहते हैं?',headline:'सही डील खोजें।',headline2:'सूची की जानकारी जानें।',subhead:'असली लिस्टिंग की जानकारी की तुलना करें और अपनी पसंद चुनें।',placeholder:'फ़ोन, लैपटॉप, जूते खोजें…',filters:'फ़िल्टर और बजट',priority:'प्राथमिकता',budget:'बजट ₹ तक',minRating:'न्यूनतम रेटिंग',free:'मुफ़्त शिपिंग',apply:'फ़िल्टर लागू करें',overall:'सबसे अच्छा',live:'लाइव लिस्टिंग',cache:'कैश की गई लिस्टिंग',stale:'सहेजे गए नतीजे',demo:'डेमो नमूना',updated:'आख़िरी अपडेट',listings:'लिस्टिंग',sourceNote:'Google Shopping से मिली लिस्टिंग दिखाई गई हैं। स्टोर और डिलीवरी या COD जैसे विवरण अलग हो सकते हैं; न मिलने पर जानकारी सूची में नहीं दिखाई जाती।',rating:'रेटिंग',reviews:'समीक्षाएँ',shipping:'शिपिंग',delivery:'डिलीवरी',dealScore:'डील स्कोर',confidence:'लिस्टिंग डेटा',why:'रैंक होने का कारण',history:'कीमत का इतिहास',noHistory:'अभी इतिहास नहीं है। लाइव खोज पर हर छह घंटे में एक बार कीमत सहेजी जाती है।',account:'अपनी खरीदारी सूची सहेजें',accountSub:'इच्छा सूची और तुलना सहेजने के लिए साइन इन करें।',signIn:'साइन इन',create:'खाता बनाएँ',noResults:'इन फ़िल्टर से कोई लिस्टिंग नहीं मिली।',noSaved:'अभी कोई लिस्टिंग सहेजी नहीं',browseDeals:'डील देखें',changed:'इस स्नैपशॉट के बाद कीमतें बदली हैं।',unchanged:'इस स्नैपशॉट के बाद कीमतें नहीं बदली हैं।',surveyTitle:'BestDeal को बेहतर बनाने में मदद करें',surveyPrompt:'आप कौन सी लाइव लिस्टिंग खरीदेंगे? आपका चुनाव रैंकिंग को बेहतर करेगा।',buy:'मैं इसे खरीदूँगा',saveCompare:'तुलना सहेजें'},
 te:{home:'హోమ్',wishlist:'కోరికల జాబితా',compare:'పోల్చండి',search:'డీల్స్ వెతకండి',all:'అన్ని వర్గాలు',save:'సేవ్',saved:'సేవ్ అయింది',not:'జాబితాలో లేదు',browse:'వర్గాల వారీగా చూడండి',browseTitle:'మీరు ఏమి కొనాలనుకుంటున్నారు?',headline:'సరైన డీల్ కనుగొనండి.',headline2:'జాబితాలో ఉన్నది తెలుసుకోండి.',subhead:'నిజమైన లిస్టింగ్ వివరాలను పోల్చి మీకు నచ్చినదాన్ని ఎంచుకోండి.',placeholder:'ఫోన్లు, ల్యాప్‌టాప్‌లు, షూలు వెతకండి…',filters:'ఫిల్టర్లు మరియు బడ్జెట్',priority:'ప్రాధాన్యత',budget:'బడ్జెట్ ₹ వరకు',minRating:'కనీస రేటింగ్',free:'ఉచిత షిప్పింగ్',apply:'ఫిల్టర్లు వర్తింపజేయండి',overall:'ఉత్తమ ఎంపిక',live:'ప్రత్యక్ష లిస్టింగ్‌లు',cache:'క్యాష్ లిస్టింగ్‌లు',stale:'సేవ్ చేసిన ఫలితాలు',demo:'డెమో నమూనా',updated:'చివరిగా అప్‌డేట్',listings:'లిస్టింగ్‌లు',sourceNote:'Google Shopping అందించిన లిస్టింగ్‌లు మాత్రమే చూపబడతాయి. స్టోర్‌లు, డెలివరీ లేదా COD వివరాలు మారవచ్చు; లేని వివరాలు జాబితాలో లేవని చూపిస్తాం.',rating:'రేటింగ్',reviews:'సమీక్షలు',shipping:'షిప్పింగ్',delivery:'డెలివరీ',dealScore:'డీల్ స్కోర్',confidence:'లిస్టింగ్ డేటా',why:'ర్యాంక్ కారణం',history:'ధర చరిత్ర',noHistory:'ఇంకా చరిత్ర లేదు. ప్రత్యక్ష శోధనలో ఆరు గంటలకు ఒకసారి ధర నమోదు అవుతుంది.',account:'మీ షాపింగ్ జాబితాను సేవ్ చేయండి',accountSub:'కోరికల జాబితా, పోలికలను సేవ్ చేయడానికి సైన్ ఇన్ చేయండి.',signIn:'సైన్ ఇన్',create:'ఖాతా సృష్టించండి',noResults:'ఈ ఫిల్టర్లకు లిస్టింగ్‌లు లేవు.',noSaved:'ఇంకా లిస్టింగ్‌లు సేవ్ చేయలేదు',browseDeals:'డీల్స్ చూడండి',changed:'ఈ స్నాప్‌షాట్ తర్వాత ధరలు మారాయి.',unchanged:'ఈ స్నాప్‌షాట్ తర్వాత ధరలు మారలేదు.',surveyTitle:'BestDeal మెరుగుపరచడంలో సహాయం',surveyPrompt:'మీరు ఏ ప్రత్యక్ష లిస్టింగ్ కొనుగోలు చేస్తారు? మీ ఎంపిక ర్యాంకింగ్‌ను మెరుగుపరుస్తుంది.',buy:'ఇదే కొనుగోలు చేస్తాను',saveCompare:'పోలికను సేవ్ చేయండి'}
}
const why={low_price:'Lower priced in these results',high_rating:'Strong listed rating',many_reviews:'Many listed reviews',free_shipping:'Free shipping listed'}
const retailerSearchUrls={
 Amazon:q=>`https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
 Flipkart:q=>`https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
 Myntra:q=>`https://www.myntra.com/search?q=${encodeURIComponent(q)}`,
 Snapdeal:q=>`https://www.snapdeal.com/search?keyword=${encodeURIComponent(q)}`,
 Meesho:q=>`https://www.meesho.com/search?q=${encodeURIComponent(q)}`,
 Shopsy:q=>`https://www.shopsy.in/search?q=${encodeURIComponent(q)}`,
 Nykaa:q=>`https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}`,
 AJIO:q=>`https://www.ajio.com/search/?text=${encodeURIComponent(q)}`,
 JioMart:q=>`https://www.jiomart.com/search/${encodeURIComponent(q)}`,
 Croma:q=>`https://www.croma.com/searchB?q=${encodeURIComponent(q)}`,
 'Reliance Digital':q=>`https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}`,
 'Tata CLiQ':q=>`https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}`,
 'Vijay Sales':q=>`https://www.vijaysales.com/search?query=${encodeURIComponent(q)}`
}
function getProductDestination(product){
 const title=String(product?.title||'product'), source=String(product?.platform||'').trim()
 const makeSearch=retailerSearchUrls[source]||retailerSearchUrls[Object.keys(retailerSearchUrls).find(name=>name.toLowerCase()===source.toLowerCase())]
 const fallback=makeSearch?.(title)||`https://www.google.co.in/search?tbm=shop&q=${encodeURIComponent(title)}`
 const candidate=product?.originalUrl||product?.link||''
 try{
  const url=new URL(candidate)
  if(['http:','https:'].includes(url.protocol)&&!/(^|\.)google\./i.test(url.hostname)&&!/(^|\.)serpapi\.com$/i.test(url.hostname))return {url:url.href,isDirect:true}
 }catch{/* Malformed listing URLs use the retailer search fallback. */}
 return {url:fallback,isDirect:false}
}
function getProductStoreUrl(product){return getProductDestination(product).url}
function getProductActionLabel(product){
 const store=String(product?.platform||'Google Shopping')
 return getProductDestination(product).isDirect?`Open product listing at ${store}`:`Search for this product on ${store}`
}
function getShippingLabel(product){
 const rawCost=product?.shippingCost??product?.shipping_cost
 const cost=rawCost==null?'':Number(rawCost)
 if(product?.hasFreeShipping===true||product?.free_shipping===true||cost===0)return 'Free shipping'
 if(Number.isFinite(cost)&&cost>0)return `Shipping ${money(cost)}`
 if(product?.hasFreeShipping===false||product?.free_shipping===false)return 'Paid shipping · cost not listed'
 return 'Shipping not listed'
}

const reducedMotion=()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
function useCountUp(target,ms=900){
 const [v,setV]=useState(0)
 useEffect(()=>{
  const to=Number(target)||0
  if(reducedMotion()){setV(to);return}
  let raf,start
  const step=t=>{start??=t;const k=Math.min(1,(t-start)/ms);setV(Math.round(to*(1-Math.pow(1-k,3))));if(k<1)raf=requestAnimationFrame(step)}
  raf=requestAnimationFrame(step)
  return()=>cancelAnimationFrame(raf)
 },[target,ms])
 return v
}
function CountUp({value}){return useCountUp(value)}
const CONFETTI_COLORS=['#c0607a','#e8a0b4','#ffd166','#ff8fab','#8ecae6','#b5e48c','#fff']
function makeConfetti(n=46){
 return Array.from({length:n},(_,i)=>({id:i,x:Math.round(Math.random()*100),dx:Math.round(Math.random()*240-120),r:Math.round(Math.random()*720-360),d:(Math.random()*0.5).toFixed(2),t:(2.2+Math.random()*1.4).toFixed(2),c:CONFETTI_COLORS[i%CONFETTI_COLORS.length],w:6+Math.round(Math.random()*6)}))
}
export default function App(){
 const [lang,setLang]=useState(localStorage.getItem('bd-lang')||'en'), t=translations[lang];
 const [cats,setCats]=useState([]), [cat,setCat]=useState('all'), [sub,setSub]=useState(''), [q,setQ]=useState('');
 const [result,setResult]=useState(null), [busy,setBusy]=useState(false), [error,setError]=useState(''), [page,setPage]=useState('home');
 const [storeFilter,setStoreFilter]=useState('');
 const [categoryOpen,setCategoryOpen]=useState(false);
 const [priority,setPriority]=useState('balanced'), [minPrice,setMinPrice]=useState(''), [maxPrice,setMaxPrice]=useState(''), [minRating,setMin]=useState(''), [free,setFree]=useState(false), [filtersOpen,setFiltersOpen]=useState(false);
 const [detail,setDetail]=useState(null), [detailClosing,setDetailClosing]=useState(false), [history,setHistory]=useState(null), [days,setDays]=useState(30);
 const closeTimer=useRef(null), partyTimer=useRef(null), [party,setParty]=useState(null);
 const [compare,setCompare]=useState([]), [token,setToken]=useState(localStorage.getItem('bd-token')||''), [email,setEmail]=useState(''), [password,setPassword]=useState(''), [authError,setAuthError]=useState('');
 const [wishlist,setWishlist]=useState([]), [savedIds,setSavedIds]=useState([]), [savedComparisons,setSavedComparisons]=useState([]), [survey,setSurvey]=useState(null), [voted,setVoted]=useState(false);
 useEffect(()=>{fetch(API+'/categories').then(r=>r.json()).then(d=>setCats(d.categories||[])).catch(()=>setError('Categories are temporarily unavailable.'))},[]);
 const closeDetail=useCallback(()=>{
  if(detailClosing)return;
  setDetailClosing(true);
  closeTimer.current=window.setTimeout(()=>{setDetail(null);setDetailClosing(false);closeTimer.current=null},220);
 },[detailClosing]);
 useEffect(()=>()=>window.clearTimeout(closeTimer.current),[]);
 useEffect(()=>{
  if(!detail)return;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previousOverflow};
 },[detail]);
 useEffect(()=>{
  if(!detail)return;
  const closeOnEscape=e=>{if(e.key==='Escape')closeDetail()};
  window.addEventListener('keydown',closeOnEscape);
  return()=>window.removeEventListener('keydown',closeOnEscape);
 },[detail,closeDetail]);
 useEffect(()=>localStorage.setItem('bd-lang',lang),[lang]);
 useEffect(()=>{
  const onDown=e=>{
   if(reducedMotion())return
   const b=e.target.closest?.('.actions button,.s-btn,.q-chip,.retailer-chip,.soft-button,.nav-link,.filters>button')
   if(!b)return
   const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,dot=document.createElement('span')
   dot.className='ripple';dot.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`
   b.appendChild(dot);setTimeout(()=>dot.remove(),650)
  }
  document.addEventListener('pointerdown',onDown)
  return()=>{document.removeEventListener('pointerdown',onDown);window.clearTimeout(partyTimer.current)}
 },[]);
 function celebrate(d){
  const best=d?.picks?.bestOverall||(d?.ranked||d?.products||[])[0]
  if(!best||reducedMotion())return
  window.clearTimeout(partyTimer.current)
  setParty({key:Date.now(),name:best.title,price:best.price,pieces:makeConfetti()})
  partyTimer.current=window.setTimeout(()=>setParty(null),4200)
 }
 const allProducts=result?.ranked||result?.products||[], availableStores=[...new Set(allProducts.map(p=>p.platform).filter(Boolean))].sort((a,b)=>a.localeCompare(b)), products=storeFilter?allProducts.filter(p=>p.platform===storeFilter):allProducts, active=cats.find(x=>x.id===cat), headers={'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})};
 const bestProduct=products.find(p=>p.id===result?.picks?.bestOverall?.id)||products[0];
 const platforms=new Set(products.map(p=>p.platform).filter(Boolean)).size;
 const averageScore=products.length?Math.round(products.reduce((sum,p)=>sum+Number(p.dealScore??p.deal_score??0),0)/products.length):0;
 const lowestPrice=products.reduce((min,p)=>p.price!=null?Math.min(min,Number(p.price)):min,Infinity);
 const highestRated=[...products].filter(p=>p.rating!=null).sort((a,b)=>Number(b.rating)-Number(a.rating))[0];
 async function search(e,term=q){e?.preventDefault();setFiltersOpen(false);setCategoryOpen(false);const query=String(term||'').trim();if(!query)return;setBusy(true);setError('');setPage('home');setResult(null);try{const p=new URLSearchParams({q:query,category:cat,priority,lang});if(sub)p.set('subcategory',sub);if(minPrice)p.set('minPrice',minPrice);if(maxPrice)p.set('maxPrice',maxPrice);if(minRating)p.set('minRating',minRating);if(free)p.set('freeShipping','true');const r=await fetch(`${API}/search?${p}`),d=await r.json();if(!r.ok)throw Error(d.error||'Search failed.');setResult(d);celebrate(d)}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function loadHistory(p,n){try{const r=await fetch(`${API}/history?productId=${encodeURIComponent(p.id)}&days=${n}`);setHistory(r.ok?await r.json():null)}catch{setHistory(null)}}
 async function open(p){window.clearTimeout(closeTimer.current);closeTimer.current=null;setDetailClosing(false);setDetail(p);setHistory(null);loadHistory(p,days)}
 useEffect(()=>{if(!token){setSavedIds([]);return}let cancelled=false;fetch(API+'/wishlist',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.ok?r.json():{items:[]}).then(d=>{if(!cancelled)setSavedIds((d.items||[]).map(x=>x.id))}).catch(()=>{});return()=>{cancelled=true}},[token]);
 async function loadWishlist(){if(!token){setPage('account');return}const r=await fetch(API+'/wishlist',{headers:headers}),d=await r.json();setWishlist(d.items||[]);setSavedIds((d.items||[]).map(x=>x.id));setPage('wishlist')}
 async function save(p){if(!token){setPage('account');return}if(savedIds.includes(p.id))return;const r=await fetch(API+'/wishlist',{method:'POST',headers:headers,body:JSON.stringify({productId:p.id})});if(r.ok||r.status===409){setSavedIds(a=>a.includes(p.id)?a:[...a,p.id]);if(r.ok&&page==='wishlist')loadWishlist()}else setError((await r.json()).error||'Could not save this listing.')}
 function toggleCompare(p){setCompare(a=>a.includes(p.id)?a.filter(x=>x!==p.id):a.length<3?[...a,p.id]:a)}
 async function auth(e,mode){e.preventDefault();setAuthError('');try{const r=await fetch(`${API}/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}),d=await r.json();if(!r.ok)throw Error(d.error||'Account request failed.');setToken(d.token);localStorage.setItem('bd-token',d.token);setPage('home')}catch(e){setAuthError(e.message)}}
 async function startSurvey(){setError('');setPage('survey');setVoted(false);try{const r=await fetch(API+'/survey/pair'),d=await r.json();setSurvey(r.ok?d:null);if(!r.ok)setError(d.error||'Two live listings are needed before a choice is available.')}catch{setSurvey(null)}}
 async function vote(choice){const r=await fetch(API+'/survey/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pairId:survey.pairId,choice})});if(r.ok)setVoted(true);else setError((await r.json()).error||'Could not save your vote.')}
 const compareProducts=products.filter(p=>compare.includes(p.id));
 async function loadComparisons(){if(!token)return;try{const r=await fetch(API+'/comparisons',{headers:headers}),d=await r.json();setSavedComparisons(d.items||[])}catch{setSavedComparisons([])}}
 useEffect(()=>{if(page!=='compare'||!token)return;let cancelled=false;fetch(API+'/comparisons',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>{if(!cancelled)setSavedComparisons(d.items||[])}).catch(()=>{if(!cancelled)setSavedComparisons([])});return()=>{cancelled=true}},[page,token]);
 async function saveComparison(){if(!token){setPage('account');return}const r=await fetch(API+'/comparisons',{method:'POST',headers:headers,body:JSON.stringify({productIds:compare})});if(r.ok){setError('Comparison snapshot saved.');loadComparisons()}else setError((await r.json()).error||'Could not save comparison.')}
 const quickSearches=['wireless headphones','laptop','running shoes','smartphone','smartwatch','earbuds'];
 const sourceLabel=result?.source==='demo'?t.demo:result?.source==='cache'?t.cache:result?.source==='stale'?t.stale:t.live;
 return <div className="app">
  <div className="page-bg" aria-hidden="true"/>
  {party&&<><div className="confetti" key={`c${party.key}`} aria-hidden="true">{party.pieces.map(c=><i key={c.id} style={{'--x':`${c.x}vw`,'--dx':`${c.dx}px`,'--r':`${c.r}deg`,'--d':`${c.d}s`,'--t':`${c.t}s`,'--c':c.c,'--w':`${c.w}px`}}/>)}</div><div className="deal-toast" key={`t${party.key}`} role="status"><span className="deal-toast-icon" aria-hidden="true">🎉</span><span>Best deal found: <b>{String(party.name||'Top pick').slice(0,48)}</b>{party.price!=null&&<> · {money(party.price)}</>}</span></div></>}
  <div className="app-root">
   <header className="header">
    <button className="logo-lockup logo-button" onClick={()=>{setPage('home');setResult(null)}} aria-label="BestDeal home"><span className="logo-mark"><b>BD</b></span><span className="logo-name">Best<span>Deal</span></span></button>
    <div className="tagline">YOUR SMART SHOPPING COMPANION · CRAFTED WITH CARE 🛍️</div>
    <div className="platform-row">{['Amazon','Flipkart','Myntra','Snapdeal','Meesho','Shopsy','Nykaa','+ More'].map(x=><span className="p-pill" key={x}>{x}</span>)}</div>
    <button className="header-signin" onClick={()=>setPage('account')} aria-label={token?'Open your profile':'Sign in to BestDeal'}>{token?'Profile':'Sign in'} <span aria-hidden="true">↗</span></button>
   </header>
   <nav className="main-nav" aria-label="Main navigation">
    <button className={`nav-link${page==='home'?' current':''}`} onClick={()=>setPage('home')}><span aria-hidden="true">⌂</span> Home</button>
    <button className={`nav-link${page==='wishlist'?' current':''}`} onClick={loadWishlist}><span aria-hidden="true">♡</span> Wishlist</button>
    <button className={`nav-link${page==='compare'?' current':''}`} onClick={()=>setPage('compare')}><span aria-hidden="true">⇄</span> Compare{compare.length>0&&<b className="nav-count">{compare.length}</b>}</button>
    <button className={`nav-link${page==='survey'?' current':''}`} onClick={startSurvey}><span aria-hidden="true">♡</span> Feedback</button>
    <label className="nav-language">Language<select aria-label="Language" value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="hi">हिन्दी</option><option value="te">తెలుగు</option></select></label>
    {token&&<button className="nav-link nav-signout" onClick={()=>{localStorage.removeItem('bd-token');setToken('')}}>Sign out</button>}
   </nav>
   <main>
    {page==='home'&&<>
     <div className="search-card">
      <form className="s-row" onSubmit={search}>
       <div className="s-group"><span className="s-icon">🔍</span><input className="s-input" value={q} onChange={e=>setQ(e.target.value)} placeholder={t.placeholder||'Search for any product...'} aria-label="Search for any product"/></div>
       <button className="s-btn" disabled={busy||!q.trim()}>{busy?<><span className="dots">Searching</span></>:"Search deals"}</button>
      </form>
      <button type="button" className="filter-trigger" onClick={()=>setFiltersOpen(true)}>↓ {t.filters}</button>{filtersOpen&&<button className="filter-dimmer" aria-label="Close filters" onClick={()=>setFiltersOpen(false)}/>}
      <div className={`filters ${filtersOpen?'open':''}`}><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)}><option value="balanced">Balanced</option><option value="cheapest">Cheapest</option><option value="fastest">Fastest</option><option value="reliable">Most reliable</option></select></label><label>Budget from<input type="number" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="Any"/></label><label>Budget up to<input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Any"/></label><label>Minimum rating<select value={minRating} onChange={e=>setMin(e.target.value)}><option value="">Any</option><option value="3">3+</option><option value="4">4+</option><option value="4.5">4.5+</option></select></label><label className="check"><input type="checkbox" checked={free} onChange={e=>setFree(e.target.checked)}/>Free shipping</label><button onClick={search}>Apply filters</button></div>
      <div className="quick-row"><span className="q-label">Try:</span>{quickSearches.map(term=><button className="q-chip" key={term} onClick={()=>{setQ(term);search(null,term)}}>{term}</button>)}<button className="q-chip utility-chip" onClick={()=>setCategoryOpen(v=>!v)}>{categoryOpen?'Close categories':'Browse categories'}</button></div>
      {categoryOpen&&<div className="category-picker"><p className="q-label">Choose a category</p><div className="category-options"><button className={cat==='all'?'active':''} onClick={()=>{setCat('all');setSub('')}}>All categories</button>{cats.map(c=><button className={cat===c.id?'active':''} key={c.id} onClick={()=>{setCat(c.id);setSub('')}}><span>{c.icon}</span> {c.label}</button>)}</div>{active&&<div className="category-subchips">{active.subcategories.map(s=><button className={`q-chip ${sub===s.id?'active':''}`} key={s.id} onClick={()=>{setSub(sub===s.id?'':s.id);if(!q)setQ(s.queries?.[0]||s.label)}}>{s.label}</button>)}</div>}</div>}
     </div>
     {busy&&<div className="product-grid loading-grid">{[1,2,3].map(i=><div className="skeleton" key={i}/>)}</div>}
     {error&&<><div className="err-box">⚠️ {error}</div><RetailerSearchLinks query={q} open/></>}
     {result&&!busy&&<section className="results">
      <div className="resulthead"><div><small className="eyebrow">{sourceLabel}</small><h2>Deals for “{result.query}”</h2><p>{products.length} {t.listings} · {t.updated} {result.fetchedAt?new Date(result.fetchedAt).toLocaleString():''}</p></div><span className="badge">{result.model?.status==='learned'?'Learned ranking':'Default ranking'}</span></div>
      {result.source==='demo'&&<div className="notice demo">Sample listings for rehearsal. These are not live offers.</div>}
      {result.model?.status==='unranked'&&<div className="notice">{result.model.message}</div>}<p className="hint source-note">{t.sourceNote}</p>
       {result.hidden?.length>0&&<details className="hidden-list"><summary>{result.hidden.length} listings hidden from picks</summary>{result.hidden.map((p,i)=><p key={`${p.id||p.title}-${i}`}><b>{p.title}</b> · {String(p.hiddenReason||'excluded').replaceAll('_',' ')}</p>)}</details>}
       {availableStores.length>0&&<div className="retailer-filter" aria-label="Filter products by shopping website"><span className="retailer-filter-label">Shop at</span><button className={`retailer-chip${storeFilter===''?' active':''}`} aria-pressed={storeFilter===''} onClick={()=>setStoreFilter('')}>All stores</button>{availableStores.map(store=><button key={store} className={`retailer-chip${storeFilter===store?' active':''}`} aria-pressed={storeFilter===store} onClick={()=>setStoreFilter(store)}>{store}</button>)}</div>}
      {!!products.length&&<>
       <div className="stats-bar"><div className="stat-chip chip-score"><span className="stat-icon">🎯</span><div><div className="stat-val"><CountUp value={averageScore}/></div><div className="stat-lbl">Avg Deal Score</div></div></div><div className="stat-chip chip-platforms"><span className="stat-icon">🏪</span><div><div className="stat-val">{platforms}</div><div className="stat-lbl">Platforms</div></div></div><div className="stat-chip chip-price"><span className="stat-icon">💰</span><div><div className="stat-val">{Number.isFinite(lowestPrice)?money(lowestPrice):'—'}</div><div className="stat-lbl">Lowest Price</div></div></div><div className="stat-chip max-rating"><span className="stat-icon">⭐</span><div><div className="stat-val">{highestRated?.rating!=null?`${Number(highestRated.rating).toFixed(1)} ★`:'—'}</div><div className="stat-lbl">Highest Rated{highestRated?.platform?` · ${highestRated.platform}`:''}</div></div></div></div>
       <div className="res-header"><div><div className="res-title">Best Products Found for “{result.query}”</div><div className="res-sub">Ranked by the selected priorities · best value shown first</div></div><div className="ml-badge"><span className="ml-dot"/><span>{result.model?.status==='learned'?'Learned weights':result.model?.status==='unranked'?'Ranking unavailable':'Default weights'}</span></div></div>
       {bestProduct&&<article className="best-deal-hero clickable-card" role="group" tabIndex={0} aria-label={`${bestProduct.title}. Press Enter to ${getProductActionLabel(bestProduct).toLowerCase()}.`} onClick={e=>{if(!e.target.closest('a,button'))window.open(getProductStoreUrl(bestProduct),'_blank','noopener,noreferrer')}} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();window.open(getProductStoreUrl(bestProduct),'_blank','noopener,noreferrer')}}}><div className="bdh-top-bar"/><div className="bdh-crown-row"><span className="bdh-crown">👑<i className="sparkle sp1" aria-hidden="true">✦</i><i className="sparkle sp2" aria-hidden="true">✦</i><i className="sparkle sp3" aria-hidden="true">✦</i></span><span className="bdh-hero-label">Best Deal Found</span>{bestProduct.discount_percentage>0&&<span className="bdh-disc-pill">-{bestProduct.discount_percentage}% OFF</span>}</div><div className="bdh-body"><div className="bdh-img-box"><ProductImage product={bestProduct} fallback={active?.icon||'🛍️'} large/></div><div className="bdh-info"><div className="bdh-platform">{bestProduct.platform||'Store'}</div><div className="bdh-title">{bestProduct.title}</div><div className="bdh-price-row"><span className="bdh-price">{money(bestProduct.price)}</span>{bestProduct.free_shipping&&<span className="bdh-chip bdh-chip-green">✓ Free Shipping</span>}</div><div className="bdh-sentiment-row"><span className="bdh-sent-emoji">{bestProduct.rating>=4.5?'😍':'😊'}</span><span className="bdh-sent-text">{bestProduct.rating==null?'Rating not listed':`${Number(bestProduct.rating).toFixed(1)} / 5`}</span>{bestProduct.reviews!=null&&<span className="bdh-rating-txt">· {Number(bestProduct.reviews).toLocaleString('en-IN')} reviews</span>}</div></div><div className="bdh-score-col"><div className="bdh-ring-wrap"><svg viewBox="0 0 90 90" className="bdh-ring-svg"><circle cx="45" cy="45" r="34" className="bdh-ring-track"/><circle cx="45" cy="45" r="34" className="bdh-ring-fill" style={{'--ring-end':213.6-(213.6*Number(bestProduct.dealScore??bestProduct.deal_score??0)/100)}}/></svg><div className="bdh-ring-inner"><div className="bdh-ring-num"><CountUp value={Math.round(bestProduct.dealScore??bestProduct.deal_score??0)}/></div><div className="bdh-ring-lbl">Score</div></div></div></div></div><div className="bdh-features"><span className="bdh-feat">📦 Shipping: {getShippingLabel(bestProduct)}</span><span className="bdh-feat">💳 COD: {bestProduct.cod_available==null?'Not listed':bestProduct.cod_available?'Available':'No'}</span><span className="bdh-feat">🚚 Delivery: {bestProduct.delivery_days==null?'Not listed':`${bestProduct.delivery_days} days`}</span><span className="bdh-feat">💬 Reviews: {bestProduct.reviews==null?'Not listed':Number(bestProduct.reviews).toLocaleString('en-IN')}</span></div><div className="bdh-cta"><button onClick={()=>open(bestProduct)}>View listing details</button><a href={getProductStoreUrl(bestProduct)} target="_blank" rel="noopener noreferrer">{getProductDestination(bestProduct).isDirect?`Open ${bestProduct.platform||'seller'} product ↗`:`Search ${bestProduct.platform||'seller'} ↗`}</a></div></article>}
      </>}
       {!products.length?<><div className="empty"><h3>{storeFilter?'No matching listings from this store.':t.noResults}</h3><p>{storeFilter?'Choose another store or show all stores.':'Try another search or adjust the filters.'}</p>{storeFilter&&<button className="soft-button" onClick={()=>setStoreFilter('')}>Show all stores</button>}</div>{!storeFilter&&<RetailerSearchLinks query={result.query} open/>}</>:<><div className="product-grid">{products.map((p,i)=><ProductCard key={p.id||i} product={p} index={i} best={i===0} compareSelected={compare.includes(p.id)} fallback={active?.icon||'🛍️'} onOpen={()=>open(p)} saved={savedIds.includes(p.id)} saveLabel={t.saved||'Saved'} onSave={()=>save(p)} onCompare={()=>toggleCompare(p)}/>)}</div><RetailerSearchLinks query={result.query}/></>}
      <p className="hint">Missing values stay unknown and score neutrally. “Not listed” means the source did not provide the fact.</p>
     </section>}
    </>}
    {page==='wishlist'&&<section className="feature-page"><small className="eyebrow">YOUR SAVED PRODUCTS</small><h1>{t.wishlist}</h1>{wishlist.length?<div className="product-grid">{wishlist.map(p=><article className="pcard saved-product" key={p.wishlistId}><ProductImage product={p} fallback="🛍️"/><div className="card-body"><h3>{p.title}</h3><p>Saved {money(p.price)} · Current {money(p.currentPrice)}</p>{p.priceChange!=null&&<p>Price change: {p.priceChange>0?'+':''}{money(p.priceChange)}</p>}<button className="soft-button" onClick={()=>fetch(`${API}/wishlist/${p.wishlistId}`,{method:'DELETE',headers:headers}).then(loadWishlist)}>Remove</button></div></article>)}</div>:<div className="empty"><h3>No saved listings yet</h3><p>Save a product from your search results.</p><button className="soft-button" onClick={()=>setPage('home')}>Browse deals</button></div>}</section>}
    {page==='compare'&&<section className="feature-page"><small className="eyebrow">SIDE-BY-SIDE</small><h1>{t.compare}</h1>{compareProducts.length<2?<div className="empty"><h3>Choose two or three products</h3><p>Use Compare on product cards.</p><button className="soft-button" onClick={()=>setPage('home')}>Find products</button></div>:<><div className="tablewrap"><table><thead><tr><th>Fact</th>{compareProducts.map(p=><th key={p.id}>{p.image&&<img className="compare-image" src={p.image} alt=""/>}{p.title}</th>)}</tr></thead><tbody>{[['Price',p=>money(p.price)],['Rating',p=>p.rating==null?t.not:`${p.rating} ★`],['Reviews',p=>p.reviews==null?t.not:Number(p.reviews).toLocaleString('en-IN')],['Shipping',p=>p.free_shipping===true?'Free':p.free_shipping===false&&p.shippingCost==null?'Paid, cost not listed':p.shippingCost==null?t.not:p.shippingCost===0?'Free':money(p.shippingCost)],['Delivery',p=>p.delivery_days==null?t.not:`${p.delivery_days} days`],['Seller',p=>p.platform||t.not],['Deal score',p=>p.dealScore??p.deal_score??'Unranked']].map(([name,fn])=>{const val=p=>name==='Price'?p.price:name==='Rating'?p.rating:name==='Reviews'?p.reviews:name==='Shipping'?p.shippingCost:name==='Delivery'?p.delivery_days:name==='Deal score'?(p.dealScore??p.deal_score):null;const known=compareProducts.filter(p=>val(p)!=null);const best=name==='Seller'||!known.length?null:known.reduce((a,b)=>((name==='Price'||name==='Delivery'||name==='Shipping')?val(a)<=val(b):val(a)>=val(b))?a:b).id;return <tr key={name}><th>{name}</th>{compareProducts.map(p=><td className={best===p.id?'best-cell':''} key={p.id}>{fn(p)}</td>)}</tr>})}</tbody></table></div><p className="notice">Rule-based verdict: the lowest listed price is cheapest. Missing facts are not assumed.</p><button className="soft-button" onClick={saveComparison}>Save comparison snapshot</button></>}{savedComparisons.length>0&&<><h2>Saved comparisons</h2>{savedComparisons.map(c=><div className="notice" key={c.id}>{c.products.map(p=>p.title).join(' · ')}<br/>{c.pricesChanged?'Prices changed since this snapshot.':'Prices have not changed since this snapshot.'}</div>)}</>}</section>}
    {page==='account'&&<section className="account feature-page"><small className="eyebrow">BESTDEAL ACCOUNT</small><h1>{t.account}</h1><p>{t.accountSub}</p><form onSubmit={e=>auth(e,'login')}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" minLength="8" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{authError&&<div className="notice error">{authError}</div>}<button className="s-btn">{t.signIn}</button><button type="button" className="soft-button" onClick={e=>auth(e,'register')}>{t.create}</button></form></section>}
    {page==='survey'&&<section className="feature-page"><small className="eyebrow">COMMUNITY FEEDBACK</small><h1>{t.surveyTitle}</h1><p>{t.surveyPrompt}</p>{voted?<div className="notice">Thanks, your vote was saved.</div>:survey?<div className="product-grid survey">{survey.products.map((p,i)=><article className="pcard survey-card" key={p.id}><ProductImage product={p} fallback="🛍️"/><div className="card-body"><small>{p.platform}</small><h3>{p.title}</h3><b className="card-price">{money(p.price)}</b><p>{t.rating}: {p.rating??t.not} · {t.reviews}: {p.reviews??t.not}</p><button className="s-btn" onClick={()=>vote(i)}>{t.buy}</button></div></article>)}</div>:<div className="empty"><p>{error||'Two live listings are needed before a choice is available.'}</p><button className="soft-button" onClick={startSurvey}>Try again</button></div>}</section>}
   </main>
   {compare.length>0&&page==='home'&&<div className="sticky">{compare.length} selected<button onClick={()=>setPage('compare')}>Compare now →</button><button onClick={()=>setCompare([])}>×</button></div>}
   {detail&&<div className={`focus-backdrop${detailClosing?' closing':''}`} role="presentation" onMouseDown={e=>e.target===e.currentTarget&&closeDetail()}><div className="focus-emojis" aria-hidden="true"><i style={{'--l':'4%','--dl':'0.0s','--du':'6.0s','--sz':'1.3rem'}}>🛍️</i><i style={{'--l':'12%','--dl':'0.5s','--du':'7.2s','--sz':'1.8rem'}}>💖</i><i style={{'--l':'20%','--dl':'0.9s','--du':'8.4s','--sz':'2.3rem'}}>✨</i><i style={{'--l':'28%','--dl':'1.4s','--du':'9.6s','--sz':'1.3rem'}}>🏷️</i><i style={{'--l':'36%','--dl':'1.8s','--du':'6.0s','--sz':'1.8rem'}}>🎁</i><i style={{'--l':'44%','--dl':'2.2s','--du':'7.2s','--sz':'2.3rem'}}>⭐</i><i style={{'--l':'52%','--dl':'2.7s','--du':'8.4s','--sz':'1.3rem'}}>💸</i><i style={{'--l':'60%','--dl':'0.1s','--du':'9.6s','--sz':'1.8rem'}}>🎉</i><i style={{'--l':'68%','--dl':'0.6s','--du':'6.0s','--sz':'2.3rem'}}>💝</i><i style={{'--l':'76%','--dl':'1.0s','--du':'7.2s','--sz':'1.3rem'}}>🔥</i><i style={{'--l':'84%','--dl':'1.5s','--du':'8.4s','--sz':'1.8rem'}}>🛒</i><i style={{'--l':'92%','--dl':'2.0s','--du':'9.6s','--sz':'2.3rem'}}>💫</i></div><div className={`focus-card-wrap${detailClosing?' closing':''}`}><section className="pcard sheet" role="dialog" aria-modal="true" aria-label="Product listing details"><button className="close" onClick={closeDetail}>×</button><ProductImage product={detail} fallback="🛍️" large/><small>{detail.platform} · {detail.dataConfidence||'listing data'} · {getProductDestination(detail).isDirect?'Direct product page':'Retailer search'}</small><h2>{detail.title}</h2><b className="price">{money(detail.price)}</b><div className="detailfacts">{[['Rating',detail.rating==null?t.not:`${detail.rating}/5`],['Reviews',detail.reviews==null?t.not:Number(detail.reviews).toLocaleString('en-IN')],['Shipping',detail.free_shipping===true?'Free':detail.free_shipping===false&&detail.shippingCost==null?'Paid, cost not listed':detail.shippingCost==null?t.not:detail.shippingCost===0?'Free':money(detail.shippingCost)],['COD',detail.cod_available==null?t.not:detail.cod_available?'Available':'No'],['Delivery',detail.delivery_days==null?t.not:`${detail.delivery_days} days`],['Discount',detail.discount_percentage==null?t.not:`${detail.discount_percentage}%`]].map(([a,b])=><div key={a}><small>{a}</small><b>{b}</b></div>)}</div><h3>Why it ranked</h3><div className="reasons">{(detail.reasons||[]).map(x=><span key={x}>✓ {why[x]||x.replaceAll('_',' ')}</span>)}{(detail.warnings||[]).map(x=><span className="warn" key={x}>ⓘ {x.replaceAll('_',' ')}</span>)}</div>{detail.alternatives&&(detail.alternatives.cheaper||detail.alternatives.better)&&<><h3>Similar alternatives</h3>{detail.alternatives.cheaper&&<p>Similar but cheaper: {detail.alternatives.cheaper.title} · {money(detail.alternatives.cheaper.price)}</p>}{detail.alternatives.better&&<p>Similar but better: {detail.alternatives.better.title} · {money(detail.alternatives.better.price)}</p>}</>}<div className="historyhead"><h3>Price history</h3>{[7,30,90].map(n=><button className={days===n?'selected':''} key={n} onClick={()=>{setDays(n);loadHistory(detail,n)}}>{n}d</button>)}</div>{history?.points?.length?<><svg className="chart" viewBox="0 0 600 140"><polyline points={history.points.map((x,i)=>`${20+i*560/Math.max(1,history.points.length-1)},${125-(x.price-history.min)/(history.max-history.min||1)*105}`).join(' ')} fill="none" stroke="#c0607a" strokeWidth="4"/></svg><p>Min {money(history.min)} · Avg {money(history.average)} · Max {money(history.max)}</p>{detail.price!=null&&history.average!=null&&detail.price<history.average&&<p>{Math.round((history.average-detail.price)/history.average*100)}% below this period’s average</p>}<small>Tracking since {new Date(history.trackingSince).toLocaleDateString()}</small></>:<p className="muted">{t.noHistory}</p>}<div className="sheetactions"><button className="soft-button" onClick={()=>save(detail)}>{savedIds.includes(detail.id)?`♥ ${t.saved||'Saved'}`:`♡ ${t.save}`}</button><a className="s-btn" href={getProductStoreUrl(detail)} target="_blank" rel="noopener noreferrer">{getProductActionLabel(detail)} ↗</a></div></section></div></div>}
  </div>
 </div>
}

function ProductImage({product,fallback='🛍️',large=false}){
 const imageCandidates=[product?.image,product?.thumbnail,product?.thumbnail_url,product?.imageUrl,product?.image_url,...(Array.isArray(product?.thumbnails)?product.thumbnails:[]),product?.serpapi_thumbnail,...(Array.isArray(product?.serpapi_thumbnails)?product.serpapi_thumbnails:[])].filter((value,index,list)=>typeof value==='string'&&/^https?:\/\//i.test(value)&&list.indexOf(value)===index);
 const imageKey=`${product?.id||product?.title||'product'}|${imageCandidates.join('|')}`;
 return <ProductImageFallback key={imageKey||'no-image'} imageCandidates={imageCandidates} product={product} fallback={fallback} large={large}/>;
}

function ProductImageFallback({imageCandidates,product,fallback,large}){
 const [imageIndex,setImageIndex]=useState(0);
 const image=imageCandidates[imageIndex]||'';
 return <div className={`product-image${large?' product-image-large':''}`}>{image?<img src={image} alt={product?.title||'Product'} loading="lazy" decoding="async" onError={()=>setImageIndex(index=>index+1)}/>:<span className="no-img">{fallback}</span>}</div>
}

function ProductCard({product,index,best,compareSelected,saved,saveLabel,fallback,onOpen,onSave,onCompare}){
 const cardRef=useRef(null), [burst,setBurst]=useState(0);
 const score=Math.round(Number(product.dealScore??product.deal_score??0)), shownScore=useCountUp(score,800), destination=getProductDestination(product), shopUrl=destination.url, shopAction=getProductActionLabel(product), shippingLabel=getShippingLabel(product);
 const tilt=e=>{const el=cardRef.current;if(!el||e.pointerType==='touch'||reducedMotion())return;const b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;el.style.setProperty('--ry',`${(x*10).toFixed(2)}deg`);el.style.setProperty('--rx',`${(-y*10).toFixed(2)}deg`);el.style.setProperty('--gx',`${((x+.5)*100).toFixed(0)}%`);el.style.setProperty('--gy',`${((y+.5)*100).toFixed(0)}%`)};
 const untilt=()=>{const el=cardRef.current;if(!el)return;el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg')};
 const cardNavigation=e=>{if(e.target.closest('a,button'))return;if(shopUrl)window.open(shopUrl,'_blank','noopener,noreferrer')};
 const cardKeyDown=e=>{if(e.target!==e.currentTarget)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();if(shopUrl)window.open(shopUrl,'_blank','noopener,noreferrer')}};
 return <article ref={cardRef} onPointerMove={tilt} onPointerLeave={untilt} className={`pcard clickable-card${best?' is-best':''}${compareSelected?' is-compared':''}${saved?' is-saved-card':''}`} style={{'--ca':'192,96,122',animationDelay:`${index*0.04}s`}} role="group" tabIndex={0} aria-label={`${product.title||'Product'}. Press Enter to ${shopAction.toLowerCase()}.`} onClick={cardNavigation} onKeyDown={cardKeyDown}>
  <div className="mood-banner mood-love"><span className="mood-emoji-sm">{product.rating>=4.5?'😍':'💗'}</span><span>{product.dataConfidence==='sample'?'Demo sample':product.rating==null?'Listing details shown as provided':product.rating>=4?'Highly rated by buyers':'Compare listed details'}</span></div>
  <span className="card-glare" aria-hidden="true"/>
  {best&&<div className="best-ribbon">🏆 Best Deal</div>}
  <a className="score-badge-wrap product-open" href={shopUrl} target="_blank" rel="noopener noreferrer" aria-label={shopAction}><span className="score-badge-num">{shownScore}</span><span className="score-badge-label">{score>=75?'Great Deal':score>=50?'Good Deal':'Fair Deal'}</span><span className="score-badge-bar"><span className="score-badge-fill" style={{width:`${score}%`}}/></span></a>
  <a className="product-open image-open" href={shopUrl} target="_blank" rel="noopener noreferrer" aria-label={shopAction}><ProductImage product={product} fallback={fallback}/></a>
  <div className="card-body"><div className="card-src">{product.platform||'Store'} · {product.dataConfidence||'listing data'}<span className={`destination-tag ${destination.isDirect?'direct':'search'}`}>{destination.isDirect?'Product page':'Seller search'}</span></div><a className="card-title product-open" href={shopUrl} target="_blank" rel="noopener noreferrer" title={product.title||'Product'}>{product.title||'Product'}</a><div className="price-row"><span className="card-price">{money(product.price)}</span><span className={`ship-chip ${shippingLabel==='Free shipping'?'ship-free':'ship-paid'}`}>{shippingLabel}</span></div><div className="rating-row"><span className="rating-emoji">{product.rating==null?'☆':'⭐'}</span><span className="rating-details"><b className="rating-val">{product.rating==null?'Rating not listed':`${Number(product.rating).toFixed(1)} / 5`}</b><small>{product.reviews==null?'Reviews not listed':`${Number(product.reviews).toLocaleString('en-IN')} reviews`}</small></span></div><div className="features-section"><div className="features-title">Listing details</div><div className="features-grid"><span className="feature-item">🚚 {product.delivery_days==null?'Delivery not listed':`${product.delivery_days} days`}</span><span className="feature-item">💳 COD {product.cod_available==null?'not listed':product.cod_available?'available':'unavailable'}</span></div></div><div className="card-divider"/><div className="actions"><button className={saved?'is-saved':''} aria-pressed={!!saved} onClick={e=>{e.stopPropagation();if(!saved)setBurst(n=>n+1);onSave()}}>{saved?`♥ ${saveLabel}`:'♡ Save'}</button><button onClick={e=>{e.stopPropagation();onCompare()}}>{compareSelected?'✓ Added':'＋ Compare'}</button><button onClick={e=>{e.stopPropagation();onOpen()}}>View details</button></div></div>
 {burst>0&&<span className="heart-burst" key={burst} aria-hidden="true">{['💗','💖','💕','❤️','💘','💗'].map((h,i)=><i key={i} style={{'--a':`${i*44-110}deg`,'--dl':`${i*0.04}s`}}>{h}</i>)}</span>}
 </article>
}

function RetailerSearchLinks({query,open=false}){
 const term=String(query||'').trim();
 if(!term)return null;
 const stores=[...Object.entries(retailerSearchUrls).map(([name,searchUrl])=>[name,searchUrl(term)]),['Google Shopping',`https://www.google.co.in/search?tbm=shop&q=${encodeURIComponent(term)}`]];
 return <details className="retailer-fallback" open={open}>
  <summary>Search “{term}” directly on shopping sites</summary>
  <p>These links search each site directly. The retailer shows its own listings, prices, and availability, which may differ from BestDeal’s results.</p>
  <div className="retailer-fallback-links">{stores.map(([name,url])=><a key={name} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</div>
 </details>;
}