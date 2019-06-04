import sympy as sp
from typing import List, Tuple
from dimensional.core.dimensions import BASE_DIMENSIONS
from dimensional.core.quantities import Quantity

class DimensionalMatrix:
    """
    Represents the dimensional matrix D of a set of quantities.
    Rows correspond to base dimensions (M, L, T, etc.).
    Columns correspond to variables.
    """
    def __init__(self, quantities: List[Quantity]):
        self.quantities = quantities
        self.variables = [q.name for q in quantities]
        
        # Determine which base dimensions are actually present to reduce matrix size
        active_dims = set()
        for q in quantities:
            for d in BASE_DIMENSIONS:
                if q.dimension._vector.get(d, 0) != 0:
                    active_dims.add(d)
        
        self.active_base_dimensions = [d for d in BASE_DIMENSIONS if d in active_dims]
        
        if not self.active_base_dimensions:
            self.matrix = sp.Matrix(0, len(self.variables), [])
            return

        rows = []
        for dim_name in self.active_base_dimensions:
            row = []
            for q in self.quantities:
                val = q.dimension._vector.get(dim_name, sp.Rational(0))
                row.append(val)
            rows.append(row)
            
        self.matrix = sp.Matrix(rows)

    @property
    def rank(self) -> int:
        """Exact algebraic rank of the dimensional matrix."""
        return self.matrix.rank()

    @property
    def num_variables(self) -> int:
        return len(self.variables)

    @property
    def num_groups(self) -> int:
        """By Buckingham Pi theorem, independent groups = n - r."""
        return self.num_variables - self.rank

    def nullspace(self) -> List[sp.Matrix]:
        """Returns exact basis vectors for the nullspace."""
        return self.matrix.nullspace()
