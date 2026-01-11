
/* global console, process */
/* generate-context.mjs
 * Compact AI-readable snapshot of the project
 * Sections start with @section; JSON is compacted and comment-free
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Project, SyntaxKind } from 'ts-morph';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const ROOT = process.cwd();
const CONTEXT_FILE = path.join(ROOT, 'context.txt');

// ------------------- Utilities -------------------
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
    const imported = await import(filePath);
    const cfg = imported.default || imported;
    if (typeof cfg !== 'object') throw new Error('Config not object');
    return JSON.stringify(cfg);
  } catch {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const ast = parse(raw, { sourceType: 'module', plugins: ['importMeta'] });
      let objExp = null;
      traverse(ast, {
        ExportDefaultDeclaration({ node }) {
          if (node.declaration.type === 'CallExpression') {
            for (const arg of node.declaration.arguments)
              if (arg.type === 'ObjectExpression') objExp = arg;
          } else if (node.declaration.type === 'ObjectExpression') {
            objExp = node.declaration;
          }
        }
      });
      if (!objExp) throw new Error('Cannot extract ESLint config');
      const convert = (obj) => {
        const result = {};
        for (const prop of obj.properties) {
          if (prop.type !== 'ObjectProperty') continue;
          const key = prop.key.name || prop.key.value;
          let value = null;
          switch (prop.value.type) {
            case 'StringLiteral': value = prop.value.value; break;
            case 'NumericLiteral': value = prop.value.value; break;
            case 'BooleanLiteral': value = prop.value.value; break;
            case 'ObjectExpression': value = convert(prop.value); break;
            case 'ArrayExpression': value = prop.value.elements.map(e => e.value); break;
            default: value = null;
          }
          result[key] = value;
        }
        return result;
      };
      return JSON.stringify(convert(objExp));
    } catch {
      return 'ERROR: Failed to extract eslint.config.mjs. Ask user to verify plain object export.';
    }
  }
};

// ------------------- Directory Tree -------------------
const buildDirTree = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = {};
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
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
    if (!rel.startsWith('src/')) return;

    const items = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
      .concat(sf.getDescendantsOfKind(SyntaxKind.MethodDeclaration))
      .concat(sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
        .map(v => v.getInitializerIfKind(SyntaxKind.ArrowFunction)).filter(Boolean));

    items.forEach(item => {
      const line = item.getStartLineNumber();
      const sym = item.getSymbol();
      let name;
      if (sym) name = sym.getName();
      else if (item.getKindName() === 'ArrowFunction') name = `arrow@${line}`;
      else name = `anon@${line}`;

      const calls = item.getDescendantsOfKind(SyntaxKind.CallExpression)
        .map(getCalleeSequence)
        .filter(Boolean);

      if (calls.length > 0 || /^[A-Z]/.test(name)) {
        nodes[`${rel}:${name}`] = {
          category: /^[A-Z]/.test(name) ? 'UI_COMPONENT' : 'ENGINE_LOGIC',
          calls
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
  } catch {
    return { commits: [] };
  }
};

// ------------------- TS Errors -------------------
const getTscErrors = () => {
  try {
    const raw = execSync('tsc --noEmit', { stdio: 'pipe' }).toString();
    return raw.trim() ? raw.split('\n').map(l => l.trim()).join('; ') : 'No errors';
  } catch (err) {
    return err.stdout?.toString()?.trim() || err.message;
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
  writeSection(fd, 'git-recent-commits', JSON.stringify(getRecentGitCommits()));
  writeSection(fd, 'tsc-errors', getTscErrors());

  if (fs.existsSync('README.md')) {
    const readme = fs.readFileSync('README.md', 'utf8');
    const head = readme.split('\n\n')[0];
    writeSection(fd, 'readme-head', head);
  }

  fs.closeSync(fd);
  console.log(`✅ AI context snapshot generated at ${CONTEXT_FILE}`);
};

run();
