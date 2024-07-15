evaluator.harmonic = function(tree){
    let k = tree.values[1].values;
    if(k > 1e6){
        let v = 0;
        for(let i = 0; i<1e6; i++){
            let ti = i*1e-6;
            v += (0.5/(1e6 - 1) + 0.5e-6)* (1-ti**k)/(1-ti);

        }
        return {type:'Number',values:v};
    }
    let v = 0;
    for(let i = 1; i<=k; i++) v+= 1/i;
    return {type:'Number',values:v}
}