evaluator.getAllData = function(tree){
    if(tree.type == undefined) return [[],[]];
    let functions = [];
    let variables = [];
    if(tree.type == 'Function') return [[tree],[]]
    for(let i = 0; i<tree.values.length; i++){
        let [b,c] = evaluator.getAllData(tree.values[i]);
        for(let j = 0; j<b.length; j++){
            if(!functions.includes(b[j])) functions.push(b[j]);
        }
        for(let j = 0; j<c.length; j++){
            if(!variables.includes(c[j])) variables.push(c[j]);
        }
    }
    if(tree.type == 'Variable'){
        variables.push(tree.values);
    }
    return [functions,variables];
}
evaluator.polyHandler.solveRoot = function(terms, cauchyBound){
    let init = Math.random()*2*cauchyBound - cauchyBound;
    let lg = 0;
    let grad = []
    for(let i = 1; i<terms.length; i++){
        grad[i-1] = terms[i]*i;
    }
    let k = 0;
    while(k < 1e5 && Math.abs(evaluator.polyHandler.polyEval(terms,init)) > 1/3){
        k++;
        init = Math.random()*2*cauchyBound - cauchyBound;
    }
    if(Math.abs(evaluator.polyHandler.polyEval(terms,init)) > 1/3) return NaN;
    k = 0;
    while(k<1e6){
        let evaled = evaluator.polyHandler.polyEval(terms,init);
        if(Math.abs(evaled) < 1e-6) return init;
        let slope = evaluator.polyHandler.polyEval(grad,init);
        init+=-(slope+lg*0.3)*evaled/100;
        lg = slope;
        k++;
    }
    if(Math.abs(init - Math.round(init))/init < 0.02) return Math.round(init)
    return init;

}

evaluator.runWithNumber = function(value, func){
    let transformedInput = {type:'',values:['',{type:'Number',values:value}]};
    let output = func(transformedInput);
    if(output.type == 'Number'){
        return output.values;
    }
    return output;
}