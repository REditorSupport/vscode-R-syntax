#!/bin/bash

# Define the temporary directory
TEMP_DIR=$(mktemp -d)
echo "Cloning VS Code into: $TEMP_DIR"

# Clone the VS Code repository
git clone https://github.com/microsoft/vscode "$TEMP_DIR/vscode"

# Define the destination directory for extensions
DEST_DIR="$(dirname "$0")/../tests/testdata/vscode-extensions"
mkdir -p "$DEST_DIR"
echo "Copying .tmLanguage.json files to: $DEST_DIR"

# Find and copy .tmLanguage.json files while preserving directory structure
find "$TEMP_DIR/vscode/extensions" -type f -name "*.tmLanguage.json" | while read -r file; do
    # Get the path relative to TEMP_DIR/vscode/extensions
    relative_path="${file#"$TEMP_DIR/vscode/extensions/"}"

    # Construct the destination path
    destination_file="$DEST_DIR/$relative_path"

    # Create the parent directory in the destination if it doesn't exist
    mkdir -p "$(dirname "$destination_file")"

    # Copy the file
    cp "$file" "$destination_file"
done

echo "Processing complete."
echo "Temporary directory created at: $TEMP_DIR"
echo "Copied .tmLanguage.json files are in: $DEST_DIR"

rm -rf "$TEMP_DIR"
echo "Temporary directory $TEMP_DIR removed."
