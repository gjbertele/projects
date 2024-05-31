evaluator.derive = function(tree){
    if(tree.type == '+'){
        return {type:'+',values:[evaluator.derive(tree.values[0]),evaluator.derive(tree.values[1])]};
    }
    if(tree.type == '-'){
        return {type:'-',values:[evaluator.derive(tree.values[0]),evaluator.derive(tree.values[1])]};
    }
    if(tree.type == '*'){
        return {type:'+',values:[{type:'*',values:[evaluator.derive(tree.values[0]),tree.values[1]]},{type:'*',values:[evaluator.derive(tree.values[1]),tree.values[0]]}]};
    }
    if(tree.type == 'Number') return {type:'Number',value:0};
    if(tree.type == 'Variable'){
        if(tree.values[0] != 'x') return {type:'Number',value:0};
        return {type:'Number',value:1};
    }
    if(tree.type == 'Function'){
        if(tree.values[0] == 'sin'){
            return {type:'*',values:[evaluator.derive(tree.values[1]),{type:'Function',values:['cos',tree.values[1]]}]};
        }
        if(tree.values[0] == 'cos'){
            return {type:'*',values:[{type:'Number',value:-1},{type:'*',values:[evaluator.derive(tree.values[1]),{type:'Function',values:['cos',tree.values[1]]}]}]};
        }
    }
}