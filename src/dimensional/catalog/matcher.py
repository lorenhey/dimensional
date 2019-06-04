import sympy as sp
from typing import Dict, List, Tuple
from dimensional.catalog.registry import DimensionlessNumberSchema

def extract_exponents(expr_str: str) -> Dict[str, sp.Rational]:
    """Extracts the exponent of each variable in a monomial expression."""
    expr_str = expr_str.replace('^', '**')
    expr = sp.sympify(expr_str)
    
    if isinstance(expr, sp.Symbol):
        return {expr.name: sp.Rational(1)}
        
    exponents = {}
    
    if isinstance(expr, sp.Pow):
        base, exp = expr.as_base_exp()
        if isinstance(base, sp.Symbol):
            exponents[base.name] = sp.Rational(exp)
            return exponents
            
    if isinstance(expr, sp.Mul):
        for arg in expr.args:
            if isinstance(arg, sp.Symbol):
                exponents[arg.name] = exponents.get(arg.name, 0) + 1
            elif isinstance(arg, sp.Pow):
                base, exp = arg.as_base_exp()
                if isinstance(base, sp.Symbol):
                    exponents[base.name] = exponents.get(base.name, 0) + sp.Rational(exp)
    
    return {k: v for k, v in exponents.items() if v != 0}

def are_groups_equivalent(exp1: Dict[str, sp.Rational], exp2: Dict[str, sp.Rational]) -> bool:
    """Checks if two dimensionless groups are equivalent (same or inverse)."""
    # Check direct equality
    if exp1 == exp2:
        return True
        
    # Check inverse equality
    inverse_exp2 = {k: -v for k, v in exp2.items()}
    if exp1 == inverse_exp2:
        return True
        
    # Also check any power? Usually we just care about direct or inverse.
    return False
