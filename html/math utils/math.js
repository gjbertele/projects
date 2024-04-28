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
        let factors = x.factor(1); 
        let factorPeriods = factors.map(i => i = this.#findPeriodPrimeBigIntFast(i)); 
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
    #findPeriodPrimeBigIntFast = function(x){
        let possibles = (x - 1n).divisors().BigIntSort();
        let k = 10n;
        let p = 0n;
        for(let i = 0n; i<possibles.length; i++){
           while(p < possibles[i]){
                k = k % x;
                k*=10n;
                p++;
            }
            if(k == 10n) return possibles[i];
        }
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
    BigIntAbs = function(x){
        let s = n >>> 31;
        n ^= n >> 31;

        let c = (n & s) << 1;
        for(let i = 0; i<30; i++) c = ((n ^= s) & (s = c)) << 1;
        n ^= s;

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
    rev = function(x) {
        x = ((x >> 1) & 0x55555555) | ((x & 0x55555555) << 1);
        x = ((x >> 2) & 0x33333333) | ((x & 0x33333333) << 2);
        x = ((x >> 4) & 0x0F0F0F0F) | ((x & 0x0F0F0F0F) << 4);
        x = ((x >> 8) & 0x00FF00FF) | ((x & 0x00FF00FF) << 8);
        x = (x >>> 16) | (x << 16);
    
        return x >>> 0;
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