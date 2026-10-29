import json, math, sqlite3, pathlib, sys
FEATURES=['price','rating','reviews','seller_trust','delivery','shipping','discount','cod']
DEFAULT={'price':.22,'rating':.19,'reviews':.12,'seller_trust':.12,'delivery':.10,'shipping':.08,'discount':.09,'cod':.08}
def sigmoid(z): return 1/(1+math.exp(-max(-30,min(30,z))))
def main():
 dbpath=pathlib.Path(__file__).parents[1]/'data'/'bestdeal.sqlite'
 if not dbpath.exists(): print('No survey database found.',file=sys.stderr);sys.exit(1)
 conn=sqlite3.connect(dbpath); rows=conn.execute('SELECT left_features,right_features,winner FROM survey_pool WHERE winner IS NOT NULL').fetchall();n=len(rows)
 if n<1: print('No votes yet.');return
 X=[];Y=[]
 for left,right,winner in rows:
  a=json.loads(left or '{}');b=json.loads(right or '{}');X.append([float(a.get(k,.5))-float(b.get(k,.5)) for k in FEATURES]);Y.append(1 if winner==0 else 0)
 w=[0.0]*len(FEATURES);bias=0.0;lr=.08;epochs=1200
 for _ in range(epochs):
  gw=[0.0]*len(w);gb=0
  for x,y in zip(X,Y):
   e=sigmoid(sum(a*b for a,b in zip(w,x))+bias)-y
   for j,v in enumerate(x):gw[j]+=e*v
   gb+=e
  for j in range(len(w)):w[j]-=lr*(gw[j]/n+.002*w[j])
  bias-=lr*gb/n
 # convert fitted coefficients into a positive, normalized blendable weight profile
 positive=[max(0.01,v) for v in w];scale=sum(positive);learned={k:positive[i]/scale for i,k in enumerate(FEATURES)}
 alpha=min(1,n/150);blended={k:(1-alpha)*DEFAULT[k]+alpha*learned[k] for k in FEATURES};total=sum(blended.values());blended={k:v/total for k,v in blended.items()}
 pred=[1 if sigmoid(sum(a*b for a,b in zip(w,x))+bias)>=.5 else 0 for x in X]
 cheapest=[1 if x[0]>0 else 0 for x in X];rated=[1 if x[1]>0 else 0 for x in X]
 agree=lambda values:sum(a==b for a,b in zip(values,Y))/n
 artifact={'votes':n,'weights':blended,'learnedWeights':learned,'agreement':{'ranker':agree(pred),'alwaysCheapest':agree(cheapest),'alwaysBestRated':agree(rated)}}
 outfile=pathlib.Path(__file__).with_name('ranker.json');outfile.write_text(json.dumps(artifact,indent=2),encoding='utf8')
 print(json.dumps({'votes':n,'agreement':artifact['agreement'],'output':str(outfile)},indent=2))
if __name__=='__main__': main()
