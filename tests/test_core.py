import pytest
import sympy as sp
from dimensional.core.dimensions import Dimension
from dimensional.core.quantities import Quantity
from dimensional.pi.builder import build_pi_groups
from dimensional.similarity.solver import SimilaritySolver, SimilarityConflictError
from dimensional.equations.checker import check_equation
from dimensional.equations.nondimensionalize import nondimensionalize
from dimensional.equations.power_law import solve_power_law

def test_dimensions():
    d1 = Dimension({'L': 1, 'T': -1})
    d2 = Dimension({'M': 1})
    d3 = d1 * d2
    assert d3.as_vector() == (sp.Rational(1), sp.Rational(1), sp.Rational(-1), 0, 0, 0, 0)

def test_buckingham_pi_drag():
    F = Quantity('F', Dimension({'M': 1, 'L': 1, 'T': -2}))
    rho = Quantity('rho', Dimension({'M': 1, 'L': -3}))
    v = Quantity('v', Dimension({'L': 1, 'T': -1}))
    L = Quantity('L', Dimension({'L': 1}))
    mu = Quantity('mu', Dimension({'M': 1, 'L': -1, 'T': -1}))
    
    groups = build_pi_groups([rho, v, L, F, mu])
    assert len(groups) == 2
    
def test_similarity_conflict():
    groups = [
        {'rho': 1, 'v': 1, 'L': 1, 'mu': -1},
        {'v': 1, 'g': sp.Rational('-1/2'), 'L': sp.Rational('-1/2')}
    ]
    knowns = {'rho': 1.0, 'mu': 1.0, 'g': 1.0, 'L': 1/25.0}
    solver = SimilaritySolver(groups)
    with pytest.raises(SimilarityConflictError):
        solver.solve_scales(knowns)

def test_power_law():
    T = Quantity('T', Dimension({'T': 1}))
    L = Quantity('L', Dimension({'L': 1}))
    g = Quantity('g', Dimension({'L': 1, 'T': -2}))
    sols = solve_power_law(T, [L, g])
    assert sols[0]['L'] == sp.Rational('1/2')
    assert sols[0]['g'] == sp.Rational('-1/2')

def test_equation_checker():
    ctx = {
        'F': Dimension({'M': 1, 'L': 1, 'T': -2}),
        'm': Dimension({'M': 1}),
        'a': Dimension({'L': 1, 'T': -2})
    }
    is_valid, _, _ = check_equation("F", "m*a", ctx)
    assert is_valid

def test_nondimensionalize():
    x, t = sp.symbols('x t')
    u = sp.Function('u')
    eq = sp.Derivative(u(x, t), t)
    scale_map = {'u': ('U', 'u_star'), 't': ('T', 't_star')}
    res = nondimensionalize(eq, scale_map).doit()
    # coeff of diff(u_star, t_star) should be U/T
    u_star = sp.Function('u_star')(sp.Symbol('x'), sp.Symbol('t_star'))
    term_t = sp.Derivative(u_star, sp.Symbol('t_star'))
    coeff = res.coeff(term_t)
    assert coeff == sp.Symbol('U', positive=True, constant=True) / sp.Symbol('T', positive=True, constant=True)
