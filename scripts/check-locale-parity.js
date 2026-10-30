import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../src/locales');
const enPath = path.join(localesDir, 'en.json');

const targetLocales = ['hi', 'es', 'fr', 'de', 'pt', 'ja', 'zh-CN', 'ar'];

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getKeys(value, fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

if (!fs.existsSync(enPath)) {
  console.error(`Base locale not found at: ${enPath}`);
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enKeys = new Set(getKeys(enData));

console.log(`[i18n-parity] Checking ${targetLocales.length} locales against English base (${enKeys.size} keys)...`);

let hasError = false;

for (const locale of targetLocales) {
  const filePath = path.join(localesDir, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Locale file missing: ${filePath}`);
    hasError = true;
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const localeKeys = new Set(getKeys(data));

  const missing = [...enKeys].filter((k) => !localeKeys.has(k));
  const extra = [...localeKeys].filter((k) => !enKeys.has(k));

  if (missing.length > 0) {
    console.error(`❌ Locale [${locale}] is MISSING ${missing.length} key(s):`);
    missing.forEach((k) => console.error(`   - ${k}`));
    hasError = true;
  }

  if (extra.length > 0) {
    console.warn(`⚠️ Locale [${locale}] has ${extra.length} unexpected EXTRA key(s):`);
    extra.forEach((k) => console.warn(`   + ${k}`));
  }

  if (missing.length === 0 && extra.length === 0) {
    console.log(`✅ Locale [${locale}]: 100% key parity (${localeKeys.size}/${enKeys.size})`);
  }
}

if (hasError) {
  console.error('\n❌ Locale key parity check FAILED.');
  process.exit(1);
} else {
  console.log('\n🎉 All locales have 100% complete key parity with en.json!\n');
}
