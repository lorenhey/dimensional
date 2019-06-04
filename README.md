# dimensional

`dimensional` is a computational engine for dimensional analysis, physical similarity, and scaling laws. It uses exact algebraic logic (via `SymPy`) instead of floating-point approximations to compute matrices, ranks, and nullspaces, ensuring rigorous Buckingham Pi analysis.

It is NOT just a unit converter. It is designed to understand dimensions algebraically, build similarity criteria, detect similarity conflicts, and nondimensionalize differential equations.

## Installation

This project is managed with `uv`. 

```bash
uv sync
```

## Features

- **Exact Dimensional Algebra**: Represents dimensions as vectors of SymPy rationals.
- **Buckingham Π**: Computes the exact dimensional matrix, calculates rank, and extracts an integer-reduced basis for the nullspace.
- **Similarity Solver**: Enforces physical similarity (e.g. Reynolds, Froude) and solves for required scale ratios. Detects similarity conflicts.
- **Equation Checking**: Validates mathematical expressions and equations for dimensional homogeneity.
- **Nondimensionalization**: Transforms differential and algebraic equations into dimensionless forms (e.g., retrieving the Fourier or Péclet number).

## CLI Examples

### Check an Equation
```bash
dimensional check "F = m*a"
```
```text
LEFT:  M L T^-2
RIGHT: M L T^-2
dimensionally consistent
```

### Find Pi Groups
```bash
dimensional pi rho v L F mu
```
```text
variables: 5
rank: 3
independent Pi groups: 2

Pi_1 = rho * v^2 * L^2 / F
Pi_2 = rho * v * L / mu
```

### GUI
Launch the Streamlit interface:
```bash
uv run streamlit run src/dimensional/gui/app.py
```

## Python API

```python
from dimensional.core.dimensions import Dimension
from dimensional.core.quantities import Quantity
from dimensional.equations.checker import check_equation
from dimensional.pi.builder import build_pi_groups

# ... Define quantities ...
# ... Run Buckingham Pi ...
```
