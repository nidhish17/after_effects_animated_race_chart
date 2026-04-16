# Poll ExtendScript

## overview
This is an after effects extendscript written to create animated song polls automatically 
using the input data given by the user.
It takes an input from the user about all the data that the user wants to use in json format
the json format is parsed and then the data is taken and the composition and all the other after 
effects layer are created.


## development details
As after effects does not support es-6+ standards for extendscript this project uses babel-cli to 
convert the normal code and extra es6 features into prototypes, note that this is entirely different 
from expressions, while after effects expressions supports es6, the extendscript itself or the after 
effects engine that executes extendscript does not support es6 but the after effects expressions does 
support es6 things like const, let,....

even extendscript uses jsx but it is different from react jsx, the jsx here refers to the extendscript file


## project structure
the dist folder contains the compiled code of expressions that go inside after effects properties, this
project uses babel to convert because to maintain readability and clean code, as the expression engine
does not understand ``(backtick) quotes we need to convert it to string concatenation by using babel
but we are using the backticks to write code because to maintain readability and clean structured code
and also using backticks helps the ides like webstrom to insert code highlighting into that block. all
the expressions are defined/written in /horizontal_poll/my_expressions.js

The main file is the horizontal_poll_main.jsx which contains all the main code to create the layers and 
compositions inside the after effects. this file is not compiled or anything so it needs to respect 
extendscript rules. this file also imports the other helper files and compiled expression files using the
\# include which is a valid syntax inside extenscript after effects.

## example dataset
The file inside horizontal_poll, IVE-data.json (horizontal_poll/IVE-data.json) file is an example file
that will be parsed by the after effects to generate the compositions and the layers! 
it just only contains the data it does not contain any other information like composition settings
its a single source of truth only containing the data for the polls! 

