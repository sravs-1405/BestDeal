import sys
import json
import math

def score_deal(product):
    score = 0

    # ── 1. PRICE SCORE (25 pts) ──
    price = float(product.get('price', 0) or 0)
    if price > 0:
        # Lower price relative to category = better score
        # We normalize using log scale
        if price < 500:
            price_score = 25
        elif price < 2000:
            price_score = 22
        elif price < 5000:
            price_score = 20
        elif price < 15000:
            price_score = 17
        elif price < 30000:
            price_score = 14
        elif price < 60000:
            price_score = 11
        else:
            price_score = 8
    else:
        price_score = 0
    score += price_score

    # ── 2. RATING SCORE (20 pts) ──
    rating = float(product.get('rating', 0) or 0)
    rating_score = (rating / 5.0) * 20
    score += rating_score

    # ── 3. REVIEWS SCORE (15 pts) ──
    reviews = int(product.get('reviews', 0) or 0)
    if reviews >= 10000:
        review_score = 15
    elif reviews >= 5000:
        review_score = 13
    elif reviews >= 1000:
        review_score = 11
    elif reviews >= 500:
        review_score = 9
    elif reviews >= 100:
        review_score = 7
    elif reviews >= 10:
        review_score = 4
    else:
        review_score = 1
    score += review_score

    # ── 4. FREE SHIPPING SCORE (15 pts) ──
    shipping_cost = float(product.get('shippingCost', 0) or 0)
    free_shipping = product.get('hasFreeShipping', False) or shipping_cost == 0
    shipping_score = 15 if free_shipping else max(0, 15 - (shipping_cost / 10))
    score += shipping_score

    # ── 5. COD SCORE (10 pts) ──
    has_cod = product.get('hasCOD', False)
    score += 10 if has_cod else 0

    # ── 6. DELIVERY SPEED SCORE (10 pts) ──
    delivery_days = int(product.get('deliveryDays', 5) or 5)
    if delivery_days == 0:
        delivery_score = 10
    elif delivery_days == 1:
        delivery_score = 9
    elif delivery_days == 2:
        delivery_score = 8
    elif delivery_days == 3:
        delivery_score = 6
    elif delivery_days <= 5:
        delivery_score = 4
    else:
        delivery_score = 2
    score += delivery_score

    # ── 7. DISCOUNT SCORE (5 pts) ──
    discount = float(product.get('discount', 0) or 0)
    if discount >= 40:
        discount_score = 5
    elif discount >= 25:
        discount_score = 4
    elif discount >= 15:
        discount_score = 3
    elif discount >= 5:
        discount_score = 2
    else:
        discount_score = 0
    score += discount_score

    # ── 8. PLATFORM TRUST SCORE (max bonus) ──
    platform = str(product.get('platform', '') or '').lower()
    trust_map = {
        'amazon': 5,
        'flipkart': 5,
        'tata cliq': 4,
        'croma': 4,
        'myntra': 3,
        'nykaa': 3,
        'ajio': 3,
        'snapdeal': 2,
        'meesho': 2,
        'shopsy': 2,
        'jiomart': 2,
    }
    trust_score = 0
    for key, val in trust_map.items():
        if key in platform:
            trust_score = val
            break
    score += trust_score

    # Clamp to 0–100
    final_score = max(0, min(100, round(score)))
    return final_score


def main():
    try:
        raw = sys.stdin.read()
        products = json.loads(raw)

        if not isinstance(products, list):
            products = [products]

        for product in products:
            product['dealScore'] = score_deal(product)
            product['deal_score'] = product['dealScore']

        # Sort by score descending
        products.sort(key=lambda p: p.get('dealScore', 0), reverse=True)

        print(json.dumps(products))

    except Exception as e:
        sys.stderr.write(f"Error in deal_scorer.py: {str(e)}\n")
        sys.exit(1)


if __name__ == '__main__':
    main()