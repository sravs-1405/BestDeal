const retailerSearch = {
  Amazon: q => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
  Flipkart: q => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
  Myntra: q => `https://www.myntra.com/search?q=${encodeURIComponent(q)}`,
  Snapdeal: q => `https://www.snapdeal.com/search?keyword=${encodeURIComponent(q)}`,
  Meesho: q => `https://www.meesho.com/search?q=${encodeURIComponent(q)}`,
  Shopsy: q => `https://www.shopsy.in/search?q=${encodeURIComponent(q)}`,
  Nykaa: q => `https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}`,
  AJIO: q => `https://www.ajio.com/search/?text=${encodeURIComponent(q)}`,
  'JioMart': q => `https://www.jiomart.com/search/${encodeURIComponent(q)}`
};

function sample(title, price, rating, reviews, image, platform, originalUrl) {
  return {
    title, price, rating, reviews, image,
    originalUrl: originalUrl || retailerSearch[platform]?.(title) || `https://www.google.co.in/search?tbm=shop&q=${encodeURIComponent(title)}`,
    platform,
    shippingCost: null,
    deliveryDays: null,
    hasCOD: null,
    discount: null,
    condition: null,
    demo: true
  };
}

const products = [
  {title:'Samsung Galaxy A55 5G 8GB RAM 128GB',price:27999,rating:4.4,reviews:1820,image:'https://cdn.akakce.com/_static/395312985/samsung-a55.png',originalUrl:'https://www.samsung.com/in/smartphones/galaxy-a/galaxy-a55-5g/',platform:'Samsung',shippingCost:null,deliveryDays:null,hasCOD:null,discount:null,condition:null,demo:true},
  {title:'Samsung Galaxy A35 5G 8GB RAM 128GB',price:24999,rating:4.5,reviews:960,image:'https://cdn.beebom.com/mobile/2024/02/Samsung-Galaxy-A35-5G-1.png',originalUrl:'https://www.samsung.com/in/smartphones/galaxy-a/',platform:'Samsung',shippingCost:null,deliveryDays:null,hasCOD:null,discount:null,condition:null,demo:true},
  {title:'Motorola Edge 50 Fusion 8GB RAM 128GB',price:22999,rating:4.3,reviews:740,image:'https://cdn.movertix.com/media/catalog/product/m/o/motorola-edge-50-fusion-5g-dual-sim-marshmallow-blue-512gb-and-12gb-ram-xt2429-2_1.jpg',originalUrl:'https://www.motorola.in/',platform:'Motorola',shippingCost:null,deliveryDays:null,hasCOD:null,discount:null,condition:null,demo:true},
  {title:'Samsung Galaxy A55 protective case cover',price:499,rating:4.2,reviews:220,image:'',originalUrl:'',platform:'Demo Store',shippingCost:null,deliveryDays:null,hasCOD:null,discount:null,condition:null,demo:true}
];
const audioProducts = [
  {title:'JBL Tune 770NC Wireless Over-Ear Headphones',price:7999,rating:4.3,reviews:640,image:'https://www.jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw24180335/1.JBL_Tune_770NC_Product%20Image_Hero_Black.png?sh=535&sw=535',originalUrl:'https://www.amazon.in/s?k=JBL+Tune+770NC',platform:'Amazon',shippingCost:null,deliveryDays:null,hasCOD:null,discount:null,condition:null,demo:true},
  {title:'Sony WH-CH720N Wireless Noise Cancelling Headphones',price:8990,rating:4.4,reviews:820,image:'https://computechstore.in/media/uploads/wp/2023/03/CH720N-5.jpg',originalUrl:'https://www.amazon.in/s?k=Sony+WH-CH720N',platform:'Amazon',shippingCost:null,deliveryDays:null,hasCOD:null,discount:null,condition:null,demo:true}
];
const earbudProducts = [
  sample('Realme Buds T110 Wireless Earbuds',477,4.4,4300,'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSoP5NoQHUi2f685HNA82j51ak6Ze7K3LxeLOww8mkiSlPcB4jVcxBvubYpK5Aqic4RCCt4Z4MD_K7x5tVdnEZfj0ovmajNOQ','Meesho'),
  sample('OnePlus Nord Buds 3 Pro Truly Wireless Bluetooth Earbuds',2799,4.6,811,'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQTFqoiHLVDpurLXTghrBNKkAwomHPecqLpGALIrQuKihsXa0pCtR2a2D6yFjFgwBpeSUVnP2ImCoXmXbFT6mJna_uHqj2q2LbLeDEVOsQ','Flipkart')
];
const laptopProducts = [
  sample('Acer Aspire One AMD Ryzen 3 7320U 256GB SSD 14-inch Laptop',39990,5,64,'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTqXX5gC-xJipwquqaYUSLa9-JgDb8WJOFjBjHx5ZGaaTtd4RlwSzVHx8AdSp3g27n9j6bt-y_U9osMWIIYYk60bcQ7pT9Mu309KIqc_x2z-J8o2ohHz-Ih','Flipkart'),
  sample('ASUS Chromebook Laptop',28990,4.4,22,'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRQMmLI6fd3-se1XFEkw4NmacUPxuD8wmOip5ryA2wBmF5qCQS72ZoS3-cQFPNBjjQVdizU7XrZsShpuASJOKWd9ISoDM5-FN7LZuQMO8GXdUR5NfBtHBSkmg','Amazon')
];
const footwearProducts = [
  sample('ASICS Men Jolt 4 Running Shoes',1900,4.5,1500,'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ8qNmQk9GSjlP_rx5j5HAYk0z1Ys9sIvB26LA5-KOM-_x6bUYBBJCiIAybV0QTB-jTXbDFMVhYxMzRhIFoSw4dsBIIMevTqlvdjBB97jF-w4A9QCyp0ff2','AJIO'),
  sample('Nivia Marathon 2.0 Running Shoes for Men',1119,4.6,15,'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTrXHD3_bB7rnR92cl6CGmZ_UZqL-hUIGPIL-_MqA_RaH9VkT5sWBaJFWlfeEaKOvaRhzJu_kkVVQIwh1rfqd0Q46HHfj4nXp2TIqkFLXOPVlw1CuqF_DYsBg','Amazon'),
];
const watchProducts = [
  sample('Noise NoiseFit Diva Smartwatch',3169,4.9,660,'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTX-A824-PTsRAYiWve0YAgo9Ig-XDesCt-zfq7eA8G0ZD3HbQAjZR4iIVSnJuZLJysW53jPK2mSRge87j4GP3HUsG27nVqmr-ObMsUkWDz0dkPETzwMWLpxA','AJIO'),
  sample('CMF by Nothing Watch Pro 2 Smartwatch',4199,4.5,2100,'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT1TRPlOyZYWQgGY4eQ9QoK0PQoYwc3XRebAOD2vIk4MTxUYtmAwRJGPv7FjUms0e2iBJwLjutqIq2SO_DStRn6rCYlErMwtnCwMGYdBO5538Qz0i3UOTOyA-k','Myntra'),
  sample('OnePlus Watch 2R',11999,4.6,188,'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTdf8BWSkCzLYsYxIln1Jm3Tu4NjShfpTPVAKztvYXPCVhebVWvSTfEaY0zD1I1kNLyoSSLXRXRG5F12rgvB5jw04W9eK-796C0SyFmhRhgXbNF57jzzzRUoQ','Amazon')
];
const tvProducts = [
  sample('TCL V5C 32-inch QLED Full HD Smart Google TV',17990,4.9,2500,'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRk9leO8atcGE8_rsbpxS8kFHGrD2SXaI7Lqk92Cs5fr7-18SvX9oRPKcG9RzQjTTrAQKh_9gk','Flipkart'),
  sample('Xiaomi A Series 80 cm Smart Google TV',11799,4.5,2,'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ9JbkNcDwUQqq9Op3AVBwrm3QvfY3WFepGjXQ51tEEkXNChHESoGCwZepzMfH_MhjQrsQce_I','Flipkart')
];
const speakerProducts = [
  sample('Sony SRS-XB100 Compact Portable Wireless Bluetooth Speaker',2490,4.8,11000,'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTS771kHK0iZbqNMR7nUZwHhGFjcyKDgsAqFURYU03sPq4390OqIBXKffrc-XPoHCgJ5ugUgB_gFPid7U6HlevKn6AQm8b2vxMfc0t6DMABI1QmwYnp1TobCr3A','Myntra'),
  sample('GOBOULT Rave Q5 Bluetooth Speaker',899,4.8,30,'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSlznPdtiRm9ZRqLFjPL8g6m7EGHhNRXqyWJcJ8Ji7BnbOeZh6Cf1zESG5QrX_1BuR8QwZrhkpbglUATHJoqZqBnpDEIveWv3FvoM6WSSDaaQNaUSKgc-Ku9Q','Amazon')
];

function selectProducts(query, category) {
  const q=String(query||'').toLowerCase();
  if(category==='laptops'||/\blaptop\b|\bnotebook\b|chromebook/.test(q)) return laptopProducts;
  if(category==='footwear'||/running shoes|sneakers?|footwear|\bshoes\b/.test(q)) return footwearProducts;
  if(category==='tvs'||/\btv\b|television|oled/.test(q)) return tvProducts;
  if(/earbuds|earphones|tws|in.?ear/.test(q)) return earbudProducts;
  if(/smartwatch|smart watch|fitness watch/.test(q)) return watchProducts;
  if(/speaker|soundbar/.test(q)) return speakerProducts;
  if(category==='audio'||/headphones|headset/.test(q)) return audioProducts;
  return products;
}

module.exports = { demoProducts: (query, category='all') => selectProducts(query,category).map(p=>({...p})) };
