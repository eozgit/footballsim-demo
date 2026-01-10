import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// --- INDUSTRIAL GRADE CONFIG LOADER ---
const loadConfig = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  // Strip ALL comments, trailing commas, and control characters
  const clean = raw
    .replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m)
    .replace(/,(?=\s*[}\]])/g, "")
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  return JSON.parse(clean);
};

let tsMorph;
try {
  tsMorph = require('ts-morph');
} catch (e) {
  console.log("🛡️  X-Ray: Bootstrapping environment...");
  execSync('npm install ts-morph --no-save', { stdio: 'inherit' });
  tsMorph = require('ts-morph');
}

const { Project, SyntaxKind } = tsMorph;
const project = new Project({ tsConfigFilePath: './tsconfig.json' });

const getSnapshot = () => {
  console.log('--- 📋 Infrastructure Scan ---');
  const pkg = loadConfig('./package.json');
  const tsconfig = loadConfig('./tsconfig.json');

  return {
    timestamp: new Date().toISOString(),
    health: {
      tsc: (() => { try { execSync('npm run type-check'); return "OK"; } catch (e) { return "ERRORS"; } })()
    },
    hardening: {
      strict: tsconfig.compilerOptions.strict,
      noImplicitAny: tsconfig.compilerOptions.noImplicitAny,
      react: pkg.dependencies.react
    }
  };
};

const getLogicNodes = () => {
  console.log('--- 🧠 Mapping Simulation Nervous System ---');
  const nodes = {};

  project.getSourceFiles().forEach(sf => {
    const relPath = path.relative(process.cwd(), sf.getFilePath());
    if (relPath.includes('node_modules') || relPath.includes('scripts')) return;

    // Analyze all functions and class methods
    const items = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)
      .concat(sf.getDescendantsOfKind(SyntaxKind.MethodDeclaration))
      .concat(sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
        .map(v => v.getInitializerIfKind(SyntaxKind.ArrowFunction)).filter(Boolean));

    items.forEach(item => {
      const name = item.getSymbol()?.getName() || 'anon';

      // Trace EventBus and Zustand usage
      const logicCalls = item.getDescendantsOfKind(SyntaxKind.CallExpression)
        .map(c => c.getExpression().getText())
        .filter(t => t.includes('EventBus') || t.includes('useSimulationStore'));

      if (logicCalls.length > 0 || /^[A-Z]/.test(name)) {
        nodes[`${relPath}:${name}`] = {
          category: /^[A-Z]/.test(name) ? 'UI_COMPONENT' : 'ENGINE_LOGIC',
          signals: Array.from(new Set(logicCalls))
        };
      }
    });
  });
  return nodes;
};

const run = () => {
  try {
    const data = { infrastructure: getSnapshot(), simulation_nodes: getLogicNodes() };
    fs.writeFileSync('project-xray.json', JSON.stringify(data, null, 2));
    console.log('✅ X-Ray document generated: project-xray.json');
  } catch (err) {
    console.error('❌ X-Ray Failed:', err.message);
  }
};

run();