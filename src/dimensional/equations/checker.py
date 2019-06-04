import sympy as sp
from typing import Dict, Optional, Tuple
from dimensional.core.dimensions import Dimension
from dimensional.core.expressions import evaluate_dimension

def check_equation(left_str: str, right_str: str, context: Dict[str, Dimension]) -> Tuple[bool, Dimension, Dimension]:
    """
    Checks if an equation is dimensionally consistent.
    Returns (is_consistent, left_dim, right_dim).
    """
    left_dim = evaluate_dimension(left_str, context)
    right_dim = evaluate_dimension(right_str, context)
    return left_dim == right_dim, left_dim, right_dim

def solve_unknown_dimension(equation_str: str, unknown_var: str, context: Dict[str, Dimension]) -> Dimension:
    """
    Solves for the dimension of an unknown variable in an equation.
    e.g. solve_unknown_dimension("F = k * x", "k", {'F': dimF, 'x': dimX})
    """
    if "=" not in equation_str:
        raise ValueError("Equation must contain '='")
        
    left_str, right_str = equation_str.split("=", 1)
    
    # We can inject a dummy Dimension for the unknown.
    # Wait, we need to solve for it.
    # We can evaluate the expression with the unknown treated as a symbolic Dimension?
    # No, evaluate_dimension expects concrete Dimension objects.
    
    # Alternative:
    # 1. Substitute all KNOWN variables with their dimensional representations in terms of M, L, T...
    # 2. Treat the UNKNOWN variable as a SymPy symbol.
    # 3. Solve the equation!
    # Because dimensions just multiply and divide, if we take log() of both sides, it's a linear equation!
    # Or simpler: isolate the unknown using sympy!
    
    left_expr = sp.sympify(left_str.replace('^', '**'), evaluate=False)
    right_expr = sp.sympify(right_str.replace('^', '**'), evaluate=False)
    
    # Create an equation
    eq = sp.Eq(left_expr, right_expr)
    
    # Solve for the unknown symbol
    unknown_sym = sp.Symbol(unknown_var)
    solutions = sp.solve(eq, unknown_sym)
    
    if not solutions:
        raise ValueError(f"Could not solve equation for {unknown_var}")
        
    # Take the first solution (since dimensional equations are usually monomials)
    sol_expr = solutions[0]
    
    # Now evaluate the dimension of this solution expression!
    return evaluate_dimension(str(sol_expr), context)
