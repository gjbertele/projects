evaluator.applyLopitals = function(tree){
   let numerator = evaluator.derive(tree.values[1].values[0]);
   let denominator = evaluator.derive(tree.values[1].values[1]);
   console.log(numerator,denominator,tree.values)
   return {type:'/',values:[numerator,denominator]}
}