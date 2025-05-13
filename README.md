# R Syntax Highlight

This Visual Studio Code extension provides syntax highlighting for R and R Markdown extensions.

It brings more consistency with other VS Code language syntaxes (such as Python and C) and
Sublime Text [R syntax](https://github.com/sublimehq/Packages/tree/master/R).

It only contains syntax definitions to allow users to switch to alternative formatters and language servers such as [air](https://github.com/posit-dev/air) and [ark](https://github.com/posit-dev/ark).

## Installation

The releases are available in VSCode Marketplace or Open VSX Registry. Search for extension "R Syntax".

## Contribution

If you are interesting in contributing to the syntaxes, feel free to clone the repository and edit the `r.yaml` and `rmd.yaml` files under the `syntaxes` directroy.
In order to build the json files, you will need to install node.js and run

```sh
npm install
npm run build
# or the following if you want to build the json files in watch mode
npm run build -- --watch
```

You should also run the grammar tests located in the `tests/testdata`. See [vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test) for details.

```sh
npm run test:grammar
# or the following if you want to test in watch mode
npm run test:grammar -- --watch
```
