import json, math, re, sys, statistics
from collections import Counter

FEATURES = ('price','rating','reviews','seller_trust','delivery','shipping','discount','cod')
PRESETS = {
 'balanced': {'price':.22,'rating':.19,'reviews':.12,'seller_trust':.12,'delivery':.10,'shipping':.08,'discount':.09,'cod':.08},
 'cheapest': {'price':.55,'rating':.10,'reviews':.06,'seller_trust':.07,'delivery':.06,'shipping':.06,'discount':.06,'cod':.04},
 'fastest': {'price':.12,'rating':.12,'reviews':.08,'seller_trust':.10,'delivery':.38,'shipping':.07,'discount':.06,'cod':.07},
 'reliable': {'price':.12,'rating':.27,'reviews':.18,'seller_trust':.22,'delivery':.08,'shipping':.05,'discount':.04,'cod':.04}}
TRUST = {'amazon':.95,'flipkart':.95,'croma':.9,'reliance':.85,'jiomart':.8,'tata cliq':.85,'myntra':.85,'ajio':.82}
ACCESSORIES = {'case','cover','charger','cable','screen protector','tempered glass','holder','skin','back cover','adapter','earbuds','stand','bag','sleeve','remote','laces','insoles','socks','polish','mount'}
ACCESSORY_BRANDS = {'supcase','spigen','ringke','otterbox','caseology','gadgetshieldz','decalz','vaku','burga'}
NON_PRODUCT_OFFERS = ('sell old','sell your','buyback','buy back','trade in','trade-in','exchange your','exchange offer','repair service','screen replacement','replacement display','spare parts','service center','specifications','price comparison','price from')
STOP = {'the','a','an','for','with','and','or','in','on','to','of','by','from','new','best','price','buy','online'}

def norm(s): return re.sub(r'[^a-z0-9 ]+',' ',str(s or '').lower()).strip()
def tokens(s): return [x for x in norm(s).split() if x not in STOP]
def grams(s, nmin=2,nmax=4):
    s=' '+norm(s)+' '; return Counter(s[i:i+n] for n in range(nmin,nmax+1) for i in range(max(0,len(s)-n+1)))
def cosine(a,b):
    x,y=grams(a),grams(b); dot=sum(v*y.get(k,0) for k,v in x.items()); den=math.sqrt(sum(v*v for v in x.values())*sum(v*v for v in y.values()))
    return dot/den if den else 0.0
def tfidf_cosine(a,b,idf):
    x,y=grams(a),grams(b)
    vx={k:v*idf.get(k,1.0) for k,v in x.items()}; vy={k:v*idf.get(k,1.0) for k,v in y.items()}
    dot=sum(v*vy.get(k,0) for k,v in vx.items()); den=math.sqrt(sum(v*v for v in vx.values())*sum(v*v for v in vy.values()))
    return dot/den if den else 0.0
def is_accessory(title, words=None, query_terms=None):
    head=' '.join(norm(title).split()[:20]); terms=set(words or ACCESSORIES); query_terms=set(query_terms or ())
    # A term is a requested product type when it appears in the query. For
    # example, earbuds are a primary result for an earbuds search.
    terms={word for word in terms if not set(tokens(word)).issubset(query_terms)}
    title_terms=set(tokens(head))
    if title_terms & ACCESSORY_BRANDS and not title_terms & query_terms.intersection({'supcase','spigen','ringke','otterbox','caseology','gadgetshieldz','decalz','vaku','burga'}): return True
    for word in terms:
        parts=[re.escape(part) for part in norm(word).split()]
        if not parts: continue
        parts[-1]+=r's?'
        match=re.search(r'\b'+'\\s+'.join(parts)+r'\b',head)
        if match:
            prefix=head[:match.start()].strip()
            before_with=re.split(r'\bwith\b',prefix,maxsplit=1)[0].strip()
            has_product_before_with=bool(re.search(r'\b(phone|smartphone|mobile|laptop|notebook|headphones?|headsets?|earbuds?|televisions?|tv|watch|shoes?|sneakers?)\b',before_with))
            if has_product_before_with and word in {'charger','cable','adapter','earbuds'}: continue
            return True
    return False
