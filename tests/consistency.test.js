import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
// Import the function to test directly
// Ensure the .js extension is included for ESM imports
import { convertYamlFileToJsonFile } from '../scripts/yaml-to-json.js';

// ESM equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Build Script YAML to JSON Conversion Consistency', () => {
  const projectRoot = path.resolve(__dirname, '..');

  // Define the file pairs to test
  const filePairs = [
    {
      name: 'R syntax',
      yamlFile: 'r.yaml',
      jsonFile: 'r.json',
    },
    {
      name: 'R Markdown syntax',
      yamlFile: 'rmd.yaml',
      jsonFile: 'rmd.json',
    }
  ];

  let tempDir;

  beforeAll(() => {
    // Create a single temporary directory for all test outputs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-r-syntax-test-'));
  });

  afterAll(() => {
    // Clean up the temporary directory
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Use it.each to run the same test logic for each file pair
  it.each(filePairs)('should convert $yamlFile to JSON identical to $jsonFile', ({ name, yamlFile, jsonFile }) => {
    const inputYamlPath = path.join(projectRoot, 'syntaxes', yamlFile);
    const expectedJsonPath = path.join(projectRoot, 'syntaxes', jsonFile);
    const tempOutputPath = path.join(tempDir, `${path.basename(yamlFile, '.yaml')}.temp.json`); // Unique temp file name

    try {
      // Call the conversion function directly
      const success = convertYamlFileToJsonFile(inputYamlPath, tempOutputPath);
      if (!success) {
        throw new Error(`convertYamlFileToJsonFile function returned false for ${name}, indicating failure.`);
      }
    } catch (error) {
      console.error(`YAML to JSON conversion failed during test for ${name}:`, error);
      throw error; // Re-throw to make Jest fail the test
    }

    const generatedJsonContent = fs.readFileSync(tempOutputPath, 'utf8');
    const expectedJsonContent = fs.readFileSync(expectedJsonPath, 'utf8');

    // Parse both JSON strings to compare objects (ignores formatting differences)
    const generatedJsonObject = JSON.parse(generatedJsonContent);
    const expectedJsonObject = JSON.parse(expectedJsonContent);

    // Assert that the generated JSON object is deeply equal to the expected one
    expect(generatedJsonObject).toEqual(expectedJsonObject);
  });
});
