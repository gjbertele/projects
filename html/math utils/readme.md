# Sample Usage Capabilities
Sample UI is given in sample.html. When an equation is typed into the bar, it's evaluated either as a PDE to solve, or as a normal equation to evaluate or show properties about. Any numerical output is rounded to the nearest integer and factorized, and potential closed forms for it are suggested.

# Default Samples
You can use trig functions (**sin**, **cos**, **tan**, **atan**, **acos**, and **asin**), as well as **log**, **sqrt**, **abs**, **floor**, **ceil**, and **round**. For example, try inputting **tan(3)** or **log(5)**.
To take the derivative of a function, input **Derivative(f(x))**, eg. **Derivative(x^2)**.
To plot the equation **f(x,y)=0** in 2D, use **Plot2D(f(x,y), xmin, xmax, ymin, ymax)**, eg. **Plot2D(x - y, -5, 5, -3, 3)**.
For a contour plot or a 3D graph of **f(x,y)**, use ContourPlot or Plot3D respectively, with the same arguments as Plot2D.
For a colored 3D Plot of the equation **f(x,y,z) <= w**, use **Plot5D(f(x,y,z), xmin, xmax, ymin, ymax, zmin, zmax, w)**, for example **Plot5D(x + y + z, -10, 10, -10, 10, -10, 10, -15)**.

Polynomials are also factored if entered, e.g. **x^2 - 2*x + 1** yields **(x-1)\*(x-1)**

# PDE Solver Usage
I wrote this code in 2024 so it's pretty basic, but unfortunately, there is no support for initial values as I did not know what those were when I made this in my HS sophomore year.

it approximates the solution function **f** as a polynomial in however many variables and then runs gradient descent on the coefficients, and it works well enough for simple cases.

To input a derivative, e.g. **f'(x)**, format it as **df(x)/dx**. For example, **df(x,y)/dy = x + y** is formatted as **df(x,y)/y = x + y**

When such a PDE is entered, the solution is approximated, and a secondary evaluation bar appears where **f** can be used as a real function. For example, try **f'(x) = x**, then evaluate **f(0)**, **f(0.1)**, etc...

The math.js file contains plenty of utilities not included in the UI, especially some matrix operations, various factorization algorithms, and more bigint operations.
For advanced matrix operations including some matrix calculus, check out [this project](https://github.com/gjbertele/gjbertele.github.io/tree/main/matrixSolver)
