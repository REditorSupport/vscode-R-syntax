#!/usr/bin/env node

import fs from "fs";
import chokidar from "chokidar";
import { glob } from "tinyglobby";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url"; // Needed for __dirname equivalent

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// This will be populated dynamically later
let hardcodedGrammarFilePaths = [];
let globPatterns = [];
let watchFlag = false;
// --- Argument Parsing ---
const parseCliArgs = () => {
  const cliArgs = process.argv.slice(2);
  for (let i = 0; i < cliArgs.length; i++) {
    const arg = cliArgs[i];
    if (arg === '--watch') {
      watchFlag = true;
    } else {
      // Treat other arguments as glob patterns for test files
      globPatterns.push(arg);
    }
  }
  if (globPatterns.length === 0) {
    console.error("Error: Please provide at least one glob pattern for test files.");
    console.error(`Usage: node ${path.basename(__filename)} [--watch] "your/glob/pattern1" [...]`);
    process.exit(1);
  }
};

// Helper function to create a concise summary of grammars
const getGrammarSummary = (grammarFilePaths) => {
  const numGrammars = grammarFilePaths.length;
  if (numGrammars === 0) {
    return "no grammars";
  } else if (numGrammars === 1) {
    return `grammar: ${path.basename(grammarFilePaths[0])}`;
  } else if (numGrammars <= 3) { // Show names if 3 or fewer
    return `grammars: ${grammarFilePaths.map(p => path.basename(p)).join(", ")}`;
  } else {
    return `${numGrammars} grammars`;
  }
};

// Function to run tests (called by watcher)
const runTests = (event, filePath) => {
  const command = "npx";
  const grammarArgs = hardcodedGrammarFilePaths.flatMap(gPath => ["-g", gPath]);
  let testArgs;
  let targetDescription;

  if (filePath) {
    // filePath is absolute
    const relativeFilePath = path.relative(process.cwd(), filePath);
    console.log(
      `\nDetected ${event} in ${relativeFilePath}. Running tests for ${relativeFilePath}...`
    ); 
    testArgs = ["vscode-tmgrammar-test", ...grammarArgs, filePath];
    targetDescription = `tests for ${relativeFilePath}`;
  } else {
    // Run for all glob patterns
    console.log(`\nRunning tests for all patterns: ${globPatterns.join(", ")}...`);
    testArgs = ["vscode-tmgrammar-test", ...grammarArgs, ...globPatterns];
    targetDescription = `tests for patterns: ${globPatterns.join(", ")}`;
  }

  const isWindows = process.platform === "win32";
  const testProcess = spawn(command, testArgs, {
    stdio: "inherit",
    shell: isWindows,
  });

  testProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`\n${targetDescription} exited with code ${code}. Watching for next change...`);
    } else {
      console.log(`\n${targetDescription} completed successfully. Watching for next change...`);
    }
  });

  testProcess.on("error", (err) => {
    console.error(`\nFailed to start test command for ${targetDescription}: ${err.message}`);
    console.error('Make sure "vscode-tmgrammar-test" is installed (e.g., in node_modules) or accessible via npx.');
  });
};

// Function to run tests once and exit
const runTestsOnce = (patternsToTest) => {
  return new Promise((resolve, reject) => {
    const command = "npx";
    const grammarArgs = hardcodedGrammarFilePaths.flatMap(gPath => ["-g", gPath]);
    const args = ["vscode-tmgrammar-test", ...grammarArgs, ...patternsToTest];

    const targetDescription = `tests for patterns: ${patternsToTest.join(", ")}`;

    console.log(`\nRunning ${targetDescription}`);

    const isWindows = process.platform === "win32";

    const testProcess = spawn(command, args, {
      stdio: "inherit",
      shell: isWindows,
    });

    testProcess.on("close", (code) => {
      const exitCode = code === null ? 1 : code;
      if (exitCode !== 0) {
        console.error(`\n${targetDescription} exited with code ${exitCode}.`);
      } else {
        console.log(`\n${targetDescription} completed successfully.`);
      }
      resolve(exitCode);
    });

    testProcess.on("error", (err) => {
      console.error(`\nFailed to start test command for ${targetDescription}: ${err.message}`);
      console.error('Make sure "vscode-tmgrammar-test" is installed (e.g., in node_modules) or accessible via npx.');
      reject(err); // Reject the promise on spawn error
    });
  });
};

// Function to start the watcher
const startWatcher = async (patternsToWatch) => {
  try {
    const filesToWatch = await glob(patternsToWatch, {
      cwd: projectRoot,
      absolute: true,
      filesOnly: true,
    });

    if (filesToWatch.length === 0) {
      console.error(
        `Error: Glob patterns "${patternsToWatch.join(
          ", "
        )}" did not match any files in ${projectRoot}. No files to watch. Exiting.`
      );
      process.exit(1);
    }

    console.log(
      `Watching the following files resolved from patterns "${patternsToWatch.join(
        ", "
      )}":`
    );
    filesToWatch.forEach((f) =>
      console.log(`  - ${path.relative(process.cwd(), f)}`)
    );

    const watcher = chokidar.watch(filesToWatch, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on("change", (filePath) => runTests("change", path.resolve(filePath)))
      .on("unlink", (filePath) => runTests("unlink", path.resolve(filePath)))
      .on("error", (error) => console.error(`Watcher error: ${error}`))
      .on("ready", () => {
        console.log("\nInitial scan complete. Ready for changes.");
        console.log("Press Ctrl+C to stop watching.");
      });
  } catch (err) {
    console.error(`Error resolving glob pattern or starting watcher: ${err}`);
    process.exit(1);
  }
};

// --- Main Script Logic ---
(async () => {
  parseCliArgs(); // Parse arguments first

  // --- Dynamically find Grammar Files ---
  const grammarSearchPattern = path.join("tests", "testdata", "vscode-extensions", "**", "*.tmLanguage.json");
  console.log(`Searching for grammar files in: ${path.join(path.relative(process.cwd(), projectRoot), "tests", "testdata", "vscode-extensions")}`);
  try {
    const foundGrammarFiles = await glob(grammarSearchPattern, {
      cwd: projectRoot,
      absolute: true,
      filesOnly: true,
    });

    hardcodedGrammarFilePaths = foundGrammarFiles.filter(filePath => {
      // This fs.existsSync check is a bit redundant if glob works as expected,
      // but kept for explicit warning and safety.
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: Grammar file found by glob but does not exist: ${filePath}. It will be ignored.`);
        return false;
      }
      return true;
    });
  } catch (err) {
    console.error(`Error searching for grammar files: ${err.message}`);
    process.exit(1);
  }

  if (watchFlag) {
    console.log(`Watch mode enabled.`);
    console.log(`Resolving glob patterns for test files: ${globPatterns.join(", ")}`);
    runTests('initial scan', null);
    await startWatcher(globPatterns);
  } else {
    console.log(`Running tests once.`);
    console.log(`Using glob patterns for test files: ${globPatterns.join(", ")}`);
    try {
      const exitCode = await runTestsOnce(globPatterns);
      process.exit(exitCode);
    } catch (error) {
      // Error is already logged by runTestsOnce's 'error' handler
      process.exit(1); // Exit with failure if promise rejected
    }
  }
})();
