evaluator.fastFactorial = function(tree){
    let x = tree.values[1].values;
    let v = Math.sqrt(Math.PI)*((x/Math.E)**x) * ((8*x**3 + 4*x**2 + x + 1/30)**(1/6))
    return {type:'Number',values:v};
}