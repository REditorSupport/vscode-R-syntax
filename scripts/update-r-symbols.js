#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import YAML from 'yaml'; // eemeli/yaml v2+ for comment preservation
import { fileURLToPath } from 'url';

// ESM equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths based on your project structure
const projectRoot = path.resolve(__dirname, '..');
const rYamlPath = path.join(projectRoot, 'syntaxes', 'r.yaml');
const getSymbolsScriptPath = path.join(__dirname, 'get-symbols.R'); // Assumes get-symbols.R is in the same directory

// Namespaces to update and their corresponding keys in the r.yaml variables section
const namespacesToUpdate = {
    'base': 'base_symbols',
    'graphics': 'graphics_symbols',
    'grDevices': 'gr_devices_symbols',
    'methods': 'methods_symbols',
    'stats': 'stats_symbols',
    'utils': 'utils_symbols'
};

function updateRSymbols() {
    console.log(`Reading R syntax file from: ${rYamlPath}`);
    let rYamlContent;
    try {
        rYamlContent = fs.readFileSync(rYamlPath, 'utf8');
    } catch (error) {
        console.error(`Error reading ${rYamlPath}: ${error.message}`);
        process.exit(1);
    }

    let rSyntaxDoc;
    try {
        rSyntaxDoc = YAML.parseDocument(rYamlContent);

        if (rSyntaxDoc.errors.length > 0) {
            const parseErrors = rSyntaxDoc.errors.filter(e => e.name === 'YAMLParseError');
            const warnings = rSyntaxDoc.errors.filter(e => e.name === 'YAMLWarning');

            if (warnings.length > 0) {
                console.warn(`YAML parsing warnings in ${rYamlPath}:`);
                warnings.forEach(warn => {
                    const line = warn.linePos?.[0]?.line ?? 'N/A';
                    const col = warn.linePos?.[0]?.col ?? 'N/A';
                    console.warn(`- ${warn.message} (Line: ${line}, Col: ${col})`);
                });
            }
            if (parseErrors.length > 0) {
                console.error(`YAML parsing errors in ${rYamlPath}:`);
                parseErrors.forEach(err => {
                    const line = err.linePos?.[0]?.line ?? 'N/A';
                    const col = err.linePos?.[0]?.col ?? 'N/A';
                    console.error(`- ${err.message} (Line: ${line}, Col: ${col})`);
                });
                process.exit(1);
            }
        }
    } catch (error) {
        console.error(`Critical error parsing YAML document from ${rYamlPath}: ${error.message}`);
        process.exit(1);
    }

    if (!rSyntaxDoc.has('variables')) {
        console.error(`'variables' section not found in ${rYamlPath}`);
        process.exit(1);
    }
    const variablesNode = rSyntaxDoc.get('variables');
    if (!YAML.isMap(variablesNode)) {
        console.error(`'variables' section is not a map in ${rYamlPath}`);
        process.exit(1);
    }

    let changesMade = false;

    for (const [namespace, yamlKey] of Object.entries(namespacesToUpdate)) {
        console.log(`\nFetching symbols for namespace: ${namespace} (YAML key: ${yamlKey})`);
        let symbolsOutput;
        try {
            const command = `Rscript "${getSymbolsScriptPath}" ${namespace}`;
            console.log(`Executing: ${command}`);
            symbolsOutput = execSync(command, { encoding: 'utf8' });
        } catch (error) {
            console.error(`Error executing Rscript for namespace ${namespace}:`);
            console.error(error.stderr || error.stdout || error.message);
            console.warn(`Skipping update for ${yamlKey} due to Rscript error.`);
            continue;
        }

        // Split by newlines (to handle \n or \r\n)
        // Filter out any empty strings that might result from multiple newlines
        // Escape '.' characters to '\.' for regex compatibility
        const symbolsArray = symbolsOutput.trim().split(/\r?\n/)
            .filter(s => s.length > 0)
            .map(s => s.replace(/\./g, '\\.'));
        const symbolsString = symbolsArray.join('|');

        if (symbolsString) {
            const newYamlValue = `(${symbolsString})`;
            const currentValue = rSyntaxDoc.getIn(['variables', yamlKey]);

            if (currentValue !== newYamlValue) {
                console.log(`Updating ${yamlKey}...`);
                rSyntaxDoc.setIn(['variables', yamlKey], newYamlValue);
                changesMade = true;
                console.log(`${yamlKey} updated successfully.`);
            } else {
                console.log(`${yamlKey} is already up-to-date.`);
            }
        } else {
            console.warn(`No symbols returned for namespace ${namespace}. Skipping update for ${yamlKey}.`);
        }
    }

    if (changesMade) {
        console.log(`\nWriting updated R syntax file to: ${rYamlPath}`);
        try {
            const updatedYamlContent = rSyntaxDoc.toString({ lineWidth: 0 });
            fs.writeFileSync(rYamlPath, updatedYamlContent, 'utf8');
            console.log(`${rYamlPath} has been updated successfully.`);
        } catch (error) {
            console.error(`Error writing updated ${rYamlPath}: ${error.message}`);
            process.exit(1);
        }
    } else {
        console.log('\nNo changes made to the R syntax file.');
    }
}

// --- Main execution ---
// This script is intended to be run directly.
// In ESM, top-level code executes when the module is run.
// We can check if this script is the main module being run, similar to `if __name__ == '__main__'` in Python.
// `process.argv[1]` is the path of the executed script.
// `fileURLToPath(import.meta.url)` is the path of the current module.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    if (!fs.existsSync(getSymbolsScriptPath)) {
        console.error(`Error: The R script was not found at ${getSymbolsScriptPath}`);
        console.error("Please ensure 'get-symbols.R' exists in the 'scripts' directory alongside this script.");
        process.exit(1);
    }
    if (!fs.existsSync(rYamlPath)) {
        console.error(`Error: The R YAML syntax file was not found at ${rYamlPath}`);
        process.exit(1);
    }
    try {
        updateRSymbols();
    } catch (err) {
        console.error("An unexpected error occurred:", err);
        process.exit(1);
    }
}
