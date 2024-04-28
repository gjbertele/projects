evaluator.closedForms = function(x) {
    if(x % 1 == 0) return [];
    let closedForms = [];
    for (let i = 2; i < 4; i++) {
        let k = x ** i;
        if (Math.abs(Math.round(k) - k) / k <= 0.006) {
            closedForms.push([0, i, Math.round(k)]);
        }
    }
    let n = 1;
    let d = 1;
    while(d < 1000 && n/d != x % 1){
        if(Math.abs(n/(d*(x%1)) - 1) < 0.0001) break;
        if(x % 1 > n/d){
            n++;
        } else {
            d++;
        }
    }
    closedForms.push([1,d,n,x - (x % 1)]);
    let mindist = 1;
    let mini;
    let minj;
    for(let k = 0; k<30; k++){
        let i = parseInt(firstPrimes[k]);
        for(let j = 1; j<100; j++){ 
            if(Math.round(x - j*Math.sqrt(i)) < -5) break;
            let evaled = Math.round(x - j*Math.sqrt(i)) + j*Math.sqrt(i);
            if(j == 1 && Math.round(x - j*Math.sqrt(i)) == 0) break;
            if(Math.abs(evaled - x) < mindist){
                mindist = Math.abs(evaled - x);
                mini = i;
                minj = j;
            }
        }
    }
    if(mindist <= 0.01){
        closedForms.push([2,mini,minj,Math.round(x - minj*Math.sqrt(mini))])
    }
    console.log(1)
    return closedForms;
}