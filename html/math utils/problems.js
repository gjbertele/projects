let A = new variable(2);
let B = new variable(3);
B.modify = false;
A.coefficients[0] = 1;
B.coefficients[0] = 1;
for(let i = 1; i<standardPrecision; i++){
    A.coefficients[i] = Math.random()*2 - 1;
    B.coefficients[i] = B.coefficients[i-1]/i;
}
//A'^2 = 3 
//A'^2 - 3 = 0
let x = new equation([A,B]);

//A'^2
let y = new term([A,B],1,x.units);
y.push(1,2)
y.push(1,2)

//-3
let z = new term([A,B],-3,x.units)
z.push(0,0);

x.push(y);
x.push(z);
