/**
 * HERRAMIENTA DE DEOBFUSCACIÓN
 * Genera mappings de variables para refactorización segura
 *
 * USO:
 * node tools/deobfuscate.js --analyze js/libs1.js
 * node tools/deobfuscate.js --generate-map
 */

const fs = require('fs');
const path = require('path');

class DeobfuscationTool {
  constructor() {
    this.variableMap = {};
    this.functionContexts = {};
  }

  /**
   * Analizar archivo y extraer variables ofuscadas
   */
  analyzeFile(filePath) {
    console.log(`📊 Analizando ${filePath}...`);

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const patterns = {
      // Detectar funciones con parámetros p*
      paramPattern: /function\s+(\w+)\s*\(\s*(p\d+)\s*\)/g,
      // Detectar Promise callbacks (p8, p9) = (resolve, reject)
      promisePattern: /new\s+Promise\s*\(\s*async\s*\(\s*(p\d+)\s*,\s*(p\d+)\s*\)\s*=>/g,
      // Detectar variables locales v*
      varPattern: /const\s+(v\d+|vLS|vLN\d+|vO\d+)\s*=/g,
      // Detectar map/filter callbacks
      callbackPattern: /\.\s*(map|filter)\s*\(\s*(p\d+)\s*=>/g
    };

    let matches = [];

    // Encontrar funciones
    let match;
    while ((match = patterns.paramPattern.exec(content)) !== null) {
      matches.push({
        type: 'function',
        name: match[1],
        param: match[2],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    // Encontrar promises
    patterns.promisePattern.lastIndex = 0;
    while ((match = patterns.promisePattern.exec(content)) !== null) {
      matches.push({
        type: 'promise',
        resolve: match[1],
        reject: match[2],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    // Encontrar variables
    patterns.varPattern.lastIndex = 0;
    while ((match = patterns.varPattern.exec(content)) !== null) {
      matches.push({
        type: 'variable',
        name: match[1],
        line: content.substring(0, match.index).split('\n').length
      });
    }

    return matches;
  }

  /**
   * Generar recomendaciones de renombramiento
   */
  generateRecommendations(analysisResults) {
    console.log('\n💡 RECOMENDACIONES DE RENOMBRAMIENTO:\n');

    const grouped = {
      promises: [],
      variables: [],
      callbacks: []
    };

    analysisResults.forEach(result => {
      if (result.type === 'promise') {
        grouped.promises.push(result);
      } else if (result.type === 'variable') {
        grouped.variables.push(result);
      }
    });

    // Agrupar promises
    console.log('🔄 PROMISE CALLBACKS:');
    grouped.promises.slice(0, 10).forEach(p => {
      console.log(`  ${p.resolve} → resolve (línea ${p.line})`);
      console.log(`  ${p.reject} → reject (línea ${p.line})`);
    });

    // Agrupar variables
    console.log('\n📝 VARIABLES LOCALES:');
    grouped.variables.slice(0, 15).forEach(v => {
      console.log(`  ${v.name} (línea ${v.line})`);
    });

    console.log(`\n✅ Total variables encontradas: ${analysisResults.length}`);
  }

  /**
   * Crear un plan de refactorización
   */
  createRefactoringPlan(filePath) {
    const fileName = path.basename(filePath);
    const analysis = this.analyzeFile(filePath);

    const plan = {
      file: fileName,
      totalVariables: analysis.length,
      priorities: {
        critical: analysis.filter(a => a.type === 'promise').length,
        important: analysis.filter(a => a.type === 'variable').length,
        helper: analysis.filter(a => a.type === 'callback').length
      },
      steps: [
        `1. Hacer backup: cp ${fileName} ${fileName}.backup`,
        `2. Abrir en IDE (VS Code/WebStorm)`,
        `3. Usar Find & Replace con Regex`,
        `4. Cambiar p* → nombres contexto-específicos`,
        `5. Cambiar v* → nombres descripción-específicos`,
        `6. Formatear con Prettier`,
        `7. Validar sintaxis: eslint ${fileName}`,
        `8. Commit: git add ${fileName} && git commit -m "Refactor: Deobfuscate ${fileName}"`
      ]
    };

    return plan;
  }

  /**
   * Generar búsqueda & reemplazo para VSCode
   */
  generateVSCodeSearch() {
    const searches = [
      {
        name: 'Promise Resolves',
        pattern: '\\bp8\\b',
        replacement: 'resolve',
        files: 'js/libs*.js'
      },
      {
        name: 'Promise Rejects',
        pattern: '\\bp9\\b',
        replacement: 'reject',
        files: 'js/libs*.js'
      },
      {
        name: 'Fetch Responses',
        pattern: '\\bv12\\b',
        replacement: 'response',
        files: 'js/libs*.js',
        caution: 'Verificar contexto - puede representar diferentes datos'
      },
      {
        name: 'Token Values',
        pattern: '\\bv20\\b',
        replacement: 'accessTokens',
        files: 'js/libs*.js'
      }
    ];

    console.log('\n🔍 BÚSQUEDAS PARA VSCODE:\n');
    searches.forEach(s => {
      console.log(`${s.name}:`);
      console.log(`  Find:    ${s.pattern}`);
      console.log(`  Replace: ${s.replacement}`);
      console.log(`  Files:   ${s.files}`);
      if (s.caution) console.log(`  ⚠️  ${s.caution}`);
      console.log();
    });

    return searches;
  }
}

// Main CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const tool = new DeobfuscationTool();

  if (args[0] === '--analyze' && args[1]) {
    const results = tool.analyzeFile(args[1]);
    tool.generateRecommendations(results);
  } else if (args[0] === '--plan' && args[1]) {
    const plan = tool.createRefactoringPlan(args[1]);
    console.log('\n📋 PLAN DE REFACTORIZACIÓN:\n');
    console.log(JSON.stringify(plan, null, 2));
  } else if (args[0] === '--vscode') {
    tool.generateVSCodeSearch();
  } else {
    console.log(`
🛠️  DEOBFUSCATION TOOL

USO:
  node tools/deobfuscate.js --analyze <archivo>    # Analizar archivo
  node tools/deobfuscate.js --plan <archivo>       # Generar plan
  node tools/deobfuscate.js --vscode               # Generar búsquedas VSCode

EJEMPLOS:
  node tools/deobfuscate.js --analyze js/libs1.js
  node tools/deobfuscate.js --plan js/libs1.js
  node tools/deobfuscate.js --vscode
    `);
  }
}

module.exports = DeobfuscationTool;
