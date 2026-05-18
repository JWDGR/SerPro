const THEMES = [
  {
    id: 'service',
    label: 'Service & Staff',
    keywords: ['staff', 'service', 'server', 'waiter', 'waitress', 'barista', 'manager', 'employee', 'rude', 'friendly', 'welcoming', 'attentive'],
    recommendation: 'Invest in staff training focused on customer service. Consider role-playing common scenarios and rewarding friendly, attentive behavior.',
  },
  {
    id: 'wait',
    label: 'Wait Times & Speed',
    keywords: ['wait', 'waited', 'slow', 'fast', 'quick', 'minutes', 'hour', 'long', 'forever', 'rush'],
    recommendation: 'Audit your peak-hour workflow. Add staff during rush times, simplify the menu, or introduce mobile ordering to reduce wait times.',
  },
  {
    id: 'cleanliness',
    label: 'Cleanliness',
    keywords: ['clean', 'dirty', 'bathroom', 'restroom', 'wiped', 'sticky', 'sanitary', 'hair', 'mess', 'gross'],
    recommendation: 'Tighten your cleaning schedule. Assign explicit hourly checks for bathrooms, tables, and floors, and post a visible cleaning log.',
  },
  {
    id: 'price',
    label: 'Pricing & Value',
    keywords: ['price', 'pricey', 'expensive', 'cheap', 'cost', 'value', 'worth', '$', 'overpriced'],
    recommendation: 'Customers question your value. Consider a value-tier menu, loyalty discounts, or clearer portion sizing so the price feels justified.',
  },
  {
    id: 'food',
    label: 'Food & Drink Quality',
    keywords: ['food', 'taste', 'tasty', 'delicious', 'bland', 'cold', 'fresh', 'stale', 'flavor', 'coffee', 'pasta', 'drink', 'latte', 'espresso'],
    recommendation: 'Quality is being mentioned in both praise and complaints. Spot-check recipes for consistency and verify ingredient freshness across all shifts.',
  },
  {
    id: 'atmosphere',
    label: 'Atmosphere & Comfort',
    keywords: ['atmosphere', 'cozy', 'noisy', 'loud', 'quiet', 'music', 'lighting', 'cold', 'hot', 'temperature', 'ambiance', 'vibe'],
    recommendation: 'Atmosphere matters as much as the product. Re-check your music volume, lighting, and HVAC settings at different times of day.',
  },
  {
    id: 'seating',
    label: 'Seating & Space',
    keywords: ['seat', 'seating', 'table', 'crowded', 'cramped', 'space', 'room', 'spacious'],
    recommendation: 'Reconfigure your floor plan for better flow, or add reservation/waitlist tools so guests are not turned away.',
  },
  {
    id: 'parking',
    label: 'Parking & Access',
    keywords: ['parking', 'park', 'lot', 'access', 'street'],
    recommendation: 'Parking friction is costing you customers. Highlight nearby lots on your profile, validate parking, or partner with delivery apps.',
  },
  {
    id: 'wifi',
    label: 'Wifi & Amenities',
    keywords: ['wifi', 'wi-fi', 'internet', 'outlet', 'plug', 'charger'],
    recommendation: 'For a work-friendly crowd, invest in reliable wifi and accessible outlets. Post the wifi name/password prominently.',
  },
  {
    id: 'accuracy',
    label: 'Order Accuracy',
    keywords: ['wrong', 'mistake', 'mixed up', 'incorrect', 'forgot', 'missing'],
    recommendation: 'Introduce an order-confirmation step (repeat-back at register, ticket review before handoff) to cut down on wrong orders.',
  },
];

const POSITIVE_WORDS = new Set([
  'amazing', 'great', 'best', 'love', 'loved', 'perfect', 'friendly', 'delicious',
  'incredible', 'welcoming', 'cozy', 'fresh', 'tasty', 'authentic', 'good', 'nice',
  'lovely', 'recommend', 'excellent', 'fantastic', 'wonderful',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'worst', 'terrible', 'awful', 'rude', 'slow', 'dirty', 'cold', 'wrong',
  'overpriced', 'expensive', 'noisy', 'loud', 'disappointed', 'horrible', 'gross',
  'overwhelmed', 'nightmare', 'mistake', 'unwelcome', 'limited',
]);

function tokenize(text) {
  return text.toLowerCase().match(/[a-z']+/g) || [];
}

function sentimentFromText(text) {
  const tokens = tokenize(text);
  let score = 0;
  for (const t of tokens) {
    if (POSITIVE_WORDS.has(t)) score += 1;
    if (NEGATIVE_WORDS.has(t)) score -= 1;
  }
  return score;
}

export function analyzeReviews(reviews) {
  if (!reviews.length) {
    return null;
  }

  const total = reviews.length;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  const distribution = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    distribution[idx] += 1;
  }

  const themeCounts = THEMES.map((theme) => {
    let positive = 0;
    let negative = 0;
    const examples = [];
    for (const review of reviews) {
      const tokens = tokenize(review.text);
      const matched = theme.keywords.some((kw) => tokens.includes(kw));
      if (!matched) continue;
      const sentiment = sentimentFromText(review.text) + (review.rating - 3);
      if (sentiment >= 0) positive += 1;
      else negative += 1;
      if (examples.length < 2 && sentiment < 0) {
        examples.push(review.text);
      }
    }
    return {
      id: theme.id,
      label: theme.label,
      positive,
      negative,
      mentions: positive + negative,
      recommendation: theme.recommendation,
      examples,
    };
  });

  const issues = themeCounts
    .filter((t) => t.negative > 0)
    .sort((a, b) => b.negative - a.negative);

  const strengths = themeCounts
    .filter((t) => t.positive > t.negative && t.positive >= 2)
    .sort((a, b) => b.positive - a.positive);

  const recommendations = issues.slice(0, 5).map((t) => ({
    theme: t.label,
    negativeMentions: t.negative,
    text: t.recommendation,
    examples: t.examples,
  }));

  if (avgRating < 3.5) {
    recommendations.unshift({
      theme: 'Overall Reputation',
      negativeMentions: 0,
      text: `Your average rating is ${avgRating.toFixed(2)}, which actively pushes customers to competitors. Prioritize the top issues below and respond publicly to recent 1-2 star reviews to show you're listening.`,
      examples: [],
    });
  }

  return {
    total,
    avgRating,
    distribution,
    strengths: strengths.slice(0, 3),
    recommendations,
  };
}
