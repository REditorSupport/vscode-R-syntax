#!/usr/bin/env Rscript
args <- commandArgs(trailingOnly = TRUE)

# Check if an argument was provided
if (length(args) == 0) {
  stop("Usage: Rscript get-symbols.R <namespace>", call. = FALSE)
}

# Use the first argument as the namespace
namespace_name <- args[1]

# Check if the namespace exists
if (!requireNamespace(namespace_name, quietly = TRUE)) {
    stop(paste("Namespace", shQuote(namespace_name), "not found or cannot be loaded."), call. = FALSE)
}

unclass(lsf.str(envir = asNamespace(namespace_name))) |>
    Filter(\(x) grepl("^[a-zA-Z\\._][0-9a-zA-Z\\._]*$", x), x = _) |>
    writeLines()
