let A = new variable(3,0);
let B = new variable(4,1);
B.modify = true;
A.coefficients[0] = 1;
B.coefficients[0] = 1;
for(let i = 1; i<standardPrecision; i++){
    A.coefficients[i] = 1;
    B.coefficients[i] = B.coefficients[i-1]/i;
}
//F(x) = G(y)

let x = new equation([A,B]);

//F(x)
let y = new term([A,B],1,x.units);
y.push(0,A)

//-G(y)
let z = new term([A,B],-2,x.units)
z.push(0,B);

x.push(y);
x.push(z);
