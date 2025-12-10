# Slot Database Import Guide

You have **TWO OPTIONS** to import your 4400+ slots into Supabase:

## Option 1: Use WebMod Import Feature (EASIEST) ⭐

1. **Go to your website** → Login as admin → WebMod → Slot DB tab
2. **Click "📥 Import Database"** button
3. **Copy this exact JSON** from `src/data/slotDatabase.js` - but you need to convert it to JSON format
4. **Paste and import**

However, since your data is in JavaScript format, you need to convert it first.

## Option 2: Use the Import Script (RECOMMENDED)

### Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (the JWT token)

### Step 2: Update the Script

Open `scripts/import-slots.js` and replace:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### Step 3: Run the Import

```bash
cd "c:\Users\oseca\Desktop\Website definitivo"
node scripts/import-slots.js
```

### What It Does:

- ✅ Imports all 4400+ slots automatically
- ✅ Handles duplicates (skips existing slots)
- ✅ Processes in batches of 500 to avoid timeouts
- ✅ Shows progress and statistics
- ✅ No need to copy/paste large JSON files

### Expected Output:

```
🎰 Starting slot import...
📊 Total slots to import: 4436
📦 Split into 9 batches of up to 500 slots each

📤 Importing batch 1/9 (500 slots)...
✅ Batch 1 complete: 500 new slots imported, 0 duplicates skipped

...

🎉 Import Complete!
✅ Successfully imported: 4436 slots
⏭️  Skipped (duplicates): 0 slots
📊 Total processed: 4436 slots
```

## Verify the Import

1. Refresh your WebMod → Slot DB page
2. You should see stats update:
   - **Total Slots**: 4436
   - **Providers**: 5-10 different providers
3. Use the search and filter to browse your slots

## Troubleshooting

**Error: "Cannot find module"**
- Make sure you run `npm install` first

**Error: "401 Unauthorized"**
- Double-check your Supabase credentials in the script

**Error: "Function not found"**
- Make sure you ran the SQL schema in Supabase first
- File: `sql/slot_database_functions.sql`

## Note

Your slot data has **image URLs** already included, so no bucket setup is needed. The images will load directly from the URLs in your database.
