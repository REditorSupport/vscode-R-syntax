# SYNTAX TEST "source.r" "glue interpolation"

glue("My name is {name}.")
#     ^^^^^^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
#                ^ punctuation.section.embedded.begin.r
#                 ^^^^ meta.embedded.inline.glue.r -string.quoted.double.r
#                     ^ punctuation.section.embedded.end.r
#                      ^ string.quoted.double.r -meta.embedded.inline.glue.r
glue::glue('sum: {sum(x + 1L)}')
# <---- support.namespace.r
#   ^^ punctuation.accessor.colons.r
#           ^^^^^ string.quoted.single.r -meta.embedded.inline.glue.r
#                 ^^^ meta.embedded.inline.glue.r support.function.r
#                       ^ meta.embedded.inline.glue.r keyword.operator.arithmetic.r
#                         ^^ meta.embedded.inline.glue.r constant.numeric.integer.decimal.r
str_glue("{{keep}} {{{name}}}")
#         ^^^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
#                     ^^^^ meta.embedded.inline.glue.r -string.quoted.double.r
stringr::str_glue("{a}", name = "{binding}", "{b}", .na = "{missing}")
#                   ^ meta.embedded.inline.glue.r -string.quoted.double.r
#                                ^^^^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
#                                              ^ meta.embedded.inline.glue.r -string.quoted.double.r
#                                                          ^^^^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r

# R code inside a field uses its own brace, string, and comment rules.
glue("start {if (ok) {paste('}', x)} else {0}} end")
#            ^^ meta.embedded.inline.glue.r keyword.control.conditional.if.r
#                           ^^^ meta.embedded.inline.glue.r string.quoted.single.r
#                                    ^^^^ meta.embedded.inline.glue.r keyword.control.conditional.else.r
#                                             ^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
glue("literal \"quote\": {paste(\"}\", x)} end")
#             ^^ string.quoted.double.r constant.character.escape.r
#                                 ^ meta.embedded.inline.glue.r string.quoted.double.r
#                                         ^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
glue('value {paste(\'}\', x)} end')
#                    ^ meta.embedded.inline.glue.r string.quoted.single.r
#                            ^^^^ string.quoted.single.r -meta.embedded.inline.glue.r
glue("value {'left
#             ^^^^ meta.embedded.inline.glue.r string.quoted.single.r
}right'} end")
# <------ meta.embedded.inline.glue.r string.quoted.single.r
#       ^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
glue("value {x + # ignore this }
#                ^^^^^^^^^^^^^^^ meta.embedded.inline.glue.r comment.line.number-sign.r
  1L} end")
# ^^ meta.embedded.inline.glue.r constant.numeric.integer.decimal.r
#   ^ punctuation.section.embedded.end.r
#    ^^^^ string.quoted.double.r -meta.embedded.inline.glue.r

# The data argument may be supplied directly, by name, or by a pipe.
glue::glue_data(list(x = "{data}"), "{x}")
#                         ^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
#                                     ^ meta.embedded.inline.glue.r -string.quoted.double.r
str_glue_data(.x = df, "{col}")
#                        ^^^ meta.embedded.inline.glue.r -string.quoted.double.r
glue_data("{first}", .x = df)
#           ^^^^^ meta.embedded.inline.glue.r -string.quoted.double.r
df |> glue_data('{col}')
#  ^^ keyword.operator.pipe.r
#                 ^^^ meta.embedded.inline.glue.r -string.quoted.single.r
df %>%
#  ^^^ keyword.operator.other.r
  stringr::str_glue_data("{col}")
#                          ^^^ meta.embedded.inline.glue.r -string.quoted.double.r
glue_data("{data}" |> setNames("col"), "{col}")
#          ^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
#                                        ^^^ meta.embedded.inline.glue.r -string.quoted.double.r

# Other callees and strings inside nested argument expressions stay ordinary.
print("{name}")
#      ^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
other::glue("{name}")
#            ^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
obj$glue("{name}")
#         ^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
obj @ glue("{name}")
#   ^ keyword.other.r
#           ^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
glue::glue_collapse("{name}")
#                    ^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
glue(paste("{inner}"), "{outer}")
#           ^^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
#                        ^^^^^ meta.embedded.inline.glue.r -string.quoted.double.r
glue(named = glue("{child}"), "{outer}")
#                   ^^^^^ meta.embedded.inline.glue.r -string.quoted.double.r
#                               ^^^^^ meta.embedded.inline.glue.r -string.quoted.double.r

# An unfinished field must let the enclosing quote close while editing.
glue("unfinished {name")
next_value <- "ordinary {text}"
#          ^^ keyword.operator.assignment.r -meta.embedded.inline.glue.r
#                       ^^^^^^ string.quoted.double.r -meta.embedded.inline.glue.r
