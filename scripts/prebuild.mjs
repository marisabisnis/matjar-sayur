/**
 * Prebuild Script — Fetch data from Google Apps Script
 * 
 * Usage: node scripts/prebuild.mjs
 * 
 * Reads GAS_URL from .env.local and fetches all data,
 * then writes JSON files to public/data/
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'public', 'data');

// Load GAS URL — check process.env first (Vercel), then .env.local (local dev)
function loadEnv() {
    // On Vercel, env vars are injected into process.env directly
    if (process.env.NEXT_PUBLIC_GAS_URL) {
        console.log('  ✅ Found GAS URL from process.env (Vercel)');
        return process.env.NEXT_PUBLIC_GAS_URL;
    }

    console.log('  ⚠️  NEXT_PUBLIC_GAS_URL not in process.env, checking .env.local...');

    // Local dev: read from .env.local file
    const envPath = resolve(ROOT, '.env.local');
    if (!existsSync(envPath)) {
        console.warn('  ❌ .env.local not found and NEXT_PUBLIC_GAS_URL not set.');
        return null;
    }
    console.log('  ✅ Found GAS URL from .env.local');
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/NEXT_PUBLIC_GAS_URL\s*=\s*(.+)/);
    return match ? match[1].trim() : null;
}

async function fetchEndpoint(baseUrl, action) {
    const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
    const url = `${cleanUrl}?action=${action}`;
    console.log(`  📡 Fetching ${action}...`);
    console.log(`  🔗 Full URL: ${url}`);
    console.log(`  🔗 URL length: ${url.length}`);

    const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '(no body)');
        console.error(`  ❌ Status: ${res.status} ${res.statusText}`);
        console.error(`  ❌ Final URL: ${res.url}`);
        console.error(`  ❌ Response body: ${body.substring(0, 500)}`);
        throw new Error(`Failed to fetch ${action}: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
}

function writeData(filename, data) {
    const path = resolve(DATA_DIR, filename);
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
    console.log(`  ✅ ${filename} → ${count} items`);
}

async function main() {
    console.log('\n🥬 Matjar Sayur — Prebuild Data Fetch\n');

    const gasUrl = loadEnv();

    if (!gasUrl) {
        console.log('ℹ️  Skipping fetch — using existing JSON files in public/data/');
        console.log('   To enable: create .env.local with NEXT_PUBLIC_GAS_URL=<your GAS URL>\n');
        process.exit(0);
    }

    console.log(`📎 GAS URL: ${gasUrl.substring(0, 50)}...`);

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }

    try {
        // Fetch all data in one request
        const all = await fetchEndpoint(gasUrl, 'all');

        if (all.products) {
            writeData('products.json', all.products);
        }
        if (all.categories) {
            writeData('categories.json', all.categories);
        }
        if (all.stores) {
            writeData('stores.json', all.stores);
        }
        if (all.payments) {
            writeData('payments.json', all.payments);
        }
        if (all.sliders) {
            writeData('sliders.json', all.sliders);
        }
        if (all.coupons) {
            writeData('coupons.json', all.coupons);
        }

        console.log('\n✅ Prebuild complete!\n');
    } catch (err) {
        console.error(`\n❌ Prebuild failed: ${err.message}`);
        console.error('   Falling back to existing local data.\n');
        process.exit(0); // Don't fail the build
    }
}

main();
