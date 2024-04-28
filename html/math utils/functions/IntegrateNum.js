evaluator.integrateNum = function(tree, canvas, ctx, variables) {
    let vRe = 0;
    let vIm = 0;
    let lb = tree.values[2];
    let ub = tree.values[3];
    if(typeof lb == 'number') lb = {type:'Number',values:lb};
    if(typeof ub == 'number') ub = {type:'Number',values:ub};
    if (lb.type != 'Number' || lb.type != 'Number') {
        tree.values[2] = lb.values;
        tree.values[3] = ub.values;
        return tree;
    }
    let tvariables = structuredClone(variables);
    let evable = true;
    for (let i = lb.values; i <= ub.values; i += (ub.values - lb.values)/100) {
        tvariables['t'] = i;
        let k = evaluator.evaluateEquation(tree.values[1], tvariables);
        if (k.type == 'Number') {
            vRe += k.values * (ub.values - lb.values)/100;
        } else if (k.type == 'Complex') {
            vRe += k.values[0] * (ub.values - lb.values)/100;
            vIm += k.values[1] * (ub.values - lb.values)/100;
        } else {
            evable = false;
            break;
        }
    }
    if (evable) {
        if (vIm == 0) {
            return {
                type: 'Number',
                values: vRe
            }
        } else {
            return {
                type: 'Complex',
                values: [vRe, vIm]
            }
        }
    } else {
        tree.values[2] = lb.values;
        tree.values[3] = ub.values;
        return tree;
    }
}