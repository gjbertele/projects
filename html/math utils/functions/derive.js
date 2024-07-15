evaluator.derive = function(tree){
    if(tree.type == 'Parenthesis'){
        return evaluator.derive(tree.values[0])
    }
    if(tree.type == '+'){
        return {type:'+',values:[evaluator.derive(tree.values[0]),evaluator.derive(tree.values[1])]};
    }
    if(tree.type == '-'){
        return {type:'-',values:[evaluator.derive(tree.values[0]),evaluator.derive(tree.values[1])]};
    }
    if(tree.type == '*'){
        return {type:'+',values:[{type:'*',values:[evaluator.derive(tree.values[0]),tree.values[1]]},{type:'*',values:[evaluator.derive(tree.values[1]),tree.values[0]]}]};
    }
    if(tree.type == 'Number') return {type:'Number',values:0};
    if(tree.type == 'Variable'){
        if(tree.values != 'x') return {type:'Number',values:0};
        return {type:'Number',values:1};
    }
    if(tree.type == 'Function'){
        if(tree.values[0] == 'sin'){
            return {type:'*',values:[evaluator.derive(tree.values[1]),{type:'Function',values:['cos',tree.values[1]]}]};
        }
        if(tree.values[0] == 'cos'){
            return {type:'*',values:[{type:'Number',values:-1},{type:'*',values:[evaluator.derive(tree.values[1]),{type:'Function',values:['sin',tree.values[1]]}]}]};
        }
        if(tree.values[0] == 'ln'){
            return {type:'/',values:[evaluator.derive(tree.values[1]),tree.values[1]]}
        }
        if(tree.values[0] == 'Factorial'){
            return {type:'*',values:[tree,{type:'-',values:[{type:'Function',values:['Harmonic',{type:'Variable',values:'x'}]},{type:'Variable',values:"γ"}]}]}
        }
        tree.values[0]+='\'';
        return tree;
    }
    if(tree.type == '^'){
        if(tree.values[0].type == 'Variable' && tree.values[0].values == 'x' && tree.values[1].type == 'Number'){
            return {type:'*',values:[tree.values[1],{type:'^',values:[tree.values[0],{type:'Number',values:tree.values[1].values-1}]}]}
        }
        let exponent = {type:'*',values:[{type:'Function',values:['ln',tree.values[0]]},tree.values[1]]}
        return {type:'*',values:[evaluator.derive(exponent),tree]}
    }
}