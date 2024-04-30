evaluator.quantifyEquation = function(tree, query){
    let [functions, variables] = evaluator.getAllData(tree);
    let differentialFunction = false;
    let differentialVariable = false;
    for(let i = 0; i<functions.length; i++){
        if(functions[i].values[0].startsWith('d')){
            differentialFunction = true;
            break;
        }
    }
    for(let i = 0; i<variables.length; i++){
        if(variables[i].startsWith('d')){
            differentialVariable = true;
            break;
        }
    }
    console.log(functions,variables)
    if(differentialFunction && differentialVariable) return 1; //differential equation
    if(functions.length == 0 && variables.filter((i,v) => variables.indexOf(i) == v && i != 'pi' && i != 'e').length == 1) return 2; //polynomial to solve
    return 0; //normal eval
    //if functionnames start with d and variables start with d: generate a DE solver
    //if equation with unsolved variables, solve
    //if equals sign, subtract (seperate function?)
    //keywords searcher in string
    //separate main.js into seperate equation handling types
}