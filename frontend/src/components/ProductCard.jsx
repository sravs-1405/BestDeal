function ProductCard({ product }) {
  const {
    title,
    price,
    rating,
    reviews,
    image,
    originalUrl,
    platform,
    dealScore,
    isBestDeal,
    shippingCost,
    deliveryDays,
    hasCOD,
    discount
  } = product;

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
      isBestDeal ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
    }`}>
      
      {/* Best Deal Badge */}
      {isBestDeal && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-2 px-4 flex items-center justify-center gap-2">
          <span className="text-2xl">🏆</span>
          <span className="font-bold text-lg">BEST DEAL</span>
          <span className="bg-white text-yellow-600 px-2 py-0.5 rounded-full text-sm font-bold">
            {dealScore}/100
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={image || '/placeholder.png'}
          alt={title}
          className="w-full h-full object-contain p-4"
        />
        
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full shadow text-xs font-bold text-gray-700">
          {platform}
        </div>

        {hasCOD && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
            <span>💵</span>
            <span>COD</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-3 h-12 text-sm">
          {title}
        </h3>

        {/* Price Section */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-3xl font-bold text-green-600">
              {formatINR(price)}
            </p>
            {shippingCost > 0 ? (
              <p className="text-xs text-gray-500 mt-1">
                + {formatINR(shippingCost)} shipping
              </p>
            ) : (
              <p className="text-xs text-green-600 font-semibold mt-1">
                ✓ FREE Delivery
              </p>
            )}
            {discount > 0 && (
              <p className="text-xs text-orange-600 font-semibold mt-1">
                💰 {discount}% OFF
              </p>
            )}
          </div>
          
          {rating > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
              </div>
              {reviews > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  ({reviews.toLocaleString('en-IN')})
                </p>
              )}
            </div>
          )}
        </div>

        {/* Deal Score Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-600 font-medium">Deal Quality</span>
            <span className="font-bold text-green-600">{dealScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dealScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                dealScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                'bg-gradient-to-r from-orange-400 to-orange-600'
              }`}
              style={{ width: `${dealScore}%` }}
            />
          </div>
        </div>

        {/* Delivery Info */}
        <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
          <span className="text-lg">🚚</span>
          Delivery in {deliveryDays} {deliveryDays === 1 ? 'day' : 'days'}
        </p>

        {/* Buy Button */}
        
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-center py-3 rounded-lg font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-md"
        
          View on {platform} →
      </div>
    </div>
  );
}

export default ProductCard;