def is_non_product_offer(title):
    value=' '.join(norm(title).split())
    return any(re.search(r'\b'+re.escape(phrase)+r'\b',value) for phrase in NON_PRODUCT_OFFERS)
def is_specific_model_query(query, query_terms):
    value=' '.join(norm(query).split())
    has_model_code=any(re.fullmatch(r'(?:[a-z]{1,4}\d{1,4}[a-z0-9]*|\d{1,5}[a-z]{1,4}\d*)',term) for term in query_terms)
    named_model=bool(re.search(r'\b(?:iphone|ipad|pixel|galaxy|oneplus|macbook|airpods?)\s+(?:pro\s+)?\d+\b',value))
    return len(query_terms)>1 and (has_model_code or named_model)
def condition_bucket(product):
    value=norm(' '.join((str(product.get('condition') or ''),str(product.get('title') or ''))))
    return 'used' if re.search(r'\b(refurbished|renewed|used|pre owned|second hand)\b',value) else 'other'
def median(xs): return statistics.median(xs) if xs else 0

def run(payload):
    products=payload if isinstance(payload,list) else payload.get('products',[])
    query='' if isinstance(payload,list) else str(payload.get('query',''))
    params={} if isinstance(payload,list) else payload.get('params',{})
    params=dict(params)
    budget=re.search(r'\b(?:under|below|less than|upto|up to)\s*(?:₹|rs\.?\s*)?([\d,]+)',query.lower())
    if budget and params.get('maxPrice') in (None,''):
        params['maxPrice']=float(budget.group(1).replace(',',''))
    cfg={} if isinstance(payload,list) else payload.get('categoryConfig',{})
    excluded=[]; candidates=[]; qterms=set(tokens(query))
    documents=[grams(query)]+[grams(p.get('title','')) for p in products]
    df=Counter(k for doc in documents for k in doc)
    idf={k:math.log((len(documents)+1)/(n+1))+1 for k,n in df.items()}
    for p in products:
        title=p.get('title',''); coverage=len(qterms & set(tokens(title)))/max(1,len(qterms))
        sim=tfidf_cosine(query,title,idf)
        if is_non_product_offer(title):
            excluded.append(dict(p,hiddenReason='not_product_offer',warnings=['not_product_offer'])); continue
        if is_accessory(title,cfg.get('excludeHeadWords'),qterms):
            excluded.append(dict(p,hiddenReason='accessory',warnings=['accessory_excluded'])); continue
        # Require a meaningful query match. A single shared model token (for
        # example, Oppo A55 in a Samsung Galaxy A55 search) is not enough.
        min_coverage=.5 if len(qterms)>1 else .25
        if query and coverage < min_coverage and sim < .22:
            excluded.append(dict(p,hiddenReason='low_relevance',warnings=['low_relevance'])); continue
        p=dict(p); p['_relevance']=min(1, .65*coverage + .35*sim); candidates.append(p)
    priced=[math.log(max(.01,float(p['price']))) for p in candidates if p.get('price') is not None and float(p['price'])>0]
    price_groups={}
    for p in candidates:
        if p.get('price') is not None and float(p['price'])>0:
            price_groups.setdefault(condition_bucket(p),[]).append(math.log(max(.01,float(p['price']))))
    specific_model=is_specific_model_query(query,qterms)
    med=median(priced); mad=median([abs(x-med) for x in priced]); hidden=[]
    for p in candidates:
        price=p.get('price')
        group_prices=price_groups.get(condition_bucket(p),priced)
        group_med=median(group_prices) if len(group_prices)>=3 else med
        group_mad=median([abs(x-group_med) for x in group_prices]) if len(group_prices)>=3 else mad
        delta=math.log(max(.01,float(price)))-group_med if price is not None else 0
        z=0 if price is None or not priced else (0.6745*delta/group_mad if group_mad else (99 if delta>math.log(1.5) else -99 if delta < -math.log(1.5) else 0))
        model_price_outlier=specific_model and len(group_prices)>=4 and abs(delta)>math.log(3)
        if abs(z)>3.5 or model_price_outlier:
            p['outlierZ']=round(z,2); p['warnings']=['price_outlier']; p['hiddenReason']='price_outlier'; hidden.append(p)
        else: p['outlierZ']=None
    hidden.extend(excluded); candidates=[p for p in candidates if p.get('hiddenReason')!='price_outlier']
    filtered=[]
    for p in candidates:
        reason=None; price=p.get('price'); rating=p.get('rating')
        if params.get('minPrice') not in (None,'') and (price is None or float(price)<float(params['minPrice'])): reason='price_below_min' if price is not None else 'price_not_listed'
        elif params.get('maxPrice') not in (None,'') and (price is None or float(price)>float(params['maxPrice'])): reason='over_budget' if price is not None else 'price_not_listed'
        elif params.get('minRating') not in (None,'') and (rating is None or float(rating)<float(params['minRating'])): reason='rating_below_min' if rating is not None else 'rating_not_listed'
        elif str(params.get('freeShipping','')).lower()=='true' and p.get('shippingCost')!=0 and p.get('hasFreeShipping') is not True: reason='not_free_shipping' if p.get('shippingCost') is not None or p.get('hasFreeShipping') is False else 'shipping_not_listed'
        if reason: hidden.append(dict(p,hiddenReason=reason,warnings=[reason]))
        else: filtered.append(p)
    candidates=filtered
    prices=[float(p['price']) for p in candidates]; revs=[math.log1p(max(0,float(p['reviews']))) for p in candidates if p.get('reviews') is not None]
    def bayes_rating(p):
        r,n=p.get('rating'),p.get('reviews')
        return ((float(r)*max(0,float(n))+4.2*50)/(max(0,float(n))+50)) if r is not None and n is not None else (float(r) if r is not None else None)
    ratings=[bayes_rating(p) for p in candidates if bayes_rating(p) is not None]
    def scale(value, vals, invert=False):
        if value is None or not vals: return .5
        lo,hi=min(vals),max(vals); v=float(value)
        score=.5 if hi==lo else (v-lo)/(hi-lo)
        return 1-score if invert else score
    prior=4.2; m=50
    def mini(p): return {k:p.get(k) for k in ('id','title','price','rating','reviews','platform','dealScore')}
    for p in candidates:
        r=p.get('rating'); n=p.get('reviews'); bayes=bayes_rating(p)
        p['bayesianRating']=round(bayes,3) if bayes is not None else None
        seller=next((v for k,v in TRUST.items() if k in str(p.get('platform','')).lower()),None)
        delivery=p.get('deliveryDays'); delivery_score=(1/(1+max(0,float(delivery))/3)) if delivery is not None else None
        shipping=p.get('shippingCost'); free=p.get('hasFreeShipping')
        shipping_score=.5 if shipping is None and free is None else (1 if shipping==0 or free is True else 0)
        features={'price':scale(p.get('price'),prices,True),'rating':scale(bayes,ratings),'reviews':scale(math.log1p(max(0,float(n))) if n is not None else None,revs),'seller_trust':.5 if seller is None else seller,'delivery':.5 if delivery_score is None else delivery_score,'shipping':shipping_score,'discount':max(0,min(1,float(p['discount'])/100)) if p.get('discount') is not None else .5,'cod':.5 if p.get('hasCOD') is None else (1 if p.get('hasCOD') else 0)}
        p['features']=features
    preset=str(params.get('priority','balanced')).lower().replace('most ','').replace(' ','')
    preset={'mostreliable':'reliable','reliable':'reliable'}.get(preset,preset)
    weights=PRESETS.get(preset,PRESETS['balanced']).copy()
    for k,v in cfg.get('weights',{}).items():
        if k in weights: weights[k]*=float(v)
    total=sum(weights.values()); weights={k:v/total for k,v in weights.items()}
    model_status='default'; votes=0
    try:
        with open(__file__.replace('deal_Scorer.py','ranker.json'),encoding='utf-8') as f: learned=json.load(f)
        votes=int(learned.get('votes',0))
        if votes>=30:
            lw=learned.get('weights',{}); alpha=min(1,votes/150)
            blended={k:(1-alpha)*weights[k]+alpha*float(lw.get(k,weights[k])) for k in FEATURES}
            denom=sum(blended.values()); weights={k:v/denom for k,v in blended.items()}; model_status='learned'
    except (OSError,ValueError,TypeError): pass
    for p in candidates:
        p['dealScore']=round(100*sum(p['features'][k]*weights[k] for k in FEATURES),1); p['deal_score']=p['dealScore']
        p['reasons']=[]; p['warnings']=[]
        if p['features']['price']>=.8: p['reasons'].append('low_price')
        if p.get('rating') is not None and p['rating']>=4.5: p['reasons'].append('high_rating')
        if p.get('reviews') is not None and p['reviews']>=1000: p['reasons'].append('many_reviews')
        if p.get('shippingCost')==0 or p.get('hasFreeShipping') is True: p['reasons'].append('free_shipping')
        if p.get('hasCOD') is None: p['warnings'].append('cod_not_listed')
        if p.get('deliveryDays') is None: p['warnings'].append('delivery_not_listed')
        if p.get('rating') is None: p['warnings'].append('rating_not_listed')
        if p.get('shippingCost') is None and p.get('hasFreeShipping') is None: p['warnings'].append('shipping_not_listed')
        if p.get('discount') is None: p['warnings'].append('discount_not_listed')
        if p.get('platform') is None: p['warnings'].append('seller_not_listed')
        if p.get('demo'): p['warnings'].append('demo_sample')
    candidates.sort(key=lambda p:(p['dealScore'],p['_relevance']),reverse=True)
    for p in candidates: p.pop('_relevance',None)
    def best(key, reverse=False, eligible=None):
        pool=[p for p in candidates if eligible is None or eligible(p)]
        return (min if not reverse else max)(pool,key=key) if pool else None
    picks={'bestOverall':candidates[0] if candidates else None,'cheapest':best(lambda p:float(p['price']),eligible=lambda p:p.get('price') is not None),'bestRated':best(lambda p:float(p['bayesianRating']),True,lambda p:p.get('bayesianRating') is not None),'fastest':best(lambda p:float(p['deliveryDays']),eligible=lambda p:p.get('deliveryDays') is not None)}
    for p in candidates:
        tier=max(1, round(float(p['price'])/10000)) if p.get('price') is not None else None
        peers=[x for x in candidates if tier is not None and x is not p and x.get('price') is not None and max(1,round(float(x['price'])/10000))==tier and x.get('id')!=p.get('id')]
        similar=[x for x in peers if cosine(p.get('title'),x.get('title'))>=.2]
        cheaper=[x for x in similar if p.get('price') is not None and x.get('price') is not None and float(x['price'])<float(p['price']) and x['dealScore']>=p['dealScore']-8]
        better=[x for x in similar if x['dealScore']>p['dealScore']+2]
        p['alternatives']={'cheaper':mini(min(cheaper,key=lambda x:float(x['price']))) if cheaper else None,'better':mini(max(better,key=lambda x:x['dealScore'])) if better else None}
    for p in hidden:
        p.pop('_relevance',None)
    return {'products':candidates,'ranked':candidates,'picks':picks,'hidden':hidden,'model':{'status':model_status,'votes':votes,'weights':preset,'featureWeights':weights}}

def main():
    try: print(json.dumps(run(json.load(sys.stdin))))
    except Exception as e: sys.stderr.write(str(e)+'\n'); sys.exit(1)
if __name__=='__main__': main()
