# SYNTAX TEST "source.r" "basics"

library(stats)
# ^^^^^ meta.function-call.r support.function.r
#      ^ meta.function-call.r punctuation.definition.arguments.begin.r
#            ^ meta.function-call.r punctuation.definition.arguments.end.r
require(graphics)

#' Roxygen comment example
#' @param x A numeric vector.
# <- comment.line.roxygen.r punctuation.definition.comment.r
#  ^^^^^^ comment.line.roxygen.r keyword.other.r
#         ^ comment.line.roxygen.r variable.parameter.r
#           ^^^^^^^^^^^^^^^^ comment.line.roxygen.r -variable.parameter.r
#' @return The mean of x.
#' @export
calculate_mean <- function(x) {
#^^^^^^^^^^^^^ meta.function.r entity.name.function.r
#              ^^ meta.function.r keyword.operator.assignment.r
#                 ^^^^^^^^ meta.function.r keyword.control.r
  # Check if input is numeric
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.line.number-sign.r
  if (!is.numeric(x)) {
# ^^ keyword.control.conditional.if.r
#    ^ punctuation.section.parameters.begin.bracket.round.r
#     ^ keyword.operator.logical.r
#      ^^^^^^^^^^ meta.function-call.r support.function.r
#                ^ meta.function-call.r punctuation.definition.arguments.begin.r
#                 ^ meta.function-call.r meta.function-call.arguments.r
#                     ^ punctuation.section.block.begin.bracket.curly.r
    stop("Input must be numeric") # Inline comment
#   ^^^^ meta.function-call.r support.function.r
  }
# ^ punctuation.section.block.end.bracket.curly.r
  # Calculate mean, handling NA values
  result <- base::mean(x, na.rm = TRUE)
#        ^^ keyword.operator.assignment.r
#                 ^^^^ meta.function-call.r support.function.r
  return(result)
# ^^^^^^ keyword.control.flow.return.r
}

# Variable assignment using different operators
# ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ comment.line.number-sign.r
my_vector <- c(1L, 2L, 3L, NA, 5L)
#              ^^ constant.numeric.integer.decimal.r
#                          ^^ constant.language.r
my_string = "Hello, \"world\"!\nThis is a test."
#            ^^^^^^ string.quoted.double.r
#                   ^^ constant.character.escape.r
another_string <- 'Single quotes work too.'
#                  ^^^^^^^^^^^^^^^^^^^^^^^ string.quoted.single.r
raw_string <- r"(This string ignores \n escapes.)"
#               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ string.quoted.double.raw.r
#                                    ^^ -constant.character.escape.r
`a variable with spaces` <- 10 * pi # Using backticks for non-standard names
#                        ^^ keyword.operator.assignment.r
#                                ^^ support.constant.misc.r
logical_val <- TRUE
#              ^^^^ constant.language.r
complex_num <- 1 + 2i
#                  ^^ constant.numeric.imaginary.decimal.r
infinity_val <- Inf
#               ^^^ constant.language.r
not_a_number <- NaN
#               ^^^ constant.language.r

# Function call with named arguments
random_numbers <- rnorm(n = 5, mean = 0, sd = 1)
#                 ^^^^^ meta.function-call.r support.function.r
#                       ^ meta.function-call.arguments.r variable.parameter.function-call.r
#                              ^^^^ variable.parameter.function-call.r
#                           ^  constant.numeric.float.decimal.r

# Control flow: if/else if/else
if (length(my_vector) > 5) {
#<- keyword.control.conditional.if.r
  print("Vector is long")
} else if (length(my_vector) == 5) {
# ^^^^ keyword.control.conditional.else.r
#      ^^ keyword.control.conditional.if.r
   print("Vector has exactly 5 elements.")
} else {
# ^^^^  keyword.control.conditional.else.r
  print("Vector is short")
}

# Data structures
my_list <- list(
#          ^^^^ storage.type.r
  name = "Test List",
# ^^^^ variable.parameter.function-call.r
#      ^ keyword.operator.assignment.r
  data = my_vector,
# ^^^^ variable.parameter.function-call.r
#        ^^^^^^^^^ meta.function-call.arguments.r
  metadata = list(version = 1.0, author = "Gemini")
# ^^^^^^^^ variable.parameter.function-call.r
#            ^^^^ meta.function-call.r meta.function-call.arguments.r meta.function-call.r storage.type.r
)
# <- meta.function-call.r punctuation.definition.arguments.end.r

# Formula notation
model <- lm(Score ~ Value, data = my_dataframe)
#        ^^ support.function.r
#                          ^^^^ variable.parameter.function-call.r
print(summary(model))
#     ^^^^^^^ support.function.r

# Operators
arithmetic_result <- (5 + 3) * 2^2 / 4 - 1
#                    ^ punctuation.section.parameters.begin.bracket.round.r
#                          ^ punctuation.section.parameters.end.bracket.round.r
modulo_result <- 10 %% 3
#                   ^^ keyword.operator.arithmetic.r
integer_division <- 10 %/% 3
#                      ^^^ keyword.operator.arithmetic.r
matrix_mult <- my_matrix %*% t(my_matrix) # Matrix multiplication
#                        ^^^ keyword.operator.arithmetic.r
membership <- "A" %in% my_dataframe$Value
#                 ^^^^ keyword.operator.other.r

# Special constants and identifiers
print(pi)
#     ^^ support.constant.misc.r
print(NA)
#     ^^ constant.language.r
print(NULL)
#     ^^^^ constant.language.r
print(letters[1:5])
#     ^^^^^^^ support.constant.misc.r
#            ^ punctuation.section.brackets.single.begin.r
#                ^ punctuation.section.brackets.single.end.r
print(month.name[1])
#     ^^^^^^^^^^ support.constant.misc.r
#               ^ punctuation.section.brackets.single.begin.r
#                 ^ punctuation.section.brackets.single.end.r

# Calling a function with a special name
result_add <- base::`+`(5, 3)
#                 ^^ punctuation.accessor.colons.r
#                   ^^^ meta.function-call.r
# Using a namespace explicitly
stats_median <- stats::median(my_vector, na.rm = TRUE)
#               ^^^^^ support.namespace.r
#                    ^^ punctuation.accessor.colons.r
#                      ^^^^^^ support.function.r
foo::median
#  ^^ punctuation.accessor.colons.r
#    ^^^^^^ -support.function.r

my_vector |>
#         ^^ keyword.operator.pipe.r
  foo()

# issue #1
foo(x = `#afd`)
#        ^^^^ -comment
