evaluator.Factor = function(tree, canvas, ctx, variables){
    let evaled = tree.values[1];
    if (evaled.type != 'Number') return tree;
    let j = Math.factor(Math.round(evaled.values));
    let newList = [];
    for (let i in j) {
        for (let k = 0; k < j[i]; k++) {
            newList.push({
                type: "Number",
                values: parseInt(i)
            });
        }
    }
    return {
        type: 'List',
        values: newList
    };
}