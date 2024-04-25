evaluator.zeta = function(tree){
    if(tree.type == 'Number'){
        if(tree.values <= 1) return {type:'Number',values:Infinity};
        let v = 0;
        for(let k = 0; k<1e6; k++){
            v+=((-1)**k)/(k+1)**(tree.values);
        }
        v/= 1-(2**(1-tree.values))
        return {type:'Number',values:v};
    } else if(tree.type == 'Complex'){
        let re = 0;
        let im = 0;
        for(let i = 0; i<1e7; i++){
            let v1 = evaluator.complexTools.divC((-1)**i,0,...evaluator.complexTools.powC(i+1,0,...tree.values));
            re+=v1[0];
            im+=v1[1];
        }
        
        let denominator = evaluator.complexTools.powC(2,0,1-tree.values[0],-tree.values[1]);
        return {type:'Complex',values:evaluator.complexTools.divC(re,im,1-denominator[0],-denominator[1])};
    }
    return tree;
}