import sympy as sp
from typing import Dict, Tuple

def nondimensionalize(expr: sp.Expr, scale_map: Dict[str, Tuple[str, str]]) -> sp.Expr:
    """
    Substitutes variables with (Scale * DimensionlessVar).
    scale_map: dict mapping original variable name -> (ScaleSymbolName, DimensionlessVarName)
    e.g. {'x': ('L', 'x_star'), 'u': ('U', 'u_star')}
    """
    
    # Create symbols
    subs_dict = {}
    deriv_subs = {}
    
    for var, (scale, star) in scale_map.items():
        var_sym = sp.Symbol(var)
        scale_sym = sp.Symbol(scale, positive=True, constant=True)
        # If the variable was a function in the original expression, we need to handle it.
        # But for simplicity let's treat everything as symbols first.
        # Wait, if it's a function u(x,t), sympy treats it differently.
        # Let's assume standard symbols for algebraic, and handle Derivative specifically.
        
        star_sym = sp.Symbol(star)
        
        subs_dict[var_sym] = scale_sym * star_sym
        
        # For derivatives, we map the original variable to its scale and star symbol
        deriv_subs[var_sym] = (scale_sym, star_sym)

    # We need a custom recursive function to handle Derivatives correctly
    def _process_node(node: sp.Expr) -> sp.Expr:
        if isinstance(node, sp.Derivative):
            new_expr = _process_node(node.expr)
            new_vars = []
            scale_factor = sp.Integer(1)
            
            for var, count in node.variable_count:
                if var in deriv_subs:
                    scale, star = deriv_subs[var]
                    new_vars.append((star, count))
                    scale_factor *= (scale ** count)
                else:
                    new_vars.append((var, count))
                    
            return sp.Derivative(new_expr, *new_vars) / scale_factor
            
        elif isinstance(node, sp.Function):
            # If it's an applied undefined function like u(x, t)
            func_name = node.func.__name__
            if func_name in scale_map:
                scale_str, star_str = scale_map[func_name]
                scale_sym = sp.Symbol(scale_str, positive=True, constant=True)
                
                # Create the new function
                new_func = sp.Function(star_str)
                # Process arguments: map them directly to their star versions
                new_args = []
                for arg in node.args:
                    if isinstance(arg, sp.Symbol) and arg.name in scale_map:
                        new_args.append(sp.Symbol(scale_map[arg.name][1]))
                    else:
                        new_args.append(_process_node(arg))
                        
                return scale_sym * new_func(*new_args)
            else:
                new_args = [_process_node(arg) for arg in node.args]
                return node.func(*new_args)
                
        elif isinstance(node, sp.Symbol):
            if node.name in scale_map:
                scale_str, star_str = scale_map[node.name]
                return sp.Symbol(scale_str, positive=True, constant=True) * sp.Symbol(star_str)
            return node
            
        elif getattr(node, 'is_Atom', False):
            return node
            
        else:
            # Reconstruct the node with processed args
            new_args = [_process_node(arg) for arg in node.args]
            return node.func(*new_args)

    result = _process_node(expr)
    # Simplify might help group the scale factors
    # We want to pull out the constants.
    return result

