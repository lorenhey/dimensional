import sympy as sp
from typing import List

def canonicalize_nullspace_vector(vec: sp.Matrix) -> sp.Matrix:
    """
    Transforms a nullspace vector into a canonical integer form.
    - Multiplies by the LCM of denominators to remove fractions.
    - Divides by the GCD of numerators to make it coprime.
    - Ensures the first non-zero element is positive.
    """
    denominators = [sp.fraction(val)[1] for val in vec]
    lcm = sp.lcm(denominators)
    
    # Scale to integers
    int_vec = vec * lcm
    
    # Extract integer values
    int_vals = [int(val) for val in int_vec]
    
    # GCD
    current_gcd = 0
    for val in int_vals:
        if val != 0:
            current_gcd = sp.gcd(current_gcd, abs(val))
            
    if current_gcd > 1:
        int_vec = int_vec / current_gcd
        
    # Ensure first non-zero is positive
    for val in int_vec:
        if val > 0:
            break
        elif val < 0:
            int_vec = -int_vec
            break
            
    return int_vec

def canonicalize_basis(basis: List[sp.Matrix]) -> List[sp.Matrix]:
    """Applies canonicalization to a list of basis vectors."""
    return [canonicalize_nullspace_vector(vec) for vec in basis]
