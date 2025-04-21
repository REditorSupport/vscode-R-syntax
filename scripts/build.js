#!/usr/bin/env node

import fs from 'fs';
import chokidar from 'chokidar'; // Use chokidar for more reliable watching
import path from 'path';
import { fileURLToPath } from 'url'; // Needed to resolve __dirname equivalent
import { convertYamlFileToJsonFile } from './yaml-to-json.js'; // Import the conversion function, ensure .js extension for ESM

// ESM equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the file pairs to process
const filePairs = [
  {
    yaml: path.resolve(__dirname, '..', 'syntaxes', 'r.yaml'),
    json: path.resolve(__dirname, '..', 'syntaxes', 'r.json'),
    name: 'R syntax'
  },
  {
    yaml: path.resolve(__dirname, '..', 'syntaxes', 'rmd.yaml'),
    json: path.resolve(__dirname, '..', 'syntaxes', 'rmd.json'),
    name: 'R Markdown syntax'
  }
];

// --- Main Script Logic ---

/**
 * Builds a single JSON file from its corresponding YAML file.
 * @param {string} yamlPath Absolute path to the YAML file.
 * @param {string} jsonPath Absolute path to the JSON file.
 * @param {string} name Descriptive name for logging.
 * @returns {boolean} True if successful, false otherwise.
 */
const buildFile = (yamlPath, jsonPath, name) => {
  console.log(`\nBuilding ${name}...`);
  if (!fs.existsSync(yamlPath)) {
    console.error(`Error: Input YAML file not found: ${yamlPath}`);
    return false;
  }
  const success = convertYamlFileToJsonFile(yamlPath, jsonPath);
  if (!success) {
    console.error(`Failed to build ${name} from ${path.relative(process.cwd(), yamlPath)}`);
  }
  return success;
};

// --- Initial Build ---
console.log('Starting initial build process...');
let initialBuildOk = true;
for (const pair of filePairs) {
  if (!buildFile(pair.yaml, pair.json, pair.name)) {
    initialBuildOk = false;
    // Decide if you want to stop the build entirely on first failure
    // process.exit(1);
  }
}

if (!initialBuildOk) {
  console.error('\nOne or more initial builds failed.');
  // Exit if any initial build fails and not watching
  if (!process.argv.includes('--watch')) {
    process.exit(1);
  }
} else {
  console.log('\nInitial build completed successfully.');
}


// Check for --watch flag
const watchFlag = process.argv.includes('--watch');

if (watchFlag) {
  const filesToWatch = filePairs.map(pair => pair.yaml);
  console.log(`\nWatching for changes in YAML files:`);
  filesToWatch.forEach(f => console.log(`  - ${path.relative(process.cwd(), f)}`));
  console.log('(Press Ctrl+C to stop)');

  const watcher = chokidar.watch(filesToWatch, { persistent: true, ignoreInitial: true });

  watcher.on('error', (error) => {
    console.error(`Watcher error: ${error}`);
    // Decide if you want to exit or try to recover
  });

  watcher.on('change', (changedPath) => {
    const absoluteChangedPath = path.resolve(changedPath); // Ensure absolute path
    console.log(`\nDetected change in ${path.relative(process.cwd(), absoluteChangedPath)}.`);
    // Find the corresponding pair and rebuild it
    const pairToBuild = filePairs.find(p => p.yaml === absoluteChangedPath);
    if (pairToBuild) {
      buildFile(pairToBuild.yaml, pairToBuild.json, pairToBuild.name);
    } else {
      console.warn(`Warning: Changed file ${absoluteChangedPath} not found in build pairs.`);
    }
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nStopping watcher...');
    watcher.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);  // Ctrl+C
  process.on('SIGTERM', shutdown); // Termination signal
} else {
  console.log('Build finished.');
}
