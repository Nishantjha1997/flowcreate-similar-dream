import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const root = join(process.cwd(), 'supabase', 'functions');
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (entry.name.endsWith('.ts')) files.push(filePath);
  }
}

walk(root);
const errors = [];
for (const filePath of files) {
  const result = ts.transpileModule(readFileSync(filePath, 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
    reportDiagnostics: true,
  });
  for (const diagnostic of result.diagnostics ?? []) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    errors.push(`${relative(process.cwd(), filePath)}: ${message}`);
  }
}

if (errors.length) {
  console.error(`Edge function syntax check failed (${errors.length} issue(s)):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Edge function syntax check passed (${files.length} TypeScript files).`);
}
