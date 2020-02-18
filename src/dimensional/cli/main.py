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

from dimensional.catalog.quantities import quantity_registry
from dimensional.catalog.matcher import match_group
from dimensional.similarity.solver import SimilaritySolver

app = typer.Typer(help="dimensional: Computational engine for dimensional analysis and scaling.")
console = Console()

def get_context() -> dict:
    return {name: q.dimension for name, q in quantity_registry.quantities.items()}

@app.command()
def check(equation: str):
    """Check dimensional homogeneity of an equation."""
    try:
        if "=" not in equation:
            console.print("[red]Error: Equation must contain '='[/red]")
            raise typer.Exit(1)
        left_str, right_str = equation.split("=", 1)
        is_consistent, left_dim, right_dim = check_equation(left_str, right_str, get_context())
        
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
        if v not in quantity_registry.quantities:
            console.print(f"[red]Error: Unknown variable '{v}'[/red]")
            raise typer.Exit(1)
        quants.append(quantity_registry.quantities[v])
        
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
        dim = solve_unknown_dimension(equation, unknown, get_context())
        console.print(f"[{unknown}] = [blue]{dim}[/blue]")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")

@app.command()
def synthesize(target: str, variables: list[str]):
    """Synthesize a power law relation for a target variable using basis variables."""
    try:
        if target not in quantity_registry.quantities:
            console.print(f"[red]Error: Unknown target variable '{target}'[/red]")
            raise typer.Exit(1)
            
        target_q = quantity_registry.quantities[target]
        var_qs = []
        for v in variables:
            if v not in quantity_registry.quantities:
                console.print(f"[red]Error: Unknown variable '{v}'[/red]")
                raise typer.Exit(1)
            var_qs.append(quantity_registry.quantities[v])
            
        sols = solve_power_law(target_q, var_qs)
        if not sols:
            console.print("[red]No dimensional combination possible.[/red]")
            return
            
        console.print(f"Found {len(sols)} basis combinations:")
        for sol in sols:
            parts = []
            for var, exp in sol.items():
                if exp == 1:
                    parts.append(var)
                else:
                    parts.append(f"{var}^{exp}")
            console.print(f"[green]{target} ∝ {' * '.join(parts)}[/green]")
            
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")

@app.command()
def recognize(expression: str):
    """Identify a dimensionless group algebraically."""
    matches = match_group(expression)
    if matches:
        for m in matches:
            console.print(f"Equivalent to: [bold green]{m.name}[/bold green] ({', '.join(m.aliases)})")
            console.print(f"Domain: {m.domain}")
            console.print(f"Interpretation: {m.interpretation}")
    else:
        console.print("[yellow]No matching dimensionless group found in the catalog.[/yellow]")
        
@app.command()
def scale(known_scales: list[str], criterion: str):
    """
    Solve similarity scales. 
    Format known scales as var=val (e.g. L=0.04 rho=1).
    Criterion should be a known group like 'Reynolds'.
    """
    from dimensional.catalog.registry import registry
    try:
        scales_dict = {}
        for ks in known_scales:
            k, v = ks.split("=")
            scales_dict[k] = float(v)
            
        # Find criterion in registry
        match = None
        for n in registry.dimensionless_numbers.values():
            if criterion.lower() == n.id.lower() or criterion.lower() in [a.lower() for a in n.aliases] or criterion.lower() in n.name.lower():
                match = n
                break
                
        if not match:
            console.print(f"[red]Error: Unknown criterion '{criterion}'[/red]")
            return
            
        # Extract exponents for solver
        from dimensional.catalog.matcher import extract_exponents
        group_exp = extract_exponents(match.definition)
        
        solver = SimilaritySolver([group_exp])
        result = solver.solve_scales(scales_dict)
        
        console.print(f"Similarity Criterion: [bold]{match.name}[/bold]")
        console.print("Scale Ratios (model / prototype):")
        for var, val in result.items():
            if val is not None:
                console.print(f"  lambda_{var} = [green]{val:.4g}[/green]")
            else:
                console.print(f"  lambda_{var} = [yellow]Undetermined (free variable)[/yellow]")
                
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")

@app.command()
def explain(expression: str):
    """Explain the dimensional composition of an expression."""
    from dimensional.core.expressions import evaluate_dimension
    try:
        dim = evaluate_dimension(expression, get_context())
        console.print(f"Expression: {expression}")
        console.print(f"Dimension:  [bold blue]{dim}[/bold blue]")
        
        # See if it matches a known quantity dimension
        matches = []
        for q in quantity_registry.quantities.values():
            if q.dimension == dim:
                if q.name not in [m.name for m in matches]:
                    matches.append(q)
                    
        if matches:
            console.print("\nCompatible quantities:")
            for m in matches:
                console.print(f"  - [green]{m.name}[/green]: {m.description}")
        else:
            console.print("\n[yellow]No known quantity matches this dimension exactly.[/yellow]")
            
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        
@app.command()
def demo():
    """Run a showcase demo of dimensional."""
    import time
    console.print("[bold cyan]=== DIMENSIONAL SHOWCASE ===[/bold cyan]")
    
    console.print("\n[bold]1. Equation Check[/bold]")
    console.print("> dimensional check 'F = m*a'")
    check("F = m*a")
    time.sleep(1)
    
    console.print("\n[bold]2. Dimensional Explain[/bold]")
    console.print("> dimensional explain 'rho * v^2 / 2'")
    explain("rho * v^2 / 2")
    time.sleep(1)
    
    console.print("\n[bold]3. Buckingham Pi (Drag case)[/bold]")
    console.print("> dimensional pi rho v L mu F")
    pi(["rho", "v", "L", "mu", "F"])
    time.sleep(1)
    
    console.print("\n[bold]4. Recognize Group[/bold]")
    console.print("> dimensional recognize 'rho*v*L/mu'")
    recognize("rho*v*L/mu")
    time.sleep(1)
    
    console.print("\n[bold]5. Similarity Scaling[/bold]")
    console.print("> dimensional scale L=0.04 rho=1 g=1 Froude")
    scale(["L=0.04", "rho=1", "g=1"], "Froude")


if __name__ == "__main__":
    app()
