/**
 * YAML to JSON Converter with Variable Substitution 
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';


// --- Helper Function for Variable Substitution ---
/**
 * Recursively substitutes placeholders in data with values from variables.
 * Placeholders are in the format {{variableName}}.
 * @param {*} data - The data structure (object, array, string, etc.) to process.
 * @param {object} variables - An object containing variable names and their values.
 * @returns {*} - The data structure with substitutions applied.
 */
function substituteVariables(data, variables) {
  if (typeof data === 'string') {
    // Regex to find {{variableName}} placeholders
    return data.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, variableName) => {
      if (variables.hasOwnProperty(variableName)) {
        // Return the substituted value. We assume variable values don't need further substitution.
        return variables[variableName];
      } else {
        console.warn(`Warning: Variable '{{${variableName}}}' not found during substitution.`);
        return match; // Keep the original placeholder if the variable is not defined
      }
    });
  } else if (Array.isArray(data)) {
    return data.map(item => substituteVariables(item, variables));
  } else if (typeof data === 'object' && data !== null) {
    const newData = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        newData[key] = substituteVariables(data[key], variables);
      }
    }
    return newData;
  }
  // For numbers, booleans, null, etc., return as is
  return data;
}

/**
 * Converts a YAML file to a JSON file, performing variable substitution.
 * @param {string} yamlFilePath - Absolute path to the input YAML file.
 * @param {string} jsonFilePath - Absolute path to the output JSON file.
 * @returns {boolean} - True if conversion was successful, false otherwise.
 */
const convertYamlFileToJsonFile = (yamlFilePath, jsonFilePath) => {
  try {
    // Ensure the output directory exists
    const outputDir = path.dirname(jsonFilePath);
    if (!fs.existsSync(outputDir)) {
      console.log(`Creating output directory: ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Reading YAML file: ${yamlFilePath}`);
    const yamlContent = fs.readFileSync(yamlFilePath, 'utf8');

    console.log('Parsing YAML content...');
    let jsonContent = yaml.load(yamlContent); // Use 'let' as it might be reassigned

    // --- Variable Substitution ---
    let variables = {}; // Initialize empty variables object
    if (jsonContent && typeof jsonContent === 'object' && jsonContent.hasOwnProperty('variables')) {
      if (typeof jsonContent.variables === 'object' && jsonContent.variables !== null) {
        variables = jsonContent.variables;
        delete jsonContent.variables; // Remove the variables key from the final output
        jsonContent = substituteVariables(jsonContent, variables); // Apply substitution recursively
      } else {
        console.warn("Warning: Top-level 'variables' key found but its value is not an object. Skipping substitution.");
        // Optionally delete the key even if it's not a valid object
        delete jsonContent.variables;
      }
    }

    // Add the $schema if it's present in the YAML (js-yaml might remove it)
    // Or add it manually if desired
    if (!jsonContent.$schema && yamlContent.includes('$schema:')) {
      const schemaLine = yamlContent.split('\n').find(line => line.trim().startsWith('$schema:'));
      if (schemaLine) {
        // Extract the value after the first ':' and trim whitespace
        const schemaValue = schemaLine.substring(schemaLine.indexOf(':') + 1).trim();
        jsonContent.$schema = schemaValue;
      }
    } else if (!jsonContent.$schema) {
      jsonContent.$schema = "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json";
    }


    console.log(`Writing JSON file: ${jsonFilePath}`);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonContent, null, 2)); // Pretty print JSON

    console.log('YAML to JSON conversion (with variable substitution) successful!');
    return true; // Indicate success

  } catch (e) { // Catch potential errors during parsing, substitution, or writing
    console.error('Error during YAML to JSON conversion:', e);
    return false; // Indicate failure
  }
};

// --- Export the function ---
export { convertYamlFileToJsonFile };
