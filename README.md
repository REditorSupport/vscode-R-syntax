# R Syntax Highlight

This Visual Studio Code extension provides syntax highlighting for R and R Markdown extensions.

It brings more consistency with other VS Code language syntaxes (such as Python and C) and
Sublime Text [R syntax](https://github.com/sublimehq/Packages/tree/master/R).

It only contains syntax definitions to allow users to switch to alternative formatters and language servers such as [air](https://github.com/posit-dev/air) and [ark](https://github.com/posit-dev/ark).

## Glue interpolation

R expressions inside quoted templates use the same highlighting as ordinary R code.

```r
glue::glue("My name is {name}.")
stringr::str_glue("Total: {sum(values)}")
records |> glue::glue_data("{name} scored {score}.")
```

The grammar recognizes `glue()`, `glue_data()`, `str_glue()`, and `str_glue_data()` by name, with or without their package qualifier. Single and double quotes work, and doubled braces such as `{{name}}` stay literal. Named arguments supply ordinary R values. For example, in `glue("{x}", x = "{name}")` only `x` in the first string is highlighted as R.

Highlighting assumes glue's default braces and transformer. Aliases, custom delimiters, raw string templates, and expressions assembled across arguments are outside its scope. A locally defined function with one of the recognized names receives the same highlighting. In multiline data calls, put a named `.x` before the first template so the grammar can identify its role as you type.

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
