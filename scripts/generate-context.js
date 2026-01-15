/* global console, process */
/* generate-context.mjs
 * Compact AI-readable snapshot of the project
 * Sections start with @section; JSON is compacted and comment-free
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const CONTEXT_FILE = path.join(ROOT, 'context.txt');

// ------------------- Bootstrapper -------------------
const ensureDeps = () => {
  try {
    require.resolve('ts-morph');
    require.resolve('@babel/parser');
    require.resolve('@babel/traverse');
  } catch {
    console.log("🛡️  Snapshot: Bootstrapping environment (installing ts-morph, babel)...");
    execSync('npm install ts-morph @babel/parser @babel/traverse --no-save', { stdio: 'inherit' });
  }
};

ensureDeps();
const { Project, SyntaxKind } = require('ts-morph');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// ------------------- Utilities -------------------
const getCircularDeps = () => {
  try {
    // We run madge and capture the JSON output for cleaner parsing
    const output = execSync('npx madge --circular --json --extensions ts ./src').toString();
    const circular = JSON.parse(output);
    return {
      count: circular.length,
      dependencies: circular,
      status: circular.length === 0 ? "PASSED" : "FAILED"
    };
  } catch (err) {
    return { status: "ERROR", message: err.message };
  }
};

const writeSection = (fd, section, content) => {
  fs.writeSync(fd, `@section ${section}\n${content}\n`);
};

const loadJsonClean = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const clean = raw
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m)
    .replace(/,(?=\s*[}\]])/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  return JSON.parse(clean);
};

// ------------------- ESLint Config Loader -------------------
const loadEslintConfig = async (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    const imported = await import(`file://${absolutePath}?update=${Date.now()}`);
    const cfg = imported.default || imported;
    return JSON.stringify(cfg, (_key, value) => typeof value === 'function' ? '[Function]' : value);
  } catch {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const ast = parse(raw, { sourceType: 'module', plugins: ['importMeta'] });
      let extracted = "COULD_NOT_SERIALIZE";
      traverse(ast, {
        ExportDefaultDeclaration(p) {
          extracted = raw.substring(p.node.start, p.node.end);
        }
      });
      return extracted;
    } catch {
      return 'ERROR: Failed to extract eslint.config.mjs.';
    }
  }
};

// ------------------- Directory Tree -------------------
const buildDirTree = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = {};
  const files = [];
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) dirs[entry.name] = buildDirTree(fullPath);
    else files.push(entry.name);
  }
  return { dirs, files };
};

// ------------------- Function Graph -------------------
const project = new Project({ tsConfigFilePath: './tsconfig.json' });

const getCalleeSequence = (callExpr) => {
  const seq = [];
  let expr = callExpr.getExpression();
  while (expr) {
    if (expr.getText) seq.unshift(expr.getText());
    if (expr.getKindName() === 'PropertyAccessExpression') expr = expr.getExpression();
    else break;
  }
  return seq.join(' → ');
};

const getLogicNodes = () => {
  const nodes = {};
  project.getSourceFiles().forEach(sf => {
    const rel = path.relative(ROOT, sf.getFilePath());
    if (!rel.startsWith('src/') || rel.includes('.test.') || rel.includes('src/test/')) return;

    const items = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
      .concat(sf.getDescendantsOfKind(SyntaxKind.MethodDeclaration))
      .concat(sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
        .map(v => v.getInitializerIfKind(SyntaxKind.ArrowFunction)).filter(Boolean));

    items.forEach(item => {
      const line = item.getStartLineNumber(); // Extract line number
      const sym = item.getSymbol();

      // Assign name or fallback to type
      let name = sym ? sym.getName() : (item.getKindName() === 'ArrowFunction' ? `arrow` : `anon`);

      // NEW KEY FORMAT: file/path.ts:functionName@lineNumber
      const key = `${rel}:${name}@${line}`;

      const calls = item.getDescendantsOfKind(SyntaxKind.CallExpression)
        .map(getCalleeSequence)
        .filter(Boolean);

      if (calls.length > 0 || /^[A-Z]/.test(name)) {
        nodes[key] = {
          category: /^[A-Z]/.test(name) ? 'UI_COMPONENT' : 'ENGINE_LOGIC',
          calls: [...new Set(calls)]
        };
      }
    });
  });
  return nodes;
};

// ------------------- Git Commits -------------------
const getRecentGitCommits = () => {
  try {
    const raw = execSync('git log -n 10 --pretty=format:"%H%x1f%an%x1f%ad%x1f%s" --date=iso').toString();
    return {
      commits: raw.split('\n').map(line => {
        const [hash, author, date, message] = line.split('\x1f');
        return { hash, author, date, message };
      })
    };
  } catch { return { commits: [] }; }
};

// ------------------- TS Errors -------------------
const getTscErrors = () => {
  try {
    const raw = execSync('npx tsc --noEmit', { stdio: 'pipe' }).toString();
    return raw.trim() ? raw.split('\n').map(l => l.trim()).join('; ') : 'No errors';
  } catch (err) {
    return err.stdout?.toString()?.trim() || err.message;
  }
};
//
// ------------------- Test Insights -------------------
const getTestInsights = () => {
  try {
    // Run vitest to generate the report if it doesn't exist
    execSync('npm run test:json', { stdio: 'ignore' });
    const report = loadJsonClean('./test-results.json');

    // Map results to a readable behavioral summary
    const behaviorMap = report.testResults.map(file => ({
      file: path.relative(ROOT, file.name),
      status: file.status,
      assertions: file.assertionResults.map(res => ({
        behavior: res.ancestorTitles.join(' > ') + ' → ' + res.title,
        passed: res.status === 'passed'
      }))
    }));

    return {
      summary: {
        total: report.numTotalTests,
        passed: report.numPassedTests,
        failed: report.numFailedTests
      },
      behaviors: behaviorMap
    };
  } catch {
    return { status: "ERROR", message: "Ensure vitest is configured with JSON reporter." };
  }
};

// ------------------- Main -------------------
const run = async () => {
  const fd = fs.openSync(CONTEXT_FILE, 'w');
  fs.writeSync(fd, `// PURPOSE\n// Compact AI-readable snapshot of the project.\n`);
  fs.writeSync(fd, `// USAGE\n// - Sections start with @section\n// - Payload follows immediately\n// - JSON is compacted and comment-free\n`);
  fs.writeSync(fd, `// REGENERATION\n// Generated automatically. Do not edit.\n\n`);

  writeSection(fd, 'guidelines', 'This snapshot represents the current state of the project for AI-assisted analysis.\nJSON sections are compacted and lossy by design.\nMissing information should be inferred cautiously.');
  writeSection(fd, 'config.package-json', JSON.stringify(loadJsonClean('./package.json')));
  writeSection(fd, 'config.tsconfig', JSON.stringify(loadJsonClean('./tsconfig.json')));
  writeSection(fd, 'config.tsconfig-node', JSON.stringify(loadJsonClean('./tsconfig.node.json')));
  writeSection(fd, 'config.eslint', await loadEslintConfig('./eslint.config.mjs'));
  writeSection(fd, 'directory-tree', JSON.stringify(buildDirTree(ROOT)));
  writeSection(fd, 'function-graph', JSON.stringify(getLogicNodes()));
  writeSection(fd, 'test-behavior-map', JSON.stringify(getTestInsights()));
  writeSection(fd, 'config.circular-deps', JSON.stringify(getCircularDeps()));
  writeSection(fd, 'git-recent-commits', JSON.stringify(getRecentGitCommits()));
  writeSection(fd, 'tsc-errors', getTscErrors());

  const readme = fs.readFileSync('README.md', 'utf8');
  writeSection(fd, 'readme-head', readme.split('\n\n')[0]);

  fs.closeSync(fd);
  console.log(`✅ AI context snapshot generated at ${CONTEXT_FILE}`);
};

run();
