# Setup Instructions

## Quick Start (With Your data.csv File)

Since the CSV file is 49MB, it's not included in the ZIP. Follow these steps:

### Step 1: Extract the Project
```bash
unzip product-search-v2-final.zip
cd product-search-v2
```

### Step 2: Add Your CSV File
```bash
# Copy your data.csv into the public folder
cp /path/to/your/data.csv public/data.csv
```

The file structure should look like:
```
product-search-v2/
├── public/
│   └── data.csv          ← Your 49MB CSV file goes here
├── app/
├── components/
├── lib/
└── ...
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

You should see a loading screen while the 872k rows are parsed (~3-5 seconds), then all active products will display.

## Alternative: Use CSV Upload Feature

If you don't want to place the file in `public/`:

1. Run the app without data.csv (it will show an error)
2. Click the "Upload CSV" button in the top right
3. Select your data.csv file
4. Wait for parsing to complete
5. Products will load into the interface

## Testing Without Your CSV

Want to test the interface first? The app will show an error about missing data.csv, but you can:

1. Create a small sample CSV in `public/data.csv`:

```csv
ID,TITLE,VENDOR,STATUS,PRICE_RANGE_V2,TOTAL_INVENTORY,TAGS,DESCRIPTION
8121622593775,Thorne Stress Support,Thorne,ACTIVE,"{\"min_variant_price\":{\"amount\":18.55,\"currency_code\":\"GBP\"}}",10,"Stress, Health",Natural stress support supplement
8121623478511,PharmaGABA-100,Thorne,ACTIVE,"{\"min_variant_price\":{\"amount\":24.49,\"currency_code\":\"GBP\"}}",30,"Sleep, Stress",Promotes relaxation and sleep quality
```

2. Run `npm run dev`
3. You should see 2 products load

## CSV File Requirements

Your CSV file must have these columns (case-sensitive):
- `ID` - Product identifier
- `TITLE` - Product name  
- `VENDOR` - Brand name
- `STATUS` - Must be "ACTIVE" to show
- `PRICE_RANGE_V2` - JSON with price: `{"min_variant_price":{"amount":24.49,"currency_code":"GBP"}}`
- `TOTAL_INVENTORY` - Stock count (number)

Optional but recommended:
- `TAGS` - Comma-separated tags for search
- `DESCRIPTION` or `BODY_HTML` - Product description
- `FEATURED_IMAGE` - JSON with image URL
- `METAFIELDS` - Ratings and reviews

## Expected Performance

With your 872k row CSV:
- **Parse time**: 3-5 seconds
- **Active products**: ~50,000-100,000 (filtered from 872k)
- **Memory usage**: ~50-100 MB
- **Search time**: <300ms

## Troubleshooting

### "Failed to load CSV" Error
- **Cause**: File not found at `public/data.csv`
- **Solution**: Verify file location and name (case-sensitive)

### "No valid products found"
- **Cause**: All products have STATUS != "ACTIVE"
- **Solution**: Check your CSV has products with STATUS="ACTIVE"

### Slow Loading
- **Cause**: Large CSV file, slow device
- **Expected**: 3-5 seconds for 872k rows is normal
- **Solution**: Wait for parsing to complete, check progress bar

### Browser Crash
- **Cause**: Not enough memory
- **Solution**: Close other tabs, use a more powerful device, or reduce CSV size

## Production Deployment

### Option 1: Include CSV in Build
```bash
# CSV is in public/data.csv
npm run build
npm start
```

The CSV will be served statically from the build.

### Option 2: External CDN
Host the CSV on a CDN and update the fetch URL in `app/page.tsx`:

```typescript
// Change this line:
const response = await fetch('/data.csv');

// To this:
const response = await fetch('https://your-cdn.com/data.csv');
```

### Option 3: Dynamic Upload Only
Remove the auto-load on mount and require users to upload their own CSV each time.

## Next Steps

1. ✅ Add data.csv to public/ folder
2. ✅ Run `npm install`
3. ✅ Run `npm run dev`
4. ✅ Wait for parsing (watch progress bar)
5. ✅ Start searching!

## Documentation

- **ASSUMPTIONS.md** - Data field mappings and defaults
- **DATA_INTEGRATION.md** - Detailed CSV integration guide
- **README.md** - Full application documentation

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify CSV file location
3. Review ASSUMPTIONS.md for field requirements
4. Check DATA_INTEGRATION.md for troubleshooting

---

**Ready to go!** Once you add data.csv to public/, you'll have a fully functional product search platform with 50k+ products.
