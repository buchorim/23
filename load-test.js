/**
 * Load Test Script untuk Easy.Store
 * Gunakan untuk test Traffic Surge Protection
 * 
 * Jalankan: node load-test.js
 */

const TARGET_URL = 'https://easystore-rho.vercel.app/';
const TOTAL_REQUESTS = 3000;        // Total request yang akan dikirim
const CONCURRENT_BATCH = 200;       // Request per batch (concurrent)
const DELAY_BETWEEN_BATCH_MS = 100; // Delay antar batch (ms)

// Stats
let successCount = 0;
let errorCount = 0;
let blockedCount = 0; // 503/429 responses
const responseTimes = [];

async function sendRequest(id) {
    const start = Date.now();
    try {
        const response = await fetch(TARGET_URL, {
            method: 'GET',
            headers: {
                'User-Agent': `LoadTest-Bot/${id}`,
            },
        });

        // Simulate 3 second stay time
        await new Promise(resolve => setTimeout(resolve, 3000));

        const elapsed = Date.now() - start;
        responseTimes.push(elapsed);

        if (response.status === 503 || response.status === 429) {
            blockedCount++;
            console.log(`[${id}] ⛔ BLOCKED (${response.status}) - ${elapsed}ms`);
        } else if (response.ok) {
            successCount++;
            console.log(`[${id}] ✅ OK (${response.status}) - ${elapsed}ms`);
        } else {
            errorCount++;
            console.log(`[${id}] ⚠️ ERROR (${response.status}) - ${elapsed}ms`);
        }

        return response.status;
    } catch (error) {
        errorCount++;
        console.log(`[${id}] ❌ FAILED - ${error.message}`);
        return 0;
    }
}

async function runBatch(startId, count) {
    const promises = [];
    for (let i = 0; i < count; i++) {
        promises.push(sendRequest(startId + i));
    }
    await Promise.all(promises);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('='.repeat(50));
    console.log('🚀 LOAD TEST - Easy.Store Traffic Protection');
    console.log('='.repeat(50));
    console.log(`Target: ${TARGET_URL}`);
    console.log(`Total requests: ${TOTAL_REQUESTS}`);
    console.log(`Concurrent per batch: ${CONCURRENT_BATCH}`);
    console.log(`Delay between batches: ${DELAY_BETWEEN_BATCH_MS}ms`);
    console.log('='.repeat(50));
    console.log('');

    const startTime = Date.now();
    let currentId = 1;

    while (currentId <= TOTAL_REQUESTS) {
        const batchSize = Math.min(CONCURRENT_BATCH, TOTAL_REQUESTS - currentId + 1);
        console.log(`\n📦 Batch ${Math.ceil(currentId / CONCURRENT_BATCH)} - Sending ${batchSize} requests...`);

        await runBatch(currentId, batchSize);
        currentId += batchSize;

        if (currentId <= TOTAL_REQUESTS) {
            await sleep(DELAY_BETWEEN_BATCH_MS);
        }
    }

    const totalTime = Date.now() - startTime;
    const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

    console.log('');
    console.log('='.repeat(50));
    console.log('📊 RESULTS');
    console.log('='.repeat(50));
    console.log(`Total time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`Requests/sec: ${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)}`);
    console.log(`Avg response time: ${avgResponseTime}ms`);
    console.log('');
    console.log(`✅ Success: ${successCount}`);
    console.log(`⛔ Blocked (503/429): ${blockedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('');

    if (blockedCount > 0) {
        console.log('🛡️ Traffic Protection is WORKING!');
        console.log(`   ${blockedCount} requests were blocked by surge protection.`);
    } else {
        console.log('⚠️ No requests were blocked.');
        console.log('   Traffic protection might not be triggered yet.');
        console.log('   Try increasing TOTAL_REQUESTS or CONCURRENT_BATCH.');
    }
    console.log('='.repeat(50));
}

// Run
main().catch(console.error);
