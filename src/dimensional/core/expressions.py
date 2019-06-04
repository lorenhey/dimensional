import sympy as sp
from typing import Dict, Union, Callable
from dimensional.core.dimensions import Dimension

class DimensionMismatchError(Exception):
    """Raised when an expression is dimensionally inconsistent."""
    pass

def evaluate_dimension(expr_str: str, context: Dict[str, Dimension]) -> Dimension:
    """
    Parses a mathematical expression and evaluates its dimensional validity.
    
    Args:
        expr_str: A mathematical expression string (e.g., "rho * v^2 / 2").
        context: A dictionary mapping variable names to their Dimensions.
        
    Returns:
        The resulting Dimension of the expression.
        
    Raises:
        DimensionMismatchError: If there's an addition of incompatible dimensions,
                              or a function argument is not dimensionless.
    """
    # Replace ^ with ** for python/sympy compatibility
    expr_str = expr_str.replace('^', '**')
    
    # Parse without evaluating arithmetic so we can inspect nodes
    expr = sp.sympify(expr_str, evaluate=False)
    
    return _eval_node(expr, context)

def _eval_node(node: sp.Expr, context: Dict[str, Dimension]) -> Dimension:
    if isinstance(node, sp.Symbol):
        name = node.name
        if name in context:
            return context[name]
        # Constants like pi, E
        if str(node) in ('pi', 'E', 'I'):
            return Dimension.dimensionless()
        raise ValueError(f"Unknown variable: {name}")
        
    elif isinstance(node, sp.Number):
        return Dimension.dimensionless()
        
    elif isinstance(node, sp.Add):
        # All terms in an addition must have the exact same dimension
        dims = [_eval_node(arg, context) for arg in node.args]
        first_dim = dims[0]
        for i, d in enumerate(dims[1:], 1):
            if d != first_dim:
                raise DimensionMismatchError(
                    f"Dimension mismatch in addition: term 1 is {first_dim}, term {i+1} is {d}"
                )
        return first_dim
        
    elif isinstance(node, sp.Mul):
        result = Dimension.dimensionless()
        for arg in node.args:
            result = result * _eval_node(arg, context)
        return result
        
    elif isinstance(node, sp.Pow):
        base_dim = _eval_node(node.base, context)
        exp_node = node.exp
        
        # Exponent can be a number or an expression, but it MUST evaluate to dimensionless
        exp_dim = _eval_node(exp_node, context)
        if not exp_dim.is_dimensionless:
            raise DimensionMismatchError(f"Exponent must be dimensionless, got {exp_dim}")
            
        # Try to evaluate the exponent to a float/rational
        # We need a numeric value to raise the dimension to that power
        try:
            # We use evalf but we want an exact rational if possible
            # sympify can evaluate it if we substitute symbols that have values
            # For simplicity, if exp is a symbol and we didn't raise earlier, it must be dimensionless
            # But we need its VALUE. If it's just variables, we can't do it unless we know their values.
            # In dimensional analysis, exponents are usually numbers.
            # Let's see if it's purely numeric
            val = sp.Rational(exp_node.evalf())
            return base_dim ** val
        except TypeError:
            raise DimensionMismatchError(
                f"Cannot compute dimensional power with non-constant exponent: {exp_node}"
            )
            
    elif isinstance(node, sp.Function):
        # e.g., sin, cos, log, exp
        # Arguments must be dimensionless
        for arg in node.args:
            arg_dim = _eval_node(arg, context)
            if not arg_dim.is_dimensionless:
                func_name = node.func.__name__
                raise DimensionMismatchError(
                    f"Argument to {func_name} must be dimensionless, got {arg_dim}"
                )
        return Dimension.dimensionless()
        
    elif isinstance(node, sp.Derivative):
        # d(expr) / d(var) -> dim(expr) / dim(var)
        expr_dim = _eval_node(node.expr, context)
        vars_dims = Dimension.dimensionless()
        for var, count in node.variable_count:
            var_dim = _eval_node(var, context)
            vars_dims = vars_dims * (var_dim ** count)
        return expr_dim / vars_dims
        
    elif isinstance(node, sp.Integral):
        # int expr d(var) -> dim(expr) * dim(var)
        expr_dim = _eval_node(node.function, context)
        vars_dims = Dimension.dimensionless()
        for limit in node.limits:
            var = limit[0]
            var_dim = _eval_node(var, context)
            vars_dims = vars_dims * var_dim
        return expr_dim * vars_dims

    # Fallback
    raise NotImplementedError(f"Unsupported expression node: {type(node)}")
