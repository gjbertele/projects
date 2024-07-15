evaluator.simplify = function(eqToSimplify, variables){
    if(eqToSimplify.type == 'Number' || eqToSimplify.type == 'Complex') return eqToSimplify;
    if(eqToSimplify.type == 'Function'){
        for(let i = 0; i<eqToSimplify.values; i++) eqToSimplify.values[i] = evaluator.simplify(eqToSimplify.values[i]);
        return eqToSimplify;
    }
    if(eqToSimplify.type == '*'){
        if((eqToSimplify.values[0].type == 'Number' && eqToSimplify.values[0].values == 0)||(eqToSimplify.values[1].type == 'Number' && eqToSimplify.values[1].values == 0)){
            return {type:'Number',values:0};
        }
        if(eqToSimplify.values[0].type == 'Number' && eqToSimplify.values[0].values == 1){
            return evaluator.simplify(eqToSimplify.values[1]);
        }
        return {type:'*',values:[evaluator.simplify(eqToSimplify.values[0]),evaluator.simplify(eqToSimplify.values[1])]}
    }
    if(eqToSimplify.type == '+'){
        if(eqToSimplify.values[0].type == 'Number' && eqToSimplify.values[0].values == 0){
            return evaluator.simplify(eqToSimplify.values[1]);
        }
        if(eqToSimplify.values[1].type == 'Number' && eqToSimplify.values[1].values == 0){
            return evaluator.simplify(eqToSimplify.values[0]);
        }
        return {type:'+',values:[evaluator.simplify(eqToSimplify.values[0]),evaluator.simplify(eqToSimplify.values[1])]}
    }
    if(eqToSimplify.type == '^'){
        if(eqToSimplify.values[1].type == 'Number' && eqToSimplify.values[1].values == 0){
            return evaluator.simplify(eqToSimplify.values[0]);
        }
    }
    if(eqToSimplify.type == 'Parenthesis'){
        return evaluator.simplify(eqToSimplify.values[0]);
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
    for(let i = 0; i<eqToSimplify.values.length; i++){
        if(typeof eqToSimplify.values[i] != typeof "") {
            eqToSimplify.values[i] = evaluator.simplify(eqToSimplify.values[i]);
        }    
    }
    return eqToSimplify;
}
