import sympy as sp
from typing import Dict, List, Tuple
from dimensional.catalog.registry import DimensionlessNumberSchema

def extract_exponents(expr_str: str) -> Dict[str, sp.Rational]:
    """Extracts the exponent of each variable in a monomial expression."""
    expr_str = expr_str.replace('^', '**')
    overrides = {n: sp.Symbol(n, positive=True) for n in ['beta', 'gamma', 'alpha', 'lambda', 'nu', 'mu', 'rho', 'tau', 'sigma', 'zeta']}
    expr = sp.sympify(expr_str, locals=overrides)
    
    # We must assume positive variables for power expansion to work smoothly
    # Replace all symbols with positive versions to ensure (g*L)**(1/2) expands to g**(1/2)*L**(1/2)
    reps = {s: sp.Symbol(s.name, positive=True) for s in expr.free_symbols}
    expr = expr.xreplace(reps)
    expr = sp.expand_power_base(expr, force=True)
    
    exponents = {}
    
    # If there's an Add, just take the first argument (e.g., delta_T is better, but just in case)
    if isinstance(expr, sp.Add):
        expr = expr.args[0]
        
    factors = expr.as_powers_dict()
    for base, exp in factors.items():
        if isinstance(base, sp.Symbol):
            exponents[base.name] = sp.Rational(exp)
        elif base.is_number:
            continue
            
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
        
    return False

def match_group(group_expression: str) -> List[DimensionlessNumberSchema]:
    """Matches a group expression against known numbers in the registry."""
    from dimensional.catalog.registry import registry
    
    target_exponents = extract_exponents(group_expression)
    matches = []
    
    for num_id, schema in registry.dimensionless_numbers.items():
        # A known group might have multiple definitions, but we currently only have one "definition"
        # Wait, earlier I changed it to "definitions: List[str]", but in the YAML I only have "definition".
        # Let's support both in case we update the schema.
        defs = []
        if hasattr(schema, 'definitions') and schema.definitions:
            defs.extend(schema.definitions)
        elif hasattr(schema, 'definition') and schema.definition:
            defs.append(schema.definition)
            
        for d in defs:
            known_exponents = extract_exponents(d)
            if are_groups_equivalent(target_exponents, known_exponents):
                if schema not in matches:
                    matches.append(schema)
                break
                
    return matches

