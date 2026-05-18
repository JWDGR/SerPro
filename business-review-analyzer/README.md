# Business Review Analyzer

A simple React app that analyzes Google Maps-style reviews for a business and
produces concrete, themed recommendations for how to improve.

## What it does

1. Accept reviews for a business (paste a list, or load a built-in sample).
2. Parse rating + text per review.
3. Classify each review into themes (service, wait times, cleanliness, pricing,
   food quality, atmosphere, seating, parking, wifi, order accuracy).
4. Surface average rating, star distribution, strengths, and prioritized
   recommendations targeted at the most-complained-about themes.

## Run locally

```bash
cd business-review-analyzer
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Review input format

Paste one review per line. Optionally prefix the rating:

```
5 | Great coffee and friendly staff
2 | Waited 30 minutes for a latte
The wifi keeps dropping
```

If no rating is provided the review is treated as 3 stars.

## Fetching real Google Maps reviews

The Google Places API requires a server-side API key and returns at most 5
reviews per place. To wire it up, add a small backend that calls the
[Places Details API](https://developers.google.com/maps/documentation/places/web-service/details)
and exposes a `/api/reviews?placeId=...` endpoint, then have the React app
fetch from it instead of using pasted text.
