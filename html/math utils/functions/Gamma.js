evaluator.gamma = function(tree){
    let value = tree.values[1];
    if(value.type == 'Number' || value.type == 'Complex'){
        let re = 0;
        let im = 0;
        let rep = 0;
        let imp = 0;
        if(value.type == 'Number'){
            rep = value.values - 1;
            for(let i = 0; i<=1000; i+=0.05){
                re += 0.05*Math.exp(-i)*(i**rep)
            }
        }
        if(value.type == 'Complex'){
            rep = value.values[0] - 1;
            imp = value.values[1];
        
            let i = 0.005;
            let exp = [1,1];
            while(Math.abs(Math.exp(-i)*exp[0]) > 1e-10){
                exp = evaluator.complexTools.powC(i,0,rep,imp);
                re+=exp[0]*Math.exp(-i)*0.005;
                im+=exp[1]*Math.exp(-i)*0.005;
                i+=0.005;
                
            }
        }
        if(im == 0) return { type:'Number',values:re};
        return {type:"Complex",values:[re,im]};
    }
    return tree;
}