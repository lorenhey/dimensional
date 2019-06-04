import operator
from typing import Dict, Optional, Tuple, Any, Union
import sympy as sp

# Base dimensions for SI (can be extended or made configurable)
BASE_DIMENSIONS = ('M', 'L', 'T', 'Theta', 'I', 'N', 'J')

class Dimension:
    """
    Exact algebraic representation of a physical dimension.
    Uses SymPy rationals to avoid floating point errors in exponents.
    """
    __slots__ = ('_vector',)

    def __init__(self, vector: Optional[Dict[str, Union[int, str, sp.Rational]]] = None):
        """
        Initialize a dimension with a dictionary of exponents.
        Example: Dimension({'M': 1, 'L': -3}) for density.
        """
        self._vector: Dict[str, sp.Rational] = {}
        if vector:
            for k, v in vector.items():
                if k not in BASE_DIMENSIONS:
                    raise ValueError(f"Unknown base dimension: {k}")
                # Parse to SymPy Rational exactly
                val = sp.Rational(v)
                if val != 0:
                    self._vector[k] = val

    @classmethod
    def from_vector(cls, vec: Tuple[sp.Rational, ...]) -> 'Dimension':
        """Create from a tuple corresponding to BASE_DIMENSIONS."""
        if len(vec) != len(BASE_DIMENSIONS):
            raise ValueError(f"Vector length must be {len(BASE_DIMENSIONS)}")
        d = cls()
        for i, name in enumerate(BASE_DIMENSIONS):
            if vec[i] != 0:
                d._vector[name] = sp.Rational(vec[i])
        return d

    def as_vector(self) -> Tuple[sp.Rational, ...]:
        """Return the exponents as a tuple corresponding to BASE_DIMENSIONS."""
        return tuple(self._vector.get(name, sp.Rational(0)) for name in BASE_DIMENSIONS)

    @classmethod
    def dimensionless(cls) -> 'Dimension':
        return cls()
        
    @property
    def is_dimensionless(self) -> bool:
        return len(self._vector) == 0

    def __mul__(self, other: Any) -> 'Dimension':
        if not isinstance(other, Dimension):
            if isinstance(other, (int, float, sp.Number)) and other == 1:
                return Dimension(self._vector) # Multiplying by 1 is allowed
            raise TypeError("Can only multiply Dimension by Dimension")
        
        new_vec = {}
        all_keys = set(self._vector.keys()) | set(other._vector.keys())
        for k in all_keys:
            val = self._vector.get(k, sp.Rational(0)) + other._vector.get(k, sp.Rational(0))
            if val != 0:
                new_vec[k] = val
        return Dimension(new_vec)

    def __truediv__(self, other: 'Dimension') -> 'Dimension':
        if not isinstance(other, Dimension):
            raise TypeError("Can only divide Dimension by Dimension")
            
        new_vec = {}
        all_keys = set(self._vector.keys()) | set(other._vector.keys())
        for k in all_keys:
            val = self._vector.get(k, sp.Rational(0)) - other._vector.get(k, sp.Rational(0))
            if val != 0:
                new_vec[k] = val
        return Dimension(new_vec)

    def __pow__(self, power: Union[int, str, sp.Rational]) -> 'Dimension':
        power = sp.Rational(power)
        if power == 0:
            return Dimension.dimensionless()
            
        new_vec = {}
        for k, v in self._vector.items():
            val = v * power
            if val != 0:
                new_vec[k] = val
        return Dimension(new_vec)

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, Dimension):
            return False
        return self._vector == other._vector

    def __str__(self) -> str:
        if self.is_dimensionless:
            return "1"
            
        parts = []
        for name in BASE_DIMENSIONS:
            if name in self._vector:
                exp = self._vector[name]
                if exp == 1:
                    parts.append(name)
                else:
                    parts.append(f"{name}^{exp}")
        return " ".join(parts)

    def __repr__(self) -> str:
        return f"Dimension({self._vector})"
