evaluator.closedforms = function(x) {
    let closedForms = [];
    for (let i = 2; i < 5; i++) {
        let k = x ** i;
        if (Math.abs(Math.round(k) - k) / k <= 0.006) {
            closedForms.push([0, i, Math.round(k)]);
        }
    }
    if (x % 1 != 0) {
        let expnum = 10 ** x.toString().split('.')[1].length;
        let n = x * expnum;
        let d = expnum + 0;
        let numerator = Math.factor(x * expnum);
        let denominator = Math.factor(expnum);
        let simplified = false;
        for (let i in numerator) {
            if (denominator[i] != undefined) {
                let j = parseInt(i) ** Math.min(parseInt(denominator[i]), parseInt(numerator[i]));
                n /= j;
                d /= j;
                simplified = true;
            }
        }
        if (simplified == true) {
            closedForms.push([1, d, n]) //IMPROVE THIS, CHECK FOR 10/7ths OR OTHER THINGS W ODD DIGIT IN 16TH PLACE
        }
    }
    return closedForms;
}