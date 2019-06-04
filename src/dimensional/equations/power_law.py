import sympy as sp
from typing import Dict, List, Tuple
from dimensional.core.quantities import Quantity
from dimensional.pi.matrix import DimensionalMatrix

def solve_power_law(target: Quantity, variables: List[Quantity]) -> List[Dict[str, sp.Rational]]:
    """
    Finds exponents such that target is proportional to a product of the variables.
    target ∝ v1^a * v2^b ...
    Returns a list of possible exponent dictionaries (parameterized bases if degrees of freedom > 0).
    """
    # We want target * v1^(-a) * v2^(-b) ... to be dimensionless.
    # So we find the nullspace of [target, v1, v2, ...]
    all_quantities = [target] + variables
    matrix = DimensionalMatrix(all_quantities)
    
    basis = matrix.nullspace()
    
    if not basis:
        return [] # No solution
        
    # We want to express target in terms of the others.
    # So we want combinations of basis vectors where the target's exponent is not zero.
    # Let's see if there is any vector with non-zero first component.
    
    solutions = []
    
    for vec in basis:
        target_exp = vec[0]
        if target_exp != 0:
            # Scale vector so target_exp is 1
            scaled_vec = vec / target_exp
            
            # The equation is target^1 * v1^x1 * v2^x2 ... = constant
            # So target = constant * v1^(-x1) * v2^(-x2) ...
            
            exponents = {}
            for i, var in enumerate(variables):
                val = -scaled_vec[i+1]
                if val != 0:
                    exponents[var.name] = val
                    
            solutions.append(exponents)
            
    # If there are degrees of freedom, there might be multiple basis vectors.
    # A complete solution would be a particular solution + any combination of the 
    # homogeneous solutions (where target_exp == 0).
    # For now, we return the particular solutions found in the basis.
    
    return solutions
