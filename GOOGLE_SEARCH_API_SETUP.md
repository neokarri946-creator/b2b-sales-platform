# How to Get Google Custom Search API Keys

You need two things:
1. **Google API Key** - for authentication
2. **Search Engine ID** - identifies your custom search engine

## Step 1: Get Google API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing)**
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Name it something like "B2B-Sales-Platform"
   - Click "Create"

3. **Enable Custom Search API**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Custom Search API"
   - Click on it and press "ENABLE"

4. **Create API Key**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "+ CREATE CREDENTIALS"
   - Select "API key"
   - Copy the API key that appears
   - (Optional) Click "Restrict Key" to add restrictions for security

## Step 2: Create Custom Search Engine

1. **Go to Programmable Search Engine**
   - Visit: https://programmablesearchengine.google.com/cse/all

2. **Create New Search Engine**
   - Click "Add" or "New Search Engine"
   - For "Sites to search":
     - You can enter specific sites like:
       ```
       *.yahoo.com
       *.bloomberg.com
       *.reuters.com
       *.wsj.com
       *.marketwatch.com
       *.forbes.com
       *.techcrunch.com
       ```
     - OR select "Search the entire web" for broader results
   - Name your search engine (e.g., "B2B Company Research")
   - Click "Create"

3. **Get Your Search Engine ID**
   - After creation, click on your search engine name
   - Find the "Search engine ID" (looks like: `017643444788157587538:ef7tj3rqpqy`)
   - Copy this ID

## Step 3: Add to Your .env.local

Add these two values to your `.env.local` file:

```bash
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
```

## Free Tier Limits
- **100 searches per day** for free
- Resets at midnight Pacific Time
- If you need more, you can:
  - Pay $5 per 1000 queries (up to 10k/day)
  - Or create multiple projects/engines

## Testing Your Setup

Once you have both keys, you can test with this URL:

```
https://www.googleapis.com/customsearch/v1?q=Microsoft&key=YOUR_API_KEY&cx=YOUR_ENGINE_ID
```

Replace `YOUR_API_KEY` and `YOUR_ENGINE_ID` with your actual values.

## What This Enables

With Google Search API, your analysis will:
- Find real company websites and profiles
- Get current news articles about companies
- Discover partnership announcements
- Find technology stack information
- Locate financial reports and earnings calls
- Retrieve industry analysis and reports

This makes your B2B analysis reports much more accurate with real, current data!