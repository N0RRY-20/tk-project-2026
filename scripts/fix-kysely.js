/**
 * fix-kysely.js
 * 
 * Patches @better-auth/kysely-adapter .mjs files that import
 * DEFAULT_MIGRATION_TABLE and DEFAULT_MIGRATION_LOCK_TABLE from "kysely".
 * 
 * In kysely 0.29.x these constants no longer exist in the main entry point,
 * causing Turbopack (Next.js 16) to fail with strict static analysis errors.
 * 
 * This script replaces the broken imports with inline constant definitions.
 */
const fs = require('fs');
const path = require('path');

const adapterDir = path.join(
  __dirname, '..', 'node_modules', 'better-auth', 'node_modules',
  '@better-auth', 'kysely-adapter', 'dist'
);

const filesToPatch = [
  'bun-sqlite-dialect-DzNwOpKv.mjs',
  'd1-sqlite-dialect-C2B7YsIT.mjs',
  'node-sqlite-dialect.mjs',
];

// The actual string values of these constants (same across all kysely versions)
const MIGRATION_TABLE = 'kysely_migration';
const MIGRATION_LOCK_TABLE = 'kysely_migration_lock';

let patchedCount = 0;

for (const file of filesToPatch) {
  const filePath = path.join(adapterDir, file);
  
  if (!fs.existsSync(filePath)) {
    // Try to find files with different hashes (the hash in filename may change)
    const prefix = file.split('-')[0]; // e.g. "bun" or "d1" or "node"
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already patched
  if (content.includes('/* PATCHED */')) {
    console.log(`  ✓ ${file} — already patched`);
    continue;
  }
  
  // Pattern 1: All imports on one line from "kysely"
  // e.g. import { CompiledQuery, DEFAULT_MIGRATION_LOCK_TABLE, DEFAULT_MIGRATION_TABLE, DefaultQueryCompiler, sql } from "kysely";
  // Pattern 2: Separate import from "kysely/migration"  
  // e.g. import { DEFAULT_MIGRATION_LOCK_TABLE, DEFAULT_MIGRATION_TABLE } from "kysely/migration";
  
  // Remove DEFAULT_MIGRATION_LOCK_TABLE and DEFAULT_MIGRATION_TABLE from any import statement
  content = content.replace(
    /import\s*\{([^}]*)\}\s*from\s*"kysely(?:\/migration)?"\s*;/g,
    (match, imports) => {
      const importList = imports.split(',').map(s => s.trim()).filter(Boolean);
      const remaining = importList.filter(
        i => i !== 'DEFAULT_MIGRATION_LOCK_TABLE' && i !== 'DEFAULT_MIGRATION_TABLE'
      );
      
      if (remaining.length === importList.length) {
        // Nothing to remove from this import
        return match;
      }
      
      if (remaining.length === 0) {
        // All imports were the migration constants — replace entire line with inline defs
        return `/* PATCHED */ const DEFAULT_MIGRATION_TABLE = "${MIGRATION_TABLE}"; const DEFAULT_MIGRATION_LOCK_TABLE = "${MIGRATION_LOCK_TABLE}";`;
      }
      
      // Some imports remain — keep them and add inline defs
      return `import { ${remaining.join(', ')} } from "kysely";\n/* PATCHED */ const DEFAULT_MIGRATION_TABLE = "${MIGRATION_TABLE}"; const DEFAULT_MIGRATION_LOCK_TABLE = "${MIGRATION_LOCK_TABLE}";`;
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  patchedCount++;
  console.log(`  ✓ ${file} — patched`);
}

// Also try to find any .mjs files with different hash names
if (fs.existsSync(adapterDir)) {
  const allFiles = fs.readdirSync(adapterDir).filter(f => f.endsWith('.mjs'));
  for (const file of allFiles) {
    if (filesToPatch.includes(file)) continue;
    
    const filePath = path.join(adapterDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('DEFAULT_MIGRATION_LOCK_TABLE') || content.includes('DEFAULT_MIGRATION_TABLE')) {
      if (content.includes('/* PATCHED */')) {
        console.log(`  ✓ ${file} — already patched`);
        continue;
      }
      
      content = content.replace(
        /import\s*\{([^}]*)\}\s*from\s*"kysely(?:\/migration)?"\s*;/g,
        (match, imports) => {
          const importList = imports.split(',').map(s => s.trim()).filter(Boolean);
          const remaining = importList.filter(
            i => i !== 'DEFAULT_MIGRATION_LOCK_TABLE' && i !== 'DEFAULT_MIGRATION_TABLE'
          );
          
          if (remaining.length === importList.length) return match;
          
          if (remaining.length === 0) {
            return `/* PATCHED */ const DEFAULT_MIGRATION_TABLE = "${MIGRATION_TABLE}"; const DEFAULT_MIGRATION_LOCK_TABLE = "${MIGRATION_LOCK_TABLE}";`;
          }
          
          return `import { ${remaining.join(', ')} } from "kysely";\n/* PATCHED */ const DEFAULT_MIGRATION_TABLE = "${MIGRATION_TABLE}"; const DEFAULT_MIGRATION_LOCK_TABLE = "${MIGRATION_LOCK_TABLE}";`;
        }
      );
      
      fs.writeFileSync(filePath, content, 'utf8');
      patchedCount++;
      console.log(`  ✓ ${file} — patched (dynamic find)`);
    }
  }
}

if (patchedCount > 0) {
  console.log(`\n✓ Patched ${patchedCount} file(s) in @better-auth/kysely-adapter`);
} else {
  console.log('✓ All adapter files already patched or not found');
}
