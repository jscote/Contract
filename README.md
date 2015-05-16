# Contract
Contracts are used to define the inputs and outputs of a function. In other words, they are a signature.

In javascript, the notion of method signature is very lose, which is very powerful. The problem with this is that,
sometimes, when an object is reused in different context, you end up writing code to check existence of parameters.

With contracts, you specify what you expect as inputs and outputs. You can then easily map the data from the context of
execution to the arguments that are expected.

This promote reuse and reduce maintenance.
