evaluator.harmonic = function(tree){
    let k = tree.values[1];
    let v = 0;
    for(let i = 1; i<=k.values; i++){
        v+=1/i;
    }
    return {type:'Number',values:v};
}