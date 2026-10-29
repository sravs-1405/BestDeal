import importlib.util, pathlib, unittest
path=pathlib.Path(__file__).parents[1]/'deal_Scorer.py'
spec=importlib.util.spec_from_file_location('ranker',path); ranker=importlib.util.module_from_spec(spec); spec.loader.exec_module(ranker)
class PipelineTests(unittest.TestCase):
 def fixture(self):
  return [{'id':'a','title':'Samsung Galaxy smartphone 128GB','price':25000,'rating':5.0,'reviews':3,'platform':'Flipkart','shippingCost':0,'deliveryDays':None,'hasCOD':None,'discount':None},{'id':'b','title':'Samsung Galaxy smartphone 256GB','price':29000,'rating':4.5,'reviews':3000,'platform':'Amazon','shippingCost':None,'deliveryDays':2,'hasCOD':None,'discount':10},{'id':'c','title':'Samsung Galaxy smartphone phone case cover','price':499,'rating':4.8,'reviews':20,'platform':'Store','shippingCost':None,'deliveryDays':None,'hasCOD':None,'discount':None}]
 def test_accessory_filtered_but_with_charger_phrase_kept(self):
  products=self.fixture(); products[2]['title']='Samsung Galaxy smartphone case cover'
  result=ranker.run({'query':'Samsung Galaxy smartphone','products':products})
  self.assertNotIn('c',[p['id'] for p in result['products']]); self.assertTrue(any(p.get('hiddenReason')=='accessory' for p in result['hidden']))
  allowed=ranker.run({'query':'phone with charger','products':[{'id':'x','title':'Phone with charger bundle','price':1000}]})
  self.assertTrue(allowed['products'])
  phone_bundle=ranker.run({'query':'Samsung Galaxy A55','products':[{'id':'x','title':'Samsung Galaxy A55 smartphone with charger','price':23999}]})
  self.assertTrue(phone_bundle['products'])
 def test_earbuds_are_valid_products_when_requested(self):
  result=ranker.run({'query':'wireless earbuds','products':[{'id':'buds','title':'Samsung Galaxy Buds wireless earbuds','price':4999}]})
  self.assertEqual([p['id'] for p in result['products']],['buds'])
 def test_query_match_rejects_similar_model_accessory_and_trade_in(self):
  items=[
   {'id':'match','title':'Samsung Galaxy A55 5G smartphone','price':23999},
   {'id':'related','title':'Galaxy A55 5G 128GB','price':21999},
   {'id':'wrong-model','title':'Oppo A55 4GB 64GB smartphone','price':13499},
   {'id':'case','title':'Samsung Galaxy A55 mobile back cover case','price':299},
   {'id':'long-case','title':'Samsung Galaxy A55 5G Leather Flip with Wallet Case with TPU Shockproof Cover','price':249},
   {'id':'skin','title':'Samsung Galaxy A55 5G Skins and Wraps by Decalz','price':399},
   {'id':'case-brand','title':'Supcase Unicorn Beetle Pro Galaxy A55 5G','price':6148},
   {'id':'trade-in','title':'Sell Old Samsung Galaxy A55 5G','price':17550},
   {'id':'info-page','title':'Samsung Galaxy A55 price from and specifications August 2026','price':5329},
  ]
  result=ranker.run({'query':'Samsung Galaxy A55','products':items})
  self.assertEqual({p['id'] for p in result['products']},{'match','related'})
  reasons={p['id']:p['hiddenReason'] for p in result['hidden']}
  self.assertEqual(reasons['wrong-model'],'low_relevance')
  self.assertEqual(reasons['case'],'accessory')
  self.assertEqual(reasons['long-case'],'accessory')
  self.assertEqual(reasons['skin'],'accessory')
  self.assertEqual(reasons['case-brand'],'accessory')
  self.assertEqual(reasons['trade-in'],'not_product_offer')
  self.assertEqual(reasons['info-page'],'not_product_offer')
 def test_outlier_flagged(self):
  items=[{'id':str(i),'title':f'phone model {i}','price':p} for i,p in enumerate([9000,9500,10000,10500,11000,12,200000])]
  r=ranker.run({'query':'phone','products':items}); outliers=[p for p in r['hidden'] if p.get('hiddenReason')=='price_outlier']; self.assertEqual(len(outliers),2)
 def test_extreme_price_is_checked_against_same_model_and_condition(self):
  items=[
   {'id':'new-1','title':'Samsung Galaxy A55 5G 128GB','price':23999},
   {'id':'new-2','title':'Samsung Galaxy A55 5G 256GB','price':24999},
   {'id':'new-3','title':'Samsung Galaxy A55 Enterprise Edition','price':22999},
   {'id':'new-bad','title':'Samsung Galaxy A55 5G smartphone','price':5520},
   {'id':'used-1','title':'Samsung Galaxy A55 refurbished','price':16999},
   {'id':'used-2','title':'Samsung Galaxy A55 refurbished 256GB','price':17999},
   {'id':'used-3','title':'Samsung Galaxy A55 refurbished 128GB','price':15999},
  ]
  result=ranker.run({'query':'Samsung Galaxy A55','products':items})
  reasons={p['id']:p['hiddenReason'] for p in result['hidden']}
  self.assertEqual(reasons['new-bad'],'price_outlier')
  self.assertIn('used-1',{p['id'] for p in result['products']})
 def test_bayesian_ordering(self):
  r=ranker.run({'query':'Samsung Galaxy smartphone','products':self.fixture()})
  by_id={p['id']:p for p in r['products']}; self.assertLess(by_id['a']['features']['rating'],by_id['b']['features']['rating'])
 def test_filters_and_picks(self):
  r=ranker.run({'query':'Samsung Galaxy smartphone','products':self.fixture(),'params':{'minPrice':24000,'maxPrice':28000}})
  self.assertEqual([p['id'] for p in r['products']],['a']); self.assertTrue(any(p['id']=='b' and p['hiddenReason']=='over_budget' for p in r['hidden']))
  self.assertEqual(r['picks']['cheapest']['id'],'a'); self.assertIsNotNone(r['picks']['bestOverall'])
  self.assertEqual(set(r['picks']),{'bestOverall','cheapest','bestRated','fastest'})
  self.assertEqual(set(r['products'][0]['features']),set(ranker.FEATURES))
if __name__=='__main__': unittest.main()
