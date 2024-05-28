class mathUtils {
    dx = 1e-10;
    maxint = BigInt(2**53 - 1);
    p31 = 2**31;
    constructor(){
        this.#enable(this);
    }
    multiplyDynamic = function(A, B){
        if(typeof A  == 'number') return A*B;
        return A.dot(B);
    }
    addDynamic = function(A,B){
        if(typeof A  == 'number') return A + B;
        return A.add(B);
    }
    #findPeriodCompositeBigInt = function(x){
        while(x % 5n == 0n) x/=5n;
        while(x % 3n == 0n) x/=3n;
        while(x % 2n == 0n) x/=2n;
        let factors = this.pollardRho(x);
        let factorPeriods = factors.map(i => i = this.findPeriodPrimeBigIntFast(i)); 
        if(factorPeriods.length == 1) return factorPeriods[0];
        return this.lcmArray(...factorPeriods)
    }
    /*
    interesting finding on collatz:
    all even factors of n will be eventually divided by 2 until all factors are odd
    this means that it will have the 3x+1 rule applied
    product of odds = (2n+1)*product of odds, therefore 2n*product of odds + 1*product of odds = product of odds and a product of odds = 2m+1 so then 2*(n*product of odds + m) + 1 = product of odds, therefore any product of odds = 2k+1 where k is odd.
    let k = a number which is a product of odds, and k_n be a sequence st. 2k_1 + 1 = k, 2k_2 + 1 = k_1, ... 2k_(n-1) +1 = k_n
    C(k) = 3(2k_1 + 1) + 3 = 6k_1 + 4 = 3k_1 + 2 = 3(2k_2 + 1) + 3 = 6k_2 + 7 = 12k_3 + 13 = 24k_4 + 25 = 48k_4 + 49 = 96k_5 + 97 = 3*2^nk_n + 2^n + 1. k_n-1 < k_n/2 since k_n-1 = k_n/2 - 1/2 so k_n-m < k_n/2^m and so k^n+m < 2^mk_n and so if k_1 = 1 then all k must be bounded by 2^m and so therefore the largest possible k is 2^m and so
    x = 3+2^n + 1 where n = steps required
    log_2((x-1)/3)
    */
   collatzSearch = function(){
        let m = 10000;
        let i = 1;
        while(i < m){
            let t = i;
            while(t != 1){
                if(t & 1 == 0){
                    t/=2;
                } else {
                    t = 3*t + 1;
                }
                if(t < i) break;
            }
            i++;
        }
   }
    lcmArray = function(...nums){
        let alleq = false;
        let original = this.#cloneArray(nums);
        for(let i = 0; i<nums.length; i++){
            if(nums[i] != nums[0]){
                alleq = false;
                break;
            }
        }
        while(alleq == false){
            let min = this.maxint;
            let max = 0;
            let ind = 0;
            for(let i = 0; i<nums.length; i++){
                if(nums[i] < min){ min = nums[i]; ind = i; }
                if(nums[i] > max){ max = nums[i]; }
            }
            let mult = this.#ceilBig(max - min, original[ind]);
            nums[ind] += original[ind]*mult;
            alleq = true;

            for(let i = 1; i<nums.length; i++){
                if(nums[i] != nums[0]){
                    alleq = false;
                    break;
                }
            }
        }
        return nums[0]
    }
    #ceilBig = function(a,b){
        if(a < b) return 1n;
        if(b % a == 0n) return b/a;
        return b/a + 1n;
    }
    #logBig = function(x,b){
        let p = 1n;
        let l = 0n;
        while(p < x){
            p*=b;
            l++;
        }
        return l;
    }
    #cloneArray = function(arr){
        let n = [];
        n.push(...arr)
        return n;
    }
    fastDivisorsPeriod = function(x){
        let primes;
        if(x > 10n**5n){
            primes = this.pollardRho(x);
            primes = primes.filter((i,v) => primes.indexOf(i) == v);
        } else {
            primes = Object.keys(x.factor()).map(i => i = BigInt(i));
        }
        let currentProduct = 1n;
        let divisorsList = [];
        let divisors = (new Array(primes.length+1)).fill(0n);
        while(divisors[primes.length] == 0){
            let index = 0;
            while(index < primes.length && currentProduct*primes[index] >= x){
                currentProduct = currentProduct/(primes[index]**divisors[index]);
                divisors[index] = 0n;
                index++;
            }
            if(index == primes.length || currentProduct*primes[index] > x){
                break;
                
            }
            divisors[index]++;
            currentProduct *= primes[index];
            if(x % currentProduct == 0n) divisorsList.push(currentProduct)
        }
        
        return divisorsList.filter((i,v) => divisorsList.indexOf(i) == v); 
    }
    findPeriodPrimeBigIntFast = function(x){
        if(x == 1n) return 0;
        let possibles = this.fastDivisorsPeriod(x - 1n).map(i => i = BigInt(i)).BigIntSort();
        let k = this.expMod(10n,possibles[0],x);
        if(k == 1n) return possibles[0];
        for(let i = 1; i<possibles.length; i++){
            k = (k*this.expMod(10n,possibles[i]-possibles[i-1],x))%x;
            if(k == 1n) return possibles[i];
        }
        k = (k*this.expMod(10n,x-1n-possibles[possibles.length - 1],x))%x;
        if(k == 1n) return x-1n;
        return;
    }
    gaussianEliminator = function(mat){
        mat = mat.sort((a,b) => this.#gaussianFirstNumIndex(a)-this.#gaussianFirstNumIndex(b));
        for(let i = 0; i<mat.length - 1; i++){
            let sk = this.#gaussianFirstNumIndex(mat[i]);
            if(sk == mat[i].length) continue;
            for(let j = i+1; j<mat.length; j++){
                let diff = mat[j][sk]/mat[i][sk];
                mat[j] = this.#gaussianAddRow(mat[j],this.#gaussianMultiplyRow(mat[i],-diff));
            }
            mat = mat.sort((a,b) => this.#gaussianFirstNumIndex(a)-this.#gaussianFirstNumIndex(b));
        }
        for(let i = 0; i<mat.length; i++){
            let ind = this.#gaussianFirstNumIndex(mat[i]);
            if(ind != mat[i].length){
                let converted = 1/mat[i][ind];
                mat[i] = this.#gaussianMultiplyRow(mat[i],converted);
            }
        }
        for(let i = mat.length - 1; i > 0; i--){
            let ind = this.#gaussianFirstNumIndex(mat[i]);
            if(ind == mat[i].length) continue;
            for(let j = i-1; j>-1; j--){
                let diff = mat[j][ind]/mat[i][ind];
                mat[j] = this.#gaussianAddRow(mat[j],this.#gaussianMultiplyRow(mat[i],-diff));
            }
        }
        return mat;
    }
    gaussianEliminatorMod = function(mat,mod){
        for(let i = 0; i<mat.length; i++){
            mat[i] = this.#gaussianMultiplyRowMod(mat[i],1,mod);
        }
        mat = mat.sort((a,b) => this.#gaussianFirstNumIndex(a)-this.#gaussianFirstNumIndex(b));
        for(let i = 0; i<mat.length - 1; i++){
            let sk = this.#gaussianFirstNumIndex(mat[i]);
            if(sk == mat[i].length) continue;
            for(let j = i+1; j<mat.length; j++){
                let diff = -mat[j][sk]/mat[i][sk];
                mat[j] = this.#gaussianAddRowMod(mat[j],this.#gaussianMultiplyRowMod(mat[i],diff,mod),mod);
            }
            mat = mat.sort((a,b) => this.#gaussianFirstNumIndex(a)-this.#gaussianFirstNumIndex(b));
        }
        for(let i = 0; i<mat.length; i++){
            mat[i] = this.#gaussianMultiplyRowMod(mat[i],1,mod);
        }
        for(let i = 0; i<mat.length; i++){
            let ind = this.#gaussianFirstNumIndex(mat[i]);
            if(ind != mat[i].length){
                let converted = mat[i][ind];
                let k = 1;
                if(mat[i][ind] % mod == 0) return;
                while((converted*k + mod) % mod != 1){
                    k++;
                }
                converted = k;
                mat[i] = this.#gaussianMultiplyRowMod(mat[i],converted,mod);
            }
        }
        for(let i = mat.length - 1; i > 0; i--){
            let ind = this.#gaussianFirstNumIndex(mat[i]);
            if(ind == mat[i].length) continue;
            for(let j = i-1; j>-1; j--){
                let diff = (mat[j][ind]/mat[i][ind] + mod) % mod;
                mat[j] = this.#gaussianAddRowMod(mat[j],this.#gaussianMultiplyRowMod(mat[i],-diff,mod),mod);
            }
        }
        return mat;
    }
    regTranspose = function(mat){
        let output = [];
        for(let i = 0; i<mat[0].length; i++){
            output[i] = [];
            for(let j = 0; j<mat.length; j++){
                output[i][j] = mat[j][i];
            }
        }
        return output;
    }
    quadsieveTranspose = function(mat){
        let output = [];
        for(let i = 0; i<mat[0].length; i++){
            output[i] = [];
            for(let j = 0; j<mat.length; j++){
                output[i][j] = mat[j][i];
            }
            output[i].push(0);
        }
        return output;
    }
    #gaussianFirstNumIndex = function(row){
        let i = 0;
        while(i<row.length&&row[i]==0) i++;
        return i;
    }
    #gaussianMultiplyRow = function(mat,c){
        let n = [];
        for(let i = 0; i<mat.length; i++){
            n[i] = mat[i]*c;
        }
        return n;
    }
    #gaussianAddRow = function(mat,mat2){
        let n = [];
        for(let i = 0; i<mat.length; i++){
            n[i] = mat[i] + mat2[i];
        }
        return n;
    }
    #gaussianAddRowMod = function(mat,mat2,mod){
        let n = [];
        for(let i = 0; i<mat.length; i++){
            n[i] = (mat[i] + mat2[i] + mod) % mod;
        }
        return n;
    }
    #gaussianMultiplyRowMod = function(mat,c,mod){
        let n = [];
        for(let i = 0; i<mat.length; i++){
            n[i] = (mat[i]*c + mod) % mod;
        }
        return n;
    }
    expMod = function(a,b,mod){
        let p = 1n;
        let subp = a;
        for(let i = 0n; i<this.#logBig(b,2n)+1n;i++){
            let j = (1n << i);
            if((b & j) != 0n){
                p = (p * subp) % mod;
            }
            subp = (subp*subp)%mod;
        }
        return p;
    }
    //primes on interval function
    #generateMap = function(inp){
        let p = 1;
        for(let i = 0; i<inp.length; i++){
            p*=inp[i];
        }
        this.#universalPreProd = BigInt(p);
        let arr = new Array(p );
        for(let i = 0; i<arr.length; i++){
            arr[i] = i;
        }
        for(let i = 0; i<inp.length; i++){
            let k = inp[i];
            while(k < arr.length){
                arr[k] = - 1;
                k+=inp[i];
            }
        }
        arr.push(p+1);
        for(let i = 0; i<arr.length; i++){
            arr[i] = BigInt(arr[i]);
        }
        return arr.filter(i => i != -1).slice(2);
    }
    #fastBigFactorDynamic = function(x){ //O(sqrt(largest factor))
        if(x == 0) return {};
        let dyn = this.#universalPreProd;
        let pre = this.#universalPre;
        let poss = this.#possMap;
        let factors = {};
        for(let i = 0; i<pre.length; i++){
            if(x % pre[i] == 0n){
                let c = 0n;
                while(x % pre[i] == 0n){
                    x/=pre[i];
                    c++;
                } 
                factors[pre[i]] = c;
            }
        }
        let t = 0n;
        while(x > 1){
            for(let i = 0; i<poss.length; i++){
                let newFac = dyn*t + poss[i];
                if(x % newFac == 0n){
                    let c = 0n;
                    while(x % newFac == 0n){
                        c++;
                        x/=newFac;
                    }
                    factors[newFac] = c;
                }
            }
            t++;

            let m = dyn*t + poss[poss.length - 1];
            if(m * m > x){
                factors[x] = 1n;
                break;
            }
        }
        return factors;
    }
    bigMod = function(x,m){ 
        if(m > x) return x; 
        let t = 1n; 
        let s = 0n; 
        while(x > 0n){ 
            s += t * (x & 1n);
            t <<= 1n; 
            let d = t - m;
            if(d > 0) t = d;
            x >>= 1n; 
        }
        if(s > m<<1n) return this.bigMod(s,m);
        return s % m;
    }
    bigDiv = function(a,b){
        let d = 0n;
        let k = 32n;
        b <<= k;
        while(k >= 0n){
            if(a >= b){
                d = d | (1n<<k);
                a = a + 1n + ~b;
            }
            k--;
            b>>=1n;
        }
        return {q:d,p:a};
    }

    bigFactorial = function(x){
        let i = 1n;
        for(let k = 2n; k<x+1n; k++ ) i*=k;
        return i;
    }
    
    #euclideanGCDPair = function(a,b){
        if(a == b) return a;
        if(a > b) return this.#euclideanGCDPair(a - b, b);
        return this.#euclideanGCDPair(a, b - a);
    }
    #euclideanGCDFast = function(a,b){
        while(a != b){
            let m = Math.min(a,b);
            a = a+b - 2*m;
            b = m;
            if(a<=1 || b<=1) return 1;

        }
        return a;
    }
    BigIntMin = function(a,b){
        if(a < b) return a;
        return b;
    }
    BigIntAbs = function(n){
        if(n < 0) return -1n*n;
        return n;
    }
    #euclideanGCDFastBigInt = function(a,b){
        while(a != b){
            let o = this.BigIntAbs(a-b);;
            b = this.BigIntMin(a,b);
            a = o;
        }
        return a;
    }
    #euclideanGCDFasterBigInt = function(a,b){
        while(a != b){
            if(a == 0) return b;
            if(b == 0) return a;
            if(a > b){
                a = a % b;
            } else {
                b = b % a;
            }
        }
        return a;
    }
    #euclideanGCD = function(...nums){
        let n = this.#euclideanGCDFast(nums[0],nums[1]);
        for(let i = 2; i<nums.length; i++) n = this.#euclideanGCDFast(n,nums[i]);
        return n;
    }
    #euclideanGCDBigInt = function(...nums){
        let n = this.#euclideanGCDFastBigInt(nums[0],nums[1]);
        for(let i = 2; i<nums.length; i++) n = this.#euclideanGCDFastBigInt(n,nums[i]);
        return n;
    }
    #allDivisors = function(x){
        let divisors = [];
        for(let i = 1; i<Math.sqrt(x); i++){
            if(x/i % 1 == 0){
                divisors.push(i);
                divisors.push(x/i);
            }
        }
        if(x/Math.sqrt(x) % 1 == 0) divisors.push(Math.sqrt(x));
        return divisors;
    }

    generateSmoothNumbers = function(min, max, primes, numCount){
        let numbers = [];
        let currentNum = 1n;
        let currentFactors = (new Array(primes.length)).fill(0)
        while(numbers.length < numCount){
            let index = Math.floor(Math.random()*primes.length);
            let randomPrime = primes[index];
            if(currentFactors[index] > 0 && currentNum > max){
                currentNum /= randomPrime;
                currentFactors[index]--;
            } else if(currentNum < max){
                currentNum *= randomPrime;
                currentFactors[index]++;
            }
            if(currentNum > min && currentNum < max && !numbers.includes(currentNum)) numbers.push([currentNum,currentFactors.slice()]);
        }
        return numbers;
    }
    #pollardPolynomial = function(x){
        return x*x+1n;
    } 
    //make faster quad sieve w list of [bign,bign]]
    #pollardRhoSeparate = function(x){
        let a = 2n;
        let b = 2n;
        let g = 1n;
        while(g == 1n){
            a = this.#pollardPolynomial(a) % x;
            b = this.#pollardPolynomial(b) % x;
            b = this.#pollardPolynomial(b) % x;
            g = this.#euclideanGCDFasterBigInt(this.BigIntAbs(a-b),x);
        }
        return g;
    }
    pollardRho = function(x){
        console.log(x)
        if(x <= 5n) return [x];
        if(this.primalityTest(x)) return x;
        if((x & (x - 1n)) == 0n) return (new Array(x.toString(2).length)).fill(2n);
        let factors = [];
        while(x % 2n == 0){
            x/=2n;
            factors.push(2n);
        }
        while(x != 1n){
            console.log('s',x)
            let pr = this.#pollardRhoSeparate(x);
            if(pr == 1n) break;
            let data = [];
            if(pr == x){
                if(this.#logBig(x,10n)<10n){
                    factors.push(...Object.keys(x.factor()).map(i => i = BigInt(i)));
                } else {
                    factors.push(x);
                }
                break;
            }
            if(this.primalityTest(pr)){
                data = [pr];
            } else {
                data = this.pollardRho(pr);
            }
            while(x % pr == 0){
                x/=pr;
                factors.push(...data);
            }
            if(x == 1n) break;
            if(this.primalityTest(x)){
                factors.push(x);
                break;
            }
        }
        return factors;
    }
    primalityTest = function(x){
        if(x > 2n && x % 2n == 0) return false;
        if(x > 3n && x % 3n == 0) return false;
        let a = this.randomBigIntBig(this.#logBig(x,10n));
        while(this.#euclideanGCDFasterBigInt(a,x) != 1n) a = this.randomBigIntBig(this.#logBig(x,10n));
        let p = 1n;
        let subp = a;
        for(let i = 0n; i<this.#logBig(x,2n)+1n;i++){
            let j = (1n << i);
            if(((x-1n) & j) != 0n){
                p = (p * subp) % x;
            }
            subp = (subp*subp)%x;
        }
        return p == 1;
    }
    convertToBinaryFactors = function(x, primes){
        let factors = 0n;
        for(let j = 0; j<primes.length; j++){
            while(x % primes[j] == 0n){
                x /= primes[j];
                factors = factors ^ (1n << BigInt(j));
            }
        }
        if(x == 1n) return factors;
        return -1n;
    }
    quadraticSieveBinary = function(x){
        let residues = [];
        let xrt = sqrtBigInt(x);
        let xrtLog = this.#logBig(xrt,10n);
        let primes = firstPrimes.slice(0,75);
        for(let i = 0; i<primes.length; i++){
            let rem = primes[i]*primes[i] % x;
            let rt = sqrtBigInt(rem);
            if(rt*rt == rem) continue;
            primes[i] = '_';
        }
        primes = primes.filter(i => i != '_');
        for(let i = 0; i<100; i++){
            let k = 0;
            let res = 0;
            let factors = 0;
            while(true){
                k = xrt+this.#randomBigInt(xrtLog);
                if(k*k < x) continue;
                res = (k*k) % x;
                factors = this.convertToBinaryFactors(res, primes);
                if(factors != -1n) break;
            }
            residues.push([k,factors])
        }
        let output = this.findEvenSums(residues,-1,0n,[]);
        let prod1 = 1n;
        let prod2 = 1n;
        for(let i = 0; i<output.length; i++){
            prod1 *= output[i]*output[i] % x;
            prod2 *= output[i];
        }
        let prod3 = sqrtBigInt(prod1);
        let f1 = prod2 + prod3;
        let f2 = prod2 - prod3;
        return [this.#euclideanGCDFasterBigInt(f1,x),this.#euclideanGCDFasterBigInt(f2,x)];
    }

    quadraticSieveGaussian = function(x){
        let residues = [];
        let lnx = Number(this.#logBig(x,10n))*Math.log(10);
        let L = Math.exp(Math.sqrt(lnx*Math.log(lnx)/2));
        let primes = firstPrimes.slice(0,L);
        let rt = sqrtBigInt(x);
        let l = this.#logBig(rt,10n);
        let sk = [];
        for(let i = 0; i<primes.length; i++){
            let rem = primes[i]*primes[i] % x;
            let rt = sqrtBigInt(rem);
            if(rt*rt == rem) continue;
            primes[i] = '_';
        }
        primes = primes.filter(i => i != '_');
        
        for(let i = 0; i<primes.length/2; i++){
            let k = rt+this.#randomBigInt(l);
            if(sk.includes(k)){ i--; continue; };
            let j = (k*k)%x;
            if(j == 0n){
                return this.#euclideanGCDFasterBigInt(k,x);
            }
            let fac = this.convertToBinaryFactors(j,primes);
            if(fac == -1n){
                i--;
                continue;
            }
            let m = [k,this.convertBinaryToArray(fac,BigInt(primes.length))];
            residues.push(m);
            sk.push(k);
        }
        while(residues.length < primes.length){
            let rand = residues[Math.floor(Math.random()*residues.length)][0];
            let rp = primes[Math.floor(primes.length*(1-Math.random()**10))];
            if(rp == undefined) continue;
            let n = rand*rp;
            if(sk.includes(n)) continue;
            let j = (n*n) % x;
            if(j == 0n) return this.#euclideanGCDFasterBigInt(n,x);
            let m = [n,this.convertBinaryToArray(this.convertToBinaryFactors(j,primes),primes.length)];
            residues.push(m);
            sk.push(n);
        }
        let bigmat = residues.map(i => i = i[1]);
        let converted = this.quadsieveTranspose(bigmat);
        let solved = this.gaussianEliminatorMod(converted,2);
        
        let combinedmap =( new Array(residues.length)).fill(0);
        for(let i = 0; i<solved.length; i++){
            if(this.countHigh(solved[i]) == 0){
                for(let j = 0; j<solved[i].length; j++){
                    if(solved[i][j] == 1) combinedmap[j] = 1;
                }
            }
        }
        let p1 = 1n;
        let p2 = 1n;
        for(let i = 0; i<combinedmap.length; i++){
            if(combinedmap[i] == 1){
                p1*=residues[i][0];
                p2*=(residues[i][0]**2n)%x;
            }
        }
        let rt2 = sqrtBigInt(p2);
        let r1 = p1+rt2;
        return this.#euclideanGCDFasterBigInt(r1,x);
    }
    countHigh = function(row){
        let i = 0;
        for(let j = 0; j<row.length; j++) i+=row[j];
        return i % 2;
    }
    convertBinaryToArray(fac, s){
        let l = [];
        for(let i = 0n; i<s; i = i+1n){
            l[Number(i)] = Number(fac & 1n);
            fac = fac >> 1n;
        }
        return l;
    }


    findEvenSums = function(set, index, csum, path){
        if(csum == 0n && path.length > 0) return path;
        if(index == set.length) return -1;
        if(path.length == 5) return -1;
        let a = this.findEvenSums(set, index+1,csum,path);
        if((index > -1 && set.includes(set[index][0])) || (a != undefined && a != -1 && a.length > 0)){
            return a;
        }
        if(index > -1 && !path.includes(set[index][0])){
            let b = this.findEvenSums(set, index+1,csum^set[index][1],[...path,set[index][0]]);
            if(b != undefined && b != -1 && b.length > 0){
                return b;
            }
        }
        return -1;
    }
    quadraticSieve = function(x){
        let residues = [];
        let prod = [];
        while(prod == undefined || prod.length == 0){
            for(let i = 0; i<10; i++){
                let k = Math.round(Math.sqrt(x)*(Math.random()*2+1));
                if(!residues.includes([k,(k*k)%x])) residues.push([k,(k*k)%x]);
            }
            prod = this.findSquareProducts(residues, 1, -1, []);
        }
        let p1 = 1;
        let p2 = 1;
        let p3 = 1;
        for(let i = 0; i<prod.length; i++){
            p1*=(prod[i]**2 % x);
            p2*=prod[i];
        }
        p3 = Math.sqrt(p1);
        let f1 = p2 + p3;
        let f2 = p2 - p3;
        f1 = this.#euclideanGCDFasterBigInt(BigInt(f1),BigInt(x));
        f2 = this.#euclideanGCDFasterBigInt(BigInt(f2),BigInt(x));
        return [f1,f2];
    }
    findSquareProducts = function(set, product, index, path){
        if(Math.sqrt(product) % 1 == 0 && path.length >= 1 && product > 1) return path;
        if(index == set.length) return;
        if(index > - 1 && path.includes(set[index][0])) return this.findSquareProducts(set,product,index+1,path);
        let a = this.findSquareProducts(set, product, index+1,path);
        if(a != undefined && a.length > 0) return a;
        if(index >= 0){
            let b = this.findSquareProducts(set, product*set[index][1], index+1,[...path,set[index][0]]);
            if(b != undefined) return b;
        }
        return;
    }
    rev = function(x) {
        x = ((x >> 1) & 0x55555555) | ((x & 0x55555555) << 1);
        x = ((x >> 2) & 0x33333333) | ((x & 0x33333333) << 2);
        x = ((x >> 4) & 0x0F0F0F0F) | ((x & 0x0F0F0F0F) << 4);
        x = ((x >> 8) & 0x00FF00FF) | ((x & 0x00FF00FF) << 8);
        x = (x >>> 16) | (x << 16);
    
        return x >>> 0;
    }
    primeSieve = function(x){
        let primeProduct = 2n;
        let k = 3n;
        let primes = [];
        while(k <= x){
            let gcd = this.#euclideanGCDFasterBigInt(k,primeProduct);
            if(gcd == 1n){
                primeProduct *= k;
                primes.push(k);
            }
            k+=2n;
        }
        return primes;
    }
    eratosthenes = function(x){
        let k = (new Array(x)).fill(0);
        let i = 1;
        let primes = []
        while(i < x){
            i++;
            if(k[i] == 1) continue;
            for(let j = 2*i; j<x; j+=i) k[j] = 1;
            i++;
            primes.push(i-1);
        }
        return primes;
    }
    #allDivisorsBigInt = function(x){
        let divisors = [];
        for(let i = 1n; i*i<x+1n; i++){
            if(x % i == 0){
                divisors.push(i);
                divisors.push(x/i);
            }
        }
        return divisors;
    }
    #randomPrime = function(maxSize = 16){
        return +Object.keys((this.#randomBigInt(maxSize)).factor()).pop();
    }
    #randomBigInt = function(length = 20){
        let n = 0n;
        while(length > 19){
            n*=10n**20n;
            n+=BigInt(Math.floor(Math.random()*(10**20)))
            length-=20;
        }
        while(length > 0){
            n*=10n;
            n+=BigInt(Math.floor(Math.random()*10));
            length--;
        }
        return n;
    }
    randomBigIntBig = function(length = 20n){
        let n = 0n;
        while(length > 19n){
            n*=10n**20n;
            n+=BigInt(Math.floor(Math.random()*(10**20)))
            length-=20n;
        }
        while(length > 0n){
            n*=10n;
            n+=BigInt(Math.floor(Math.random()*10));
            length--;
        }
        return n;
    }
    #BigIntMax = function(a,b){
        if(a > b) return a;
        return b;
    }
    #BigIntMin = function(a,b){
        if(a > b) return b;
        return a;
    }
    #preTool = [2,3,5,7,11,13];
    #universalPreProd = 0;
    #universalPre = [2n,3n,5n,7n,11n,13n];
    #possMap = this.#generateMap(this.#preTool);
    #enable = function(This){
        Math.bigMax = function(a,b){ return This.#BigIntMax(a,b)};
        Math.bigMin = function(a,b){ return This.#BigIntMin(a,b)};
        Math.randomPrime = function(x = 16){ return This.#randomPrime(x) };
        Math.randomBig = function(x = 16){ return This.#randomBigInt(x)};
        Math.logBig = function(x){ return This.#logBig(x) };
        BigInt.prototype.findPeriod = function(){
            return This.#findPeriodCompositeBigInt(this);
        }
        BigInt.prototype.divisors = function(){
            return This.#allDivisorsBigInt(this);
        }
        BigInt.prototype.factor = function(count = 0){
            if(count == 0) return This.#fastBigFactorDynamic(this);
            if(count == 1) return Object.keys(This.#fastBigFactorDynamic(this));
        }
        BigInt.prototype.mod = function(x){
            return This.bigMod(this, x);
        }
        Math.factor = function(x){
            return This.#fastBigFactorDynamic(BigInt(x));
        }
        Array.prototype.gcdBigInt = function(){
            return This.#euclideanGCDBigInt(...this);
        }
        Array.prototype.gcd = function(){
            return This.#euclideanGCD(...this);
        }
        Array.prototype.lcm = function(){
            return This.lcmArrayReg(...this);
        }
        Array.prototype.add = function(array2){
            let temp = [];
            for(let i = 0; i<this.length; i++) temp[i] = this[i];
            for(let i = 0; i<this.length; i++){
                temp[i] = This.addDynamic(temp[i], array2[i]);
            }
            return temp;
        }
        Array.prototype.multiply = function(num){
            let temp = [];
            for(let i = 0; i<this.length; i++){
                if(typeof this[i] == 'number'){
                    temp[i] = this[i]*num;
                } else {
                    temp[i] = this[i].multiply(num);
                }
            }
            return temp;
        }
        Array.prototype.pow = function(exp){
            let mat = this;
            for(let i = 1; i<exp; i++) mat = mat.dot(this);
            return mat;
        }
        Array.prototype.BigIntSort = function(){
            return this.sort((a,b) => {if(a > b) {
                return 1;
              } else if (a < b){
                return -1;
              } else {
                return 0;
              }});
        }
        Array.prototype.transpose = function(){
            let temp = this;
            for(let i = 0; i<this.length; i++){
                for(let j = 0; j<this[i].length; j++){
                    temp[j][i] = this[i][j];
                }
            }
            return temp;
        }
        Array.prototype.dot = function(mat2){
            let temp = []
            for(let i = 0; i<mat2[0].length; i++){
                temp[i] = [];
                for(let j = 0; j<this[0].length; j++){
                    let val = This.multiplyDynamic(this[i][0],mat2[0][j]);
                    for(let k = 1; k<mat2.length; k++) val = This.addDynamic(val,This.multiplyDynamic(this[i][k],mat2[k][j]));
                    temp[i][j] = val;
                }
            }
            return temp;
        }
        Array.prototype.apply = function(func){
            let newMat = [];
            for(let i = 0; i<this.length; i++){
                if(typeof this[i] != 'object'){
                    newMat[i] = func(this[i]);
                } else {
                    newMat[i] = this[i].apply(func);
                }
            }
            return newMat;
        }
        Array.prototype.hadamardProduct = function(mat2){
            let newmat = [];
            for(let i = 0; i<mat2.length; i++){
                newmat[i] = [];
                for(let j = 0; j<mat2[i].length; j++){
                    newmat[i][j] = mat[i][j] * mat2[i][j];
                }
            }
            return newmat;
        }
        const originalConstructor = Array;
        window.Array = function(){
            if(arguments.length == 1){
                return originalConstructor.call(this, arguments[0]);
            } else {
                let newMat = originalConstructor(arguments[0]);
                let newArgs = [];
                for(let i = 1; i<arguments.length; i++) newArgs.push(arguments[i]);
                let next = new Array(...newArgs);
                newMat.fill(next);
                return newMat;
            }
        }
        Function.prototype.gradient = function(args){
            let grad = [];
            let mc = this(...args);
            for(let i = 0; i<args.length; i++){
                args[i] += This.dx;
                grad[i] = (this(...args) - mc)/This.dx;
                args[i] -= This.dx;
            }
            return grad;
        }
        Function.prototype.derivative = function(x){
            return this.gradient([x])[0];
        }
        Function.prototype.jacobian = function(args){
            let jacobian = [];
            let mc = this(...args).multiply(-1);
            for(let i = 0; i<args.length; i++){
                args[i] += This.dx;
                let targs = this(...args);
                let temp = targs.add(mc);
                jacobian[i] = temp.multiply(1/This.dx)
                args[i] -= This.dx;
            }
            return jacobian;
        }
        Function.prototype.composite = function(func2){
            let ogFunc = this;
            return function(){
                return ogFunc(...func2(...arguments));
            }
        }
    }
}

new mathUtils();

class extraBig {
    digs = [];
    decimals = 16;
    sign = 1;
    parseInt = function(){
        let x = 0;
        for(let i = 0; i<this.decimals+32; i++){
            if(this.digs[i] == 1){
                x+=Math.pow(2,i - this.decimals);
            }
        }
        return x*this.sign;
    }
    valueOf = this.parseInt;
    add = function(num){
        let start = [];
        let temp = this.digs;
        console.log(temp,num)
        if(num.decimals > this.decimals){
            temp = (new Array(num.decimals - this.decimals)).fill(0).concat(this.digs);
        } else {
            num.digs = (new Array(this.decimals - num.decimals)).fill(0).concat(num.digs);
        }
        num.digs.length = Math.max(temp.length,num.digs.length);
        temp.length = num.digs.length;
        let newdec = Math.max(num.decimals,this.decimals);
        let c = 0;
        for(let i = 0; i<num.digs.length; i++){
            let s = num.digs[i] + temp[i] + c;
            console.log('list',num.digs[i],temp[i],c);
            start[i] = s & 1;
            c = c & 2;
        }
        return new extraBig(start,newdec);
    }
    constructor(...args){
        switch( args[0]){
        case 'bigint':
            if(args[0] < 0){
                this.sign = -1;
                args[0]*=-1;
            }
            let m = Math.logBig(args[0],2n);
            while(m >= 0n){
                if(args[0] > (1n << m) - 1n){
                    args[0] &= ~(1n << m);
                    this.digs[m] = 1;
                } else {
                    this.digs[m] = 0;
                }
                m--;
            }
            this.decimals = 0;
            break;
        case 'number':
            if(args[0] < 0){
                this.sign = -1;
                args[0]*=-1;
            }
            let k = 64;
            while(k >= -this.decimals){
                if(args[0] >= Math.pow(2,k)){
                    this.digs[k + this.decimals] = 1;
                    args[0] -= Math.pow(2,k);
                } else {
                    this.digs[k + this.decimals] = 0;
                }
                k--;
            }
            break;
        case 'object':
            this.digs = args[0];
            this.decimals = args[1];
        break;
        }
    }
}
class mathUtils {
    dx = 1e-10;
    maxint = BigInt(2 ** 53 - 1);
    p31 = 2 ** 31;
    #maximumBrowserStack = 0;
    constructor() {
        this.#enable(this);
        function inc() {
            this.#maximumBrowserStack++;
            inc();
        }
        try {
            inc();
        } catch (e) {
            this.#maximumBrowserStack++;
        }
    }
    multiplyDynamic = function (A, B) {
        if (typeof A == 'number') return A * B;
        return A.dot(B);
    }
    addDynamic = function (A, B) {
        if (typeof A == 'number') return A + B;
        return A.add(B);
    }
    #findPeriodCompositeBigInt = function (x) {
        while (x % 5n == 0n) x /= 5n;
        while (x % 3n == 0n) x /= 3n;
        while (x % 2n == 0n) x /= 2n;
        let factors = this.pollardRho(x);
        let factorPeriods = factors.map(i => i = this.findPeriodPrimeBigIntFast(i));
        if (factorPeriods.length == 1) return factorPeriods[0];
        return this.lcmArray(...factorPeriods)
    }
    collatzSearch = function () {
        let m = 10000;
        let i = 1;
        while (i < m) {
            let t = i;
            while (t != 1) {
                if (t & 1 == 0) {
                    t /= 2;
                } else {
                    t = 3 * t + 1;
                }
                if (t < i) break;
            }
            i++;
        }
    }
    lcmArray = function (...nums) {
        let alleq = false;
        let original = this.#cloneArray(nums);
        for (let i = 0; i < nums.length; i++) {
            if (nums[i] != nums[0]) {
                alleq = false;
                break;
            }
        }
        while (alleq == false) {
            let min = this.maxint;
            let max = 0;
            let ind = 0;
            for (let i = 0; i < nums.length; i++) {
                if (nums[i] < min) { min = nums[i]; ind = i; }
                if (nums[i] > max) { max = nums[i]; }
            }
            let mult = this.#ceilBig(max - min, original[ind]);
            nums[ind] += original[ind] * mult;
            alleq = true;

            for (let i = 1; i < nums.length; i++) {
                if (nums[i] != nums[0]) {
                    alleq = false;
                    break;
                }
            }
        }
        return nums[0]
    }
    #ceilBig = function (a, b) {
        if (a < b) return 1n;
        if (b % a == 0n) return b / a;
        return b / a + 1n;
    }
    #logBig = function (x, b) {
        let p = 1n;
        let l = 0n;
        while (p < x) {
            p *= b;
            l++;
        }
        return l;
    }
    #cloneArray = function (arr) {
        let n = [];
        n.push(...arr)
        return n;
    }
    fastDivisorsPeriod = function (x) {
        let primes;
        if (x > 10n ** 5n) {
            primes = this.pollardRho(x);
            primes = primes.filter((i, v) => primes.indexOf(i) == v);
        } else {
            primes = Object.keys(x.factor()).map(i => i = BigInt(i));
        }
        primes = primes.filter(i => i > 1n);
        let currentProduct = 1n;
        let divisorsList = [];
        let divisors = (new Array(primes.length + 1)).fill(0n);
        while (divisors[primes.length] == 0 && divisors.length == primes.length + 1) {
            let index = 0;
            while (index < primes.length && currentProduct * primes[index] >= x) {
                currentProduct = currentProduct / (primes[index] ** divisors[index]);
                divisors[index] = 0n;
                index++;
            }
            if (index == primes.length || currentProduct * primes[index] > x) {
                break;

            }
            divisors[index]++;
            currentProduct *= primes[index];
            if (x % currentProduct == 0n && !divisorsList.includes(currentProduct)) divisorsList.push(currentProduct)
            if (divisorsList.length >= 2 ** primes.length) break;
        }
        return divisorsList.filter((i, v) => divisorsList.indexOf(i) == v);
    }
    findPeriodPrimeBigIntFast = function (x) {
        if (x == 1n) return 0;
        let possibles = this.fastDivisorsPeriod(x - 1n).map(i => i = BigInt(i)).BigIntSort();
        let k = this.expMod(10n, possibles[0], x);
        if (k == 1n) return possibles[0];
        for (let i = 1; i < possibles.length; i++) {
            k = (k * this.expMod(10n, possibles[i] - possibles[i - 1], x)) % x;
            if (k == 1n) return possibles[i];
        }
        k = (k * this.expMod(10n, x - 1n - possibles[possibles.length - 1], x)) % x;
        if (k == 1n) return x - 1n;
        return;
    }
    gaussianEliminator = function (mat) {
        mat = mat.sort((a, b) => this.#gaussianFirstNumIndex(a) - this.#gaussianFirstNumIndex(b));
        for (let i = 0; i < mat.length - 1; i++) {
            let sk = this.#gaussianFirstNumIndex(mat[i]);
            if (sk == mat[i].length) continue;
            for (let j = i + 1; j < mat.length; j++) {
                let diff = mat[j][sk] / mat[i][sk];
                mat[j] = this.#gaussianAddRow(mat[j], this.#gaussianMultiplyRow(mat[i], -diff));
            }
            mat = mat.sort((a, b) => this.#gaussianFirstNumIndex(a) - this.#gaussianFirstNumIndex(b));
        }
        for (let i = 0; i < mat.length; i++) {
            let ind = this.#gaussianFirstNumIndex(mat[i]);
            if (ind != mat[i].length) {
                let converted = 1 / mat[i][ind];
                mat[i] = this.#gaussianMultiplyRow(mat[i], converted);
            }
        }
        for (let i = mat.length - 1; i > 0; i--) {
            let ind = this.#gaussianFirstNumIndex(mat[i]);
            if (ind == mat[i].length) continue;
            for (let j = i - 1; j > -1; j--) {
                let diff = mat[j][ind] / mat[i][ind];
                mat[j] = this.#gaussianAddRow(mat[j], this.#gaussianMultiplyRow(mat[i], -diff));
            }
        }
        return mat;
    }
    gaussianEliminatorMod = function (mat, mod) {
        for (let i = 0; i < mat.length; i++) {
            mat[i] = this.#gaussianMultiplyRowMod(mat[i], 1, mod);
        }
        mat = mat.sort((a, b) => this.#gaussianFirstNumIndex(a) - this.#gaussianFirstNumIndex(b));
        for (let i = 0; i < mat.length - 1; i++) {
            let sk = this.#gaussianFirstNumIndex(mat[i]);
            if (sk == mat[i].length) continue;
            for (let j = i + 1; j < mat.length; j++) {
                let diff = -mat[j][sk] / mat[i][sk];
                mat[j] = this.#gaussianAddRowMod(mat[j], this.#gaussianMultiplyRowMod(mat[i], diff, mod), mod);
            }
            mat = mat.sort((a, b) => this.#gaussianFirstNumIndex(a) - this.#gaussianFirstNumIndex(b));
        }
        for (let i = 0; i < mat.length; i++) {
            mat[i] = this.#gaussianMultiplyRowMod(mat[i], 1, mod);
        }
        for (let i = 0; i < mat.length; i++) {
            let ind = this.#gaussianFirstNumIndex(mat[i]);
            if (ind != mat[i].length) {
                let converted = mat[i][ind];
                let k = 1;
                if (mat[i][ind] % mod == 0) return;
                while ((converted * k + mod) % mod != 1) {
                    k++;
                }
                converted = k;
                mat[i] = this.#gaussianMultiplyRowMod(mat[i], converted, mod);
            }
        }
        for (let i = mat.length - 1; i > 0; i--) {
            let ind = this.#gaussianFirstNumIndex(mat[i]);
            if (ind == mat[i].length) continue;
            for (let j = i - 1; j > -1; j--) {
                let diff = (mat[j][ind] / mat[i][ind] + mod) % mod;
                mat[j] = this.#gaussianAddRowMod(mat[j], this.#gaussianMultiplyRowMod(mat[i], -diff, mod), mod);
            }
        }
        return mat;
    }
    regTranspose = function (mat) {
        let output = [];
        for (let i = 0; i < mat[0].length; i++) {
            output[i] = [];
            for (let j = 0; j < mat.length; j++) {
                output[i][j] = mat[j][i];
            }
        }
        return output;
    }
    quadsieveTranspose = function (mat) {
        let output = [];
        for (let i = 0; i < mat[0].length; i++) {
            output[i] = [];
            for (let j = 0; j < mat.length; j++) {
                output[i][j] = mat[j][i];
            }
            output[i].push(0);
        }
        return output;
    }
    #gaussianFirstNumIndex = function (row) {
        let i = 0;
        while (i < row.length && row[i] == 0) i++;
        return i;
    }
    #gaussianMultiplyRow = function (mat, c) {
        let n = [];
        for (let i = 0; i < mat.length; i++) {
            n[i] = mat[i] * c;
        }
        return n;
    }
    #gaussianAddRow = function (mat, mat2) {
        let n = [];
        for (let i = 0; i < mat.length; i++) {
            n[i] = mat[i] + mat2[i];
        }
        return n;
    }
    #gaussianAddRowMod = function (mat, mat2, mod) {
        let n = [];
        for (let i = 0; i < mat.length; i++) {
            n[i] = (mat[i] + mat2[i] + mod) % mod;
        }
        return n;
    }
    #gaussianMultiplyRowMod = function (mat, c, mod) {
        let n = [];
        for (let i = 0; i < mat.length; i++) {
            n[i] = (mat[i] * c + mod) % mod;
        }
        return n;
    }
    expMod = function (a, b, mod) {
        let p = 1n;
        let subp = a;
        for (let i = 0n; i < this.#logBig(b, 2n) + 1n; i++) {
            let j = (1n << i);
            if ((b & j) != 0n) {
                p = (p * subp) % mod;
            }
            subp = (subp * subp) % mod;
        }
        return p;
    }
    //primes on interval function
    #generateMap = function (inp) {
        let p = 1;
        for (let i = 0; i < inp.length; i++) {
            p *= inp[i];
        }
        this.#universalPreProd = BigInt(p);
        let arr = new Array(p);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = i;
        }
        for (let i = 0; i < inp.length; i++) {
            let k = inp[i];
            while (k < arr.length) {
                arr[k] = - 1;
                k += inp[i];
            }
        }
        arr.push(p + 1);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = BigInt(arr[i]);
        }
        return arr.filter(i => i != -1).slice(2);
    }
    #fastBigFactorDynamic = function (x) { //O(sqrt(largest factor))
        if (x == 0) return {};
        let dyn = this.#universalPreProd;
        let pre = this.#universalPre;
        let poss = this.#possMap;
        let factors = {};
        for (let i = 0; i < pre.length; i++) {
            if (x % pre[i] == 0n) {
                let c = 0n;
                while (x % pre[i] == 0n) {
                    x /= pre[i];
                    c++;
                }
                factors[pre[i]] = c;
            }
        }
        let t = 0n;
        while (x > 1) {
            for (let i = 0; i < poss.length; i++) {
                let newFac = dyn * t + poss[i];
                if (x % newFac == 0n) {
                    let c = 0n;
                    while (x % newFac == 0n) {
                        c++;
                        x /= newFac;
                    }
                    factors[newFac] = c;
                }
            }
            t++;

            let m = dyn * t + poss[poss.length - 1];
            if (m * m > x) {
                factors[x] = 1n;
                break;
            }
        }
        return factors;
    }
    bigMod = function (x, m) {
        if (m > x) return x;
        let t = 1n;
        let s = 0n;
        while (x > 0n) {
            s += t * (x & 1n);
            t <<= 1n;
            let d = t - m;
            if (d > 0) t = d;
            x >>= 1n;
        }
        if (s > m << 1n) return this.bigMod(s, m);
        return s % m;
    }
    bigDiv = function (a, b) {
        let d = 0n;
        let k = 32n;
        b <<= k;
        while (k >= 0n) {
            if (a >= b) {
                d = d | (1n << k);
                a = a + 1n + ~b;
            }
            k--;
            b >>= 1n;
        }
        return { q: d, p: a };
    }

    bigFactorial = function (x) {
        let i = 1n;
        for (let k = 2n; k < x + 1n; k++) i *= k;
        return i;
    }

    #euclideanGCDPair = function (a, b) {
        if (a == b) return a;
        if (a > b) return this.#euclideanGCDPair(a - b, b);
        return this.#euclideanGCDPair(a, b - a);
    }
    #euclideanGCDFast = function (a, b) {
        while (a != b) {
            let m = Math.min(a, b);
            a = a + b - 2 * m;
            b = m;
            if (a <= 1 || b <= 1) return 1;

        }
        return a;
    }
    BigIntMin = function (a, b) {
        if (a < b) return a;
        return b;
    }
    BigIntAbs = function (n) {
        if (n < 0) return -n;
        return n;
    }
    #euclideanGCDFastBigInt = function (a, b) {
        while (a != b) {
            let o = this.BigIntAbs(a - b);;
            b = this.BigIntMin(a, b);
            a = o;
        }
        return a;
    }
    #euclideanGCDFasterBigInt = function (a, b) {
        while (a != b) {
            if (a == 0) return b;
            if (b == 0) return a;
            if (a > b) {
                a = a % b;
            } else {
                b = b % a;
            }
        }
        return a;
    }
    #euclideanGCD = function (...nums) {
        let n = this.#euclideanGCDFast(nums[0], nums[1]);
        for (let i = 2; i < nums.length; i++) n = this.#euclideanGCDFast(n, nums[i]);
        return n;
    }
    #euclideanGCDBigInt = function (...nums) {
        let n = this.#euclideanGCDFastBigInt(nums[0], nums[1]);
        for (let i = 2; i < nums.length; i++) n = this.#euclideanGCDFastBigInt(n, nums[i]);
        return n;
    }
    #allDivisors = function (x) {
        let divisors = [];
        for (let i = 1; i < Math.sqrt(x); i++) {
            if (x / i % 1 == 0) {
                divisors.push(i);
                divisors.push(x / i);
            }
        }
        if (x / Math.sqrt(x) % 1 == 0) divisors.push(Math.sqrt(x));
        return divisors;
    }

    generateSmoothNumbers = function (min, max, primes, numCount) {
        let numbers = [];
        let currentNum = 1n;
        let currentFactors = (new Array(primes.length)).fill(0)
        while (numbers.length < numCount) {
            let index = Math.floor(Math.random() * primes.length);
            let randomPrime = primes[index];
            if (currentFactors[index] > 0 && currentNum > max) {
                currentNum /= randomPrime;
                currentFactors[index]--;
            } else if (currentNum < max) {
                currentNum *= randomPrime;
                currentFactors[index]++;
            }
            if (currentNum > min && currentNum < max && !numbers.includes(currentNum)) numbers.push([currentNum, currentFactors.slice()]);
        }
        return numbers;
    }
    #pollardRhoSeparate = function (x) {
        let a = 2n;
        let b = 2n;
        let g = 1n;
        while (g == 1n) {
            a = (a * a + 1n) % x;
            b = (b * b + 1n) % x;
            b = (b * b + 1n) % x;
            g = this.#euclideanGCDFasterBigInt(this.BigIntAbs(a - b), x);
        }
        return g;
    }
    pollardRho = function (x, depth = 0) {
        if(depth == this.#maximumBrowserStack) return [x];
        if ((x & (x - 1n)) == 0n) return (new Array(x.toString(2).length)).fill(2n);
        let factors = [];
        while (x != 1n) {
            let pr = this.#pollardRhoSeparate(x);
            x /= pr;
            if (pr == 1n) break;
            if (this.primalityTest(pr)) {
                factors.push(pr);
            } else {
                factors.push(...this.pollardRho(pr, depth + 1));
            }
            if (x == 1n) break;
            if (this.primalityTest(x)) {
                factors.push(x);
                break;
            }
        }
        return factors;
    }
    primalityTest = function (x) {
        if (x > 2n && x % 2n == 0) return false;
        if (x > 3n && x % 3n == 0) return false;
        let a = this.randomBigIntBig(this.#logBig(x, 10n));
        while (this.#euclideanGCDFasterBigInt(a, x) != 1n) a = this.randomBigIntBig(this.#logBig(x, 10n));
        let p = 1n;
        let subp = a;
        for (let i = 0n; i < this.#logBig(x, 2n) + 1n; i++) {
            let j = (1n << i);
            if (((x - 1n) & j) != 0n) {
                p = (p * subp) % x;
            }
            subp = (subp * subp) % x;
        }
        return p == 1;
    }
    convertToBinaryFactors = function (x, primes) {
        let factors = 0n;
        for (let j = 0; j < primes.length; j++) {
            while (x % primes[j] == 0n) {
                x /= primes[j];
                factors = factors ^ (1n << BigInt(j));
            }
        }
        if (x == 1n) return factors;
        return -1n;
    }
    quadraticSieveBinary = function (x) {
        let residues = [];
        let xrt = sqrtBigInt(x);
        let xrtLog = this.#logBig(xrt, 10n);
        let primes = firstPrimes.slice(0, 75);
        for (let i = 0; i < primes.length; i++) {
            let rem = primes[i] * primes[i] % x;
            let rt = sqrtBigInt(rem);
            if (rt * rt == rem) continue;
            primes[i] = '_';
        }
        primes = primes.filter(i => i != '_');
        for (let i = 0; i < 100; i++) {
            let k = 0;
            let res = 0;
            let factors = 0;
            while (true) {
                k = xrt + this.#randomBigInt(xrtLog);
                if (k * k < x) continue;
                res = (k * k) % x;
                factors = this.convertToBinaryFactors(res, primes);
                if (factors != -1n) break;
            }
            residues.push([k, factors])
        }
        let output = this.findEvenSums(residues, -1, 0n, []);
        let prod1 = 1n;
        let prod2 = 1n;
        for (let i = 0; i < output.length; i++) {
            prod1 *= output[i] * output[i] % x;
            prod2 *= output[i];
        }
        let prod3 = sqrtBigInt(prod1);
        let f1 = prod2 + prod3;
        let f2 = prod2 - prod3;
        return [this.#euclideanGCDFasterBigInt(f1, x), this.#euclideanGCDFasterBigInt(f2, x)];
    }

    quadraticSieveGaussian = function (x) {
        let residues = [];
        let lnx = Number(this.#logBig(x, 10n)) * Math.log(10);
        let L = Math.exp(Math.sqrt(lnx * Math.log(lnx) / 2));
        let primes = firstPrimes.slice(0, L);
        let rt = sqrtBigInt(x);
        let l = this.#logBig(rt, 10n);
        let sk = [];
        for (let i = 0; i < primes.length; i++) {
            let rem = primes[i] * primes[i] % x;
            let rt = sqrtBigInt(rem);
            if (rt * rt == rem) continue;
            primes[i] = '_';
        }
        primes = primes.filter(i => i != '_');

        for (let i = 0; i < primes.length / 2; i++) {
            let k = rt + this.#randomBigInt(l);
            if (sk.includes(k)) { i--; continue; };
            let j = (k * k) % x;
            if (j == 0n) {
                return this.#euclideanGCDFasterBigInt(k, x);
            }
            let fac = this.convertToBinaryFactors(j, primes);
            if (fac == -1n) {
                i--;
                continue;
            }
            let m = [k, this.convertBinaryToArray(fac, BigInt(primes.length))];
            residues.push(m);
            sk.push(k);
        }
        while (residues.length < primes.length) {
            let rand = residues[Math.floor(Math.random() * residues.length)][0];
            let rp = primes[Math.floor(primes.length * (1 - Math.random() ** 10))];
            if (rp == undefined) continue;
            let n = rand * rp;
            if (sk.includes(n)) continue;
            let j = (n * n) % x;
            if (j == 0n) return this.#euclideanGCDFasterBigInt(n, x);
            let m = [n, this.convertBinaryToArray(this.convertToBinaryFactors(j, primes), primes.length)];
            residues.push(m);
            sk.push(n);
        }
        let bigmat = residues.map(i => i = i[1]);
        let converted = this.quadsieveTranspose(bigmat);
        let solved = this.gaussianEliminatorMod(converted, 2);

        let combinedmap = (new Array(residues.length)).fill(0);
        for (let i = 0; i < solved.length; i++) {
            if (this.countHigh(solved[i]) == 0) {
                for (let j = 0; j < solved[i].length; j++) {
                    if (solved[i][j] == 1) combinedmap[j] = 1;
                }
            }
        }
        let p1 = 1n;
        let p2 = 1n;
        for (let i = 0; i < combinedmap.length; i++) {
            if (combinedmap[i] == 1) {
                p1 *= residues[i][0];
                p2 *= (residues[i][0] ** 2n) % x;
            }
        }
        let rt2 = sqrtBigInt(p2);
        let r1 = p1 + rt2;
        return this.#euclideanGCDFasterBigInt(r1, x);
    }
    countHigh = function (row) {
        let i = 0;
        for (let j = 0; j < row.length; j++) i += row[j];
        return i % 2;
    }
    convertBinaryToArray(fac, s) {
        let l = [];
        for (let i = 0n; i < s; i = i + 1n) {
            l[Number(i)] = Number(fac & 1n);
            fac = fac >> 1n;
        }
        return l;
    }


    findEvenSums = function (set, index, csum, path) {
        if (csum == 0n && path.length > 0) return path;
        if (index == set.length) return -1;
        if (path.length == 5) return -1;
        let a = this.findEvenSums(set, index + 1, csum, path);
        if ((index > -1 && set.includes(set[index][0])) || (a != undefined && a != -1 && a.length > 0)) {
            return a;
        }
        if (index > -1 && !path.includes(set[index][0])) {
            let b = this.findEvenSums(set, index + 1, csum ^ set[index][1], [...path, set[index][0]]);
            if (b != undefined && b != -1 && b.length > 0) {
                return b;
            }
        }
        return -1;
    }
    quadraticSieve = function (x) {
        let residues = [];
        let prod = [];
        while (prod == undefined || prod.length == 0) {
            for (let i = 0; i < 10; i++) {
                let k = Math.round(Math.sqrt(x) * (Math.random() * 2 + 1));
                if (!residues.includes([k, (k * k) % x])) residues.push([k, (k * k) % x]);
            }
            prod = this.findSquareProducts(residues, 1, -1, []);
        }
        let p1 = 1;
        let p2 = 1;
        let p3 = 1;
        for (let i = 0; i < prod.length; i++) {
            p1 *= (prod[i] ** 2 % x);
            p2 *= prod[i];
        }
        p3 = Math.sqrt(p1);
        let f1 = p2 + p3;
        let f2 = p2 - p3;
        f1 = this.#euclideanGCDFasterBigInt(BigInt(f1), BigInt(x));
        f2 = this.#euclideanGCDFasterBigInt(BigInt(f2), BigInt(x));
        return [f1, f2];
    }
    findSquareProducts = function (set, product, index, path) {
        if (Math.sqrt(product) % 1 == 0 && path.length >= 1 && product > 1) return path;
        if (index == set.length) return;
        if (index > - 1 && path.includes(set[index][0])) return this.findSquareProducts(set, product, index + 1, path);
        let a = this.findSquareProducts(set, product, index + 1, path);
        if (a != undefined && a.length > 0) return a;
        if (index >= 0) {
            let b = this.findSquareProducts(set, product * set[index][1], index + 1, [...path, set[index][0]]);
            if (b != undefined) return b;
        }
        return;
    }
    rev = function (x) {
        x = ((x >> 1) & 0x55555555) | ((x & 0x55555555) << 1);
        x = ((x >> 2) & 0x33333333) | ((x & 0x33333333) << 2);
        x = ((x >> 4) & 0x0F0F0F0F) | ((x & 0x0F0F0F0F) << 4);
        x = ((x >> 8) & 0x00FF00FF) | ((x & 0x00FF00FF) << 8);
        x = (x >>> 16) | (x << 16);

        return x >>> 0;
    }
    primeSieve = function (x) {
        let primeProduct = 2n;
        let k = 3n;
        let primes = [];
        while (k <= x) {
            let gcd = this.#euclideanGCDFasterBigInt(k, primeProduct);
            if (gcd == 1n) {
                primeProduct *= k;
                primes.push(k);
            }
            k += 2n;
        }
        return primes;
    }
    eratosthenes = function (x) {
        let k = (new Array(x)).fill(0);
        let i = 1;
        let primes = []
        while (i < x) {
            i++;
            if (k[i] == 1) continue;
            for (let j = 2 * i; j < x; j += i) k[j] = 1;
            i++;
            primes.push(i - 1);
        }
        return primes;
    }
    #allDivisorsBigInt = function (x) {
        let divisors = [];
        for (let i = 1n; i * i < x + 1n; i++) {
            if (x % i == 0) {
                divisors.push(i);
                divisors.push(x / i);
            }
        }
        return divisors;
    }
    #randomPrime = function (maxSize = 16) {
        return +Object.keys((this.#randomBigInt(maxSize)).factor()).pop();
    }
    #randomBigInt = function (length = 20) {
        let n = 0n;
        while (length > 19) {
            n *= 10n ** 20n;
            n += BigInt(Math.floor(Math.random() * (10 ** 20)))
            length -= 20;
        }
        while (length > 0) {
            n *= 10n;
            n += BigInt(Math.floor(Math.random() * 10));
            length--;
        }
        return n;
    }
    randomBigIntBig = function (length = 20n) {
        let n = 0n;
        while (length > 19n) {
            n *= 10n ** 20n;
            n += BigInt(Math.floor(Math.random() * (10 ** 20)))
            length -= 20n;
        }
        while (length > 0n) {
            n *= 10n;
            n += BigInt(Math.floor(Math.random() * 10));
            length--;
        }
        return n;
    }
    #BigIntMax = function (a, b) {
        if (a > b) return a;
        return b;
    }
    #BigIntMin = function (a, b) {
        if (a > b) return b;
        return a;
    }
    #preTool = [2, 3, 5, 7, 11, 13];
    #universalPreProd = 0;
    #universalPre = [2n, 3n, 5n, 7n, 11n, 13n];
    #possMap = this.#generateMap(this.#preTool);
    #enable = function (This) {
        Math.bigMax = function (a, b) { return This.#BigIntMax(a, b) };
        Math.bigMin = function (a, b) { return This.#BigIntMin(a, b) };
        Math.randomPrime = function (x = 16) { return This.#randomPrime(x) };
        Math.randomBig = function (x = 16) { return This.#randomBigInt(x) };
        Math.logBig = function (x) { return This.#logBig(x) };
        BigInt.prototype.findPeriod = function () {
            return This.#findPeriodCompositeBigInt(this);
        }
        BigInt.prototype.divisors = function () {
            return This.#allDivisorsBigInt(this);
        }
        BigInt.prototype.factor = function (count = 0) {
            if (count == 0) return This.#fastBigFactorDynamic(this);
            if (count == 1) return Object.keys(This.#fastBigFactorDynamic(this));
        }
        BigInt.prototype.mod = function (x) {
            return This.bigMod(this, x);
        }
        Math.factor = function (x) {
            return This.#fastBigFactorDynamic(BigInt(x));
        }
        Array.prototype.gcdBigInt = function () {
            return This.#euclideanGCDBigInt(...this);
        }
        Array.prototype.gcd = function () {
            return This.#euclideanGCD(...this);
        }
        Array.prototype.lcm = function () {
            return This.lcmArrayReg(...this);
        }
        Array.prototype.add = function (array2) {
            let temp = [];
            for (let i = 0; i < this.length; i++) temp[i] = this[i];
            for (let i = 0; i < this.length; i++) {
                temp[i] = This.addDynamic(temp[i], array2[i]);
            }
            return temp;
        }
        Array.prototype.multiply = function (num) {
            let temp = [];
            for (let i = 0; i < this.length; i++) {
                if (typeof this[i] == 'number') {
                    temp[i] = this[i] * num;
                } else {
                    temp[i] = this[i].multiply(num);
                }
            }
            return temp;
        }
        Array.prototype.pow = function (exp) {
            let mat = this;
            for (let i = 1; i < exp; i++) mat = mat.dot(this);
            return mat;
        }
        Array.prototype.BigIntSort = function () {
            return this.sort((a, b) => {
                if (a > b) {
                    return 1;
                } else if (a < b) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }
        Array.prototype.transpose = function () {
            let temp = this;
            for (let i = 0; i < this.length; i++) {
                for (let j = 0; j < this[i].length; j++) {
                    temp[j][i] = this[i][j];
                }
            }
            return temp;
        }
        Array.prototype.dot = function (mat2) {
            let temp = []
            for (let i = 0; i < mat2[0].length; i++) {
                temp[i] = [];
                for (let j = 0; j < this[0].length; j++) {
                    let val = This.multiplyDynamic(this[i][0], mat2[0][j]);
                    for (let k = 1; k < mat2.length; k++) val = This.addDynamic(val, This.multiplyDynamic(this[i][k], mat2[k][j]));
                    temp[i][j] = val;
                }
            }
            return temp;
        }
        Array.prototype.apply = function (func) {
            let newMat = [];
            for (let i = 0; i < this.length; i++) {
                if (typeof this[i] != 'object') {
                    newMat[i] = func(this[i]);
                } else {
                    newMat[i] = this[i].apply(func);
                }
            }
            return newMat;
        }
        Array.prototype.hadamardProduct = function (mat2) {
            let newmat = [];
            for (let i = 0; i < mat2.length; i++) {
                newmat[i] = [];
                for (let j = 0; j < mat2[i].length; j++) {
                    newmat[i][j] = mat[i][j] * mat2[i][j];
                }
            }
            return newmat;
        }
        const originalConstructor = Array;
        window.Array = function () {
            if (arguments.length == 1) {
                return originalConstructor.call(this, arguments[0]);
            } else {
                let newMat = originalConstructor(arguments[0]);
                let newArgs = [];
                for (let i = 1; i < arguments.length; i++) newArgs.push(arguments[i]);
                let next = new Array(...newArgs);
                newMat.fill(next);
                return newMat;
            }
        }
        Function.prototype.gradient = function (args) {
            let grad = [];
            let mc = this(...args);
            for (let i = 0; i < args.length; i++) {
                args[i] += This.dx;
                grad[i] = (this(...args) - mc) / This.dx;
                args[i] -= This.dx;
            }
            return grad;
        }
        Function.prototype.derivative = function (x) {
            return this.gradient([x])[0];
        }
        Function.prototype.jacobian = function (args) {
            let jacobian = [];
            let mc = this(...args).multiply(-1);
            for (let i = 0; i < args.length; i++) {
                args[i] += This.dx;
                let targs = this(...args);
                let temp = targs.add(mc);
                jacobian[i] = temp.multiply(1 / This.dx)
                args[i] -= This.dx;
            }
            return jacobian;
        }
        Function.prototype.composite = function (func2) {
            let ogFunc = this;
            return function () {
                return ogFunc(...func2(...arguments));
            }
        }
    }
}

new mathUtils();

class extraBig {
    digs = [];
    decimals = 16;
    sign = 1;
    parseInt = function () {
        let x = 0;
        for (let i = 0; i < this.decimals + 32; i++) {
            if (this.digs[i] == 1) {
                x += Math.pow(2, i - this.decimals);
            }
        }
        return x * this.sign;
    }
    valueOf = this.parseInt;
    add = function (num) {
        let start = [];
        let temp = this.digs;
        if (num.decimals > this.decimals) {
            temp = (new Array(num.decimals - this.decimals)).fill(0).concat(this.digs);
        } else {
            num.digs = (new Array(this.decimals - num.decimals)).fill(0).concat(num.digs);
        }
        num.digs.length = Math.max(temp.length, num.digs.length);
        temp.length = num.digs.length;
        let newdec = Math.max(num.decimals, this.decimals);
        let c = 0;
        for (let i = 0; i < num.digs.length; i++) {
            let s = num.digs[i] + temp[i] + c;
            start[i] = s & 1;
            c = c & 2;
        }
        return new extraBig(start, newdec);
    }
    constructor(...args) {
        switch (args[0]) {
            case 'bigint':
                if (args[0] < 0) {
                    this.sign = -1;
                    args[0] *= -1;
                }
                let m = Math.logBig(args[0], 2n);
                while (m >= 0n) {
                    if (args[0] > (1n << m) - 1n) {
                        args[0] &= ~(1n << m);
                        this.digs[m] = 1;
                    } else {
                        this.digs[m] = 0;
                    }
                    m--;
                }
                this.decimals = 0;
                break;
            case 'number':
                if (args[0] < 0) {
                    this.sign = -1;
                    args[0] *= -1;
                }
                let k = 64;
                while (k >= -this.decimals) {
                    if (args[0] >= Math.pow(2, k)) {
                        this.digs[k + this.decimals] = 1;
                        args[0] -= Math.pow(2, k);
                    } else {
                        this.digs[k + this.decimals] = 0;
                    }
                    k--;
                }
                break;
            case 'object':
                this.digs = args[0];
                this.decimals = args[1];
                break;
        }
    }
}