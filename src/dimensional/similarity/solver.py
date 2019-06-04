import sympy as sp
from typing import Dict, List, Tuple, Optional

class SimilarityConflictError(Exception):
    """Raised when similarity constraints cannot be simultaneously satisfied."""
    pass

class SimilaritySolver:
    def __init__(self, pi_groups_exponents: List[Dict[str, sp.Rational]]):
        """
        pi_groups_exponents: List of dictionaries mapping variable names to their exponents.
        e.g. [{'rho': 1, 'v': 1, 'L': 1, 'mu': -1}] for Reynolds.
        """
        self.groups = pi_groups_exponents
        
        # Collect all unique variables across all groups
        self.variables = set()
        for group in self.groups:
            self.variables.update(group.keys())
        self.variables = list(self.variables)

    def solve_scales(self, known_scales: Dict[str, float]) -> Dict[str, float]:
        """
        Given some known scale ratios (lambda_var = val), solve for the rest.
        Returns a dictionary of all scale ratios.
        Raises SimilarityConflictError if the known scales are inconsistent with the groups.
        """
        # We work in log-space: sum(exp_i * log(lambda_i)) = 0
        syms = sp.symbols(' '.join([f"log_L_{v}" for v in self.variables]))
        if not isinstance(syms, (list, tuple)):
            syms = [syms]
            
        var_to_sym = dict(zip(self.variables, syms))
        
        equations = []
        # Add equations for Pi groups
        for group in self.groups:
            eq = 0
            for var, exp in group.items():
                eq += exp * var_to_sym[var]
            equations.append(eq)
            
        # Add equations for known scales
        for var, scale in known_scales.items():
            if var not in var_to_sym:
                continue
            # log(scale) is the value. To keep things exact for symbolic checking,
            # we can just use the numeric log, or better, we can solve symbolically first!
            # Wait, if scales are just symbolic variables, we can just substitute them.
            # Let's solve the system algebraically.
            eq = var_to_sym[var] - sp.log(scale)
            equations.append(eq)
            
        solution = sp.linsolve(equations, syms)
        
        if not solution:
            raise SimilarityConflictError("The provided scales and similarity criteria are incompatible.")
            
        # Solution might have free variables. We can only return a concrete float dict 
        # if the system is fully determined for the variables we care about.
        # But linsolve returns a set of tuples.
        
        sol_tuple = list(solution)[0]
        
        result_scales = {}
        for var, sol_val in zip(self.variables, sol_tuple):
            if sol_val.is_number: # No free symbols
                result_scales[var] = float(sp.exp(sol_val))
            else:
                # It depends on a free variable
                result_scales[var] = None # Undetermined
                
        return result_scales
