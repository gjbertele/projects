evaluator.getAllData = function(tree){
    if(tree.type == undefined) return [[],[]];
    let functions = [];
    let variables = [];
    if(tree.type == 'Function') functions.push(tree);
    for(let i = 0; i<tree.values.length; i++){
        let [b,c] = evaluator.getAllData(tree.values[i]);
        functions.push(...b);
        variables.push(...c);
    }
    if(tree.type == 'Variable'){
        variables.push(tree);
    }
    return [functions,variables];
}