evaluator.closedForms = function(x) {
    let closedForms = [];
    for (let i = 2; i < 5; i++) {
        let k = x ** i;
        if (Math.abs(Math.round(k) - k) / k <= 0.006) {
            closedForms.push([0, i, Math.round(k)]);
        }
    }
    let n = 1;
    let d = 1;
    while(d < 1000 && n/d != x % 1){
        if(Math.abs(n/(d*(x%1)) - 1) < 0.01) break;
        if(x % 1 > n/d){
            n++;
        } else {
            d++;
        }
    }
    return closedForms;
}