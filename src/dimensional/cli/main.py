import typer
from rich.console import Console
from rich.table import Table
from typing import Optional

from dimensional.core.quantities import Quantity
from dimensional.core.dimensions import Dimension
from dimensional.pi.builder import build_pi_groups
from dimensional.equations.checker import check_equation, solve_unknown_dimension
from dimensional.equations.power_law import solve_power_law
from dimensional.pi.matrix import DimensionalMatrix

app = typer.Typer(help="dimensional: Computational engine for dimensional analysis and scaling.")
console = Console()

# For v1.0, we can hardcode a small catalog in Python just to make the CLI work,
# or read from a YAML file.
# We'll just define some common ones here for the demo.
COMMON_QUANTITIES = {
    'F': Quantity('F', Dimension({'M': 1, 'L': 1, 'T': -2})),
    'rho': Quantity('rho', Dimension({'M': 1, 'L': -3})),
    'v': Quantity('v', Dimension({'L': 1, 'T': -1})),
    'L': Quantity('L', Dimension({'L': 1})),
    'mu': Quantity('mu', Dimension({'M': 1, 'L': -1, 'T': -1})),
    'g': Quantity('g', Dimension({'L': 1, 'T': -2})),
    't': Quantity('t', Dimension({'T': 1})),
    'E': Quantity('E', Dimension({'M': 1, 'L': 2, 'T': -2})),
    'm': Quantity('m', Dimension({'M': 1})),
    'a': Quantity('a', Dimension({'L': 1, 'T': -2})),
    'x': Quantity('x', Dimension({'L': 1})),
}

CONTEXT = {name: q.dimension for name, q in COMMON_QUANTITIES.items()}

@app.command()
def check(equation: str):
    """Check dimensional homogeneity of an equation."""
    try:
        if "=" not in equation:
            console.print("[red]Error: Equation must contain '='[/red]")
            raise typer.Exit(1)
        left_str, right_str = equation.split("=", 1)
        is_consistent, left_dim, right_dim = check_equation(left_str, right_str, CONTEXT)
        
        console.print(f"LEFT:  [blue]{left_dim}[/blue]")
        console.print(f"RIGHT: [blue]{right_dim}[/blue]")
        console.print()
        if is_consistent:
            console.print("[green]dimensionally consistent[/green]")
        else:
            console.print("[red]dimensionally inconsistent[/red]")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")

@app.command()
def pi(variables: list[str]):
    """Calculate independent Pi groups for a list of variables."""
    quants = []
    for v in variables:
        if v not in COMMON_QUANTITIES:
            console.print(f"[red]Error: Unknown variable '{v}'[/red]")
            raise typer.Exit(1)
        quants.append(COMMON_QUANTITIES[v])
        
    matrix = DimensionalMatrix(quants)
    groups = build_pi_groups(quants)
    
    console.print(f"variables: {matrix.num_variables}")
    console.print(f"rank: {matrix.rank}")
    console.print(f"independent Pi groups: {matrix.num_groups}")
    console.print()
    
    for i, g in enumerate(groups, 1):
        console.print(f"Pi_{i} = [green]{g}[/green]")

@app.command()
def solve_dimension(unknown: str, equation: str):
    """Solve for the required dimension of an unknown variable."""
    try:
        dim = solve_unknown_dimension(equation, unknown, CONTEXT)
        console.print(f"[{unknown}] = [blue]{dim}[/blue]")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")

if __name__ == "__main__":
    app()
