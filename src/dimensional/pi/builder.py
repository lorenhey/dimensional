import sympy as sp
from typing import List, Dict
from dimensional.core.quantities import Quantity
from dimensional.pi.matrix import DimensionalMatrix
from dimensional.pi.canonicalization import canonicalize_basis

class PiGroup:
    """Represents a single dimensionless group (Pi group)."""
    def __init__(self, exponents: Dict[str, sp.Rational]):
        self.exponents = {k: v for k, v in exponents.items() if v != 0}
        
    def __str__(self) -> str:
        num = []
        den = []
        for var, exp in self.exponents.items():
            if exp > 0:
                num.append(f"{var}^{exp}" if exp != 1 else var)
            elif exp < 0:
                pos_exp = -exp
                den.append(f"{var}^{pos_exp}" if pos_exp != 1 else var)
                
        num_str = " * ".join(num) if num else "1"
        if den:
            den_str = " * ".join(den)
            if len(den) > 1:
                return f"{num_str} / ({den_str})"
            return f"{num_str} / {den_str}"
        return num_str
        
    def as_expression(self) -> str:
        """Returns string parseable back by sympify."""
        parts = []
        for var, exp in self.exponents.items():
            parts.append(f"{var}**({exp})")
        return " * ".join(parts)

def build_pi_groups(quantities: List[Quantity]) -> List[PiGroup]:
    """
    Computes the independent dimensionless groups for a set of quantities.
    """
    matrix = DimensionalMatrix(quantities)
    if matrix.num_groups == 0:
        return []
        
    basis = matrix.nullspace()
    canonical_basis = canonicalize_basis(basis)
    
    groups = []
    for vec in canonical_basis:
        exponents = {}
        for i, val in enumerate(vec):
            if val != 0:
                exponents[matrix.variables[i]] = val
        groups.append(PiGroup(exponents))
        
    return groups
