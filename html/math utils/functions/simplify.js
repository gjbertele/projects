evaluator.simplify = function(eqToSimplify, variables){
    if(eqToSimplify.type == 'Number' || eqToSimplify.type == 'Complex') return eqToSimplify;
    if(eqToSimplify.type == 'Function'){
        for(let i = 0; i<eqToSimplify.values; i++) eqToSimplify.values[i] = evaluator.simplify(eqToSimplify.values[i]);
        return eqToSimplify;
    }
    if(isOperator(eqToSimplify.type)){
        if(eqToSimplify.type == '^'){
            eqToSimplify.values[1] = evaluator.evaluateEquation(evaluator.simplify(eqToSimplify.values[1]));
            if(eqToSimplify.values[0].type == 'Complex' && eqToSimplify.values[0].values[0] == 0 && eqToSimplify.values[0].values[1] == 1){
                if(eqToSimplify.values[1].type == 'Number'){
                    let outputDef = [[1,0],[0,1],[-1,0],[0,-1]];
                    return { type:'Complex',values:outputDef[eqToSimplify.values[1].values % 4] };
                } else if(eqToSimplify.values[1].type == 'Complex'){
                    let outputDef = [[1,0],[0,1],[-1,0],[0,-1]];
                    let out = { type:'Complex',values:outputDef[eqToSimplify.values[1].values[0] % 4] }
                    return evaluator.evaluateEquation(evaluator.simplify({type:'*',values:[{type:'Complex',values:[0,eqToSimplify.values[1].values[1]]},out]}));
                }
            }
        }
    }
    return eqToSimplify;
}