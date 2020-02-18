from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from dimensional.core.dimensions import Dimension

class QuantitySchema(BaseModel):
    """
    Schema for loading quantities from YAML/JSON.
    """
    id: str
    dimension: dict[str, str | int | float]  # e.g., {'M': 1, 'L': -1, 'T': -2}
    preferred_unit: Optional[str] = None
    aliases: List[str] = []
    description: Optional[str] = None

class Quantity:
    """
    Represents a physical variable with a name, a symbol, and a specific Dimension.
    This separates the mathematical representation of dimensions from arbitrary labels.
    """
    def __init__(self, name: str, dimension: Dimension, symbol: Optional[str] = None, preferred_unit: Optional[str] = None, description: Optional[str] = None):
        self.name = name
        self.symbol = symbol or name
        self.dimension = dimension
        self.preferred_unit = preferred_unit
        self.description = description

    @classmethod
    def from_schema(cls, schema: QuantitySchema) -> 'Quantity':
        return cls(
            name=schema.id,
            dimension=Dimension(schema.dimension),  # type: ignore
            preferred_unit=schema.preferred_unit,
            description=schema.description
        )

    def __str__(self) -> str:
        return f"{self.name} [{self.dimension}]"

    def __repr__(self) -> str:
        return f"Quantity(name={self.name!r}, dimension={self.dimension!r})"
