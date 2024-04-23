evaluator.operation = function(tree, canvas, ctx, variables){
    let v = [evaluator.evaluateEquation(tree.values[0], variables), evaluator.evaluateEquation(tree.values[1], variables)];
    if (v[0].type == 'Number' && v[1].type == 'Number') {
        switch (tree.type) {
            case '*':
                return {
                    type: 'Number', values: v[0].values * v[1].values
                };
            case '+':
                return {
                    type: 'Number', values: v[0].values + v[1].values
                };
            case '-':
                return {
                    type: 'Number', values: v[0].values - v[1].values
                };
            case '/':
                return {
                    type: 'Number', values: v[0].values / v[1].values
                };
            case '^':
                return {
                    type: 'Number', values: v[0].values ** v[1].values
                };
            case '%':
                return {
                    type: 'Number', values: v[0].values % v[1].values
                };
        }
    } else if (v[0].type == 'Complex' && v[1].type == 'Number') {
        switch (tree.type) {
            case '*':
                return {
                    type: 'Complex', values: [v[0].values[0] * v[1].values, v[0].values[1] * v[1].values]
                };
            case '+':
                return {
                    type: 'Complex', values: [v[0].values[0] + v[1].values, v[0].values[1]]
                };
            case '-':
                return {
                    type: 'Complex', values: [v[0].values[0] - v[1].values, v[0].values[1]]
                };
            case '/':
                return {
                    type: 'Complex', values: [v[0].values[0] / v[1].values, v[0].values[1] / v[1].values]
                };
            case '^':
                let x = v[0].values;
                let abs = Math.sqrt(x[0] ** 2 + x[1] ** 2) ** v[1].values;
                let angle = v[1].values * Math.atan2(x[1], x[0]);
                let nx = abs * Math.cos(angle);
                let ny = abs * Math.sin(angle);
                return {
                    type: 'Complex', values: [nx, ny]
                };
            case '%':
                return tree;
        }
    } else if (v[1].type == 'Complex' && v[0].type == 'Number') {
        switch (tree.type) {
            case '*':
                return {
                    type: 'Complex', values: [v[1].values[0] * v[0].values, v[1].values[1] * v[0].values]
                };
            case '+':
                return {
                    type: 'Complex', values: [v[1].values[0] + v[0].values, v[1].values[1]]
                };
            case '-':
                return {
                    type: 'Complex', values: [v[1].values[0] - v[0].values, v[1].values[1]]
                };
            case '/':
                let div = v[1].values[0] ** 2 + v[1].values[1] ** 2;
                return {
                    type: 'Complex', values: [v[0].values * v[1].values[0] / div, v[0].values * v[1].values[1] / div]
                }
            case '^':
                if(v[0].values == 0 || v[1].values == 1) return v[0];
                let x = powC(v[0].values, 0, v[1].values[0], v[1].values[1]);
                return {
                    type: 'Complex', values: x
                };
            case '%':
                return tree;
        }
    } else if (v[0].type == 'Complex' && v[1].type == 'Complex') {
        switch (tree.type) {
            case '*':
                let nx = v[0].values[0] * v[1].values[0] - v[0].values[1] * v[1].values[1];
                let ny = v[0].values[0] * v[1].values[1] + v[0].values[1] * v[1].values[0];
                return {
                    type: 'Complex', values: [nx, ny]
                };
            case '+':
                return {
                    type: 'Complex', values: [v[0].values[0] + v[1].values[0], v[0].values[1] + v[1].values[1]]
                };
            case '-':
                return {
                    type: 'Complex', values: [v[0].values[0] - v[1].values[0], v[0].values[1] - v[1].values[1]]
                };

            case '/':
                let div = v[1].values[0] ** 2 + v[1].values[1] ** 2;
                let newx = v[0].values[0] * v[1].values[0] + v[0].values[1] * v[1].values[1];
                let newy = -v[0].values[0] * v[1].values[1] + v[0].values[1] * v[1].values[0];
                return {
                    type: 'Complex', values: [newx / div, newy / div]
                };

            case '^':
                let x = powC(v[0].values[0], v[0].values[1], v[1].values[0], v[1].values[1]);
                return {
                    type: "Complex", values: x
                };

            case '%':
                return tree;
        }
    }
    tree.values[0] = v[0];
    tree.values[1] = v[1];
    return tree;
}