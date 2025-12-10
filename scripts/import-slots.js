/**
 * Slot Database Import Script
 * 
 * This script imports slots from slotDatabase.js into Supabase
 * 
 * Usage:
 * 1. Make sure you have the slotDatabase.js file in the correct location
 * 2. Update the SUPABASE_URL and SUPABASE_ANON_KEY below
 * 3. Run: node scripts/import-slots.js
 */

// You need to get these from your Supabase project settings
const SUPABASE_URL = 'https://rvzhwwhgasbdupsllqiu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2emh3d2hnYXNiZHVwc2xscWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTY5NDQsImV4cCI6MjA4MDg3Mjk0NH0.7BpL8MAbw48kpJCS57PlyaA2Iw7tg-YJwzhuH-hK2Gs';

// Import the slot database
const { slotDatabase } = require('../src/data/slotDatabase.js');

async function importSlots() {
  console.log('🎰 Starting slot import...');
  console.log(`📊 Total slots to import: ${slotDatabase.length}`);
  
  // Transform the data to match our database schema
  const slotsToImport = slotDatabase.map(slot => ({
    name: slot.name,
    provider: slot.provider,
    image: slot.image  // Note: The field is 'image' in your data, but 'image_url' in the database
  }));

  // We'll send data in batches of 500 to avoid request size limits
  const BATCH_SIZE = 500;
  const batches = [];
  
  for (let i = 0; i < slotsToImport.length; i += BATCH_SIZE) {
    batches.push(slotsToImport.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Split into ${batches.length} batches of up to ${BATCH_SIZE} slots each`);

  let totalImported = 0;
  let totalSkipped = 0;

  // Import each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n📤 Importing batch ${i + 1}/${batches.length} (${batch.length} slots)...`);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bulk_insert_slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          slots_data: batch
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Batch ${i + 1} failed:`, error);
        continue;
      }

      const result = await response.json();
      totalImported += result;
      totalSkipped += (batch.length - result);
      
      console.log(`✅ Batch ${i + 1} complete: ${result} new slots imported, ${batch.length - result} duplicates skipped`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Batch ${i + 1} error:`, error.message);
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('🎉 Import Complete!');
  console.log(`✅ Successfully imported: ${totalImported} slots`);
  console.log(`⏭️  Skipped (duplicates): ${totalSkipped} slots`);
  console.log(`📊 Total processed: ${totalImported + totalSkipped} slots`);
  console.log('═══════════════════════════════════════════\n');
}

// Run the import
importSlots().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
