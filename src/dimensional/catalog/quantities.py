import yaml
from pathlib import Path
from typing import Dict
from dimensional.core.quantities import Quantity, QuantitySchema

class QuantityRegistry:
    def __init__(self):
        self.quantities: Dict[str, Quantity] = {}
        catalog_dir = Path(__file__).parent / "data"
        self.load_quantities(catalog_dir / "quantities.yaml")

    def load_quantities(self, path: Path):
        with open(path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
            for item in data.get('quantities', []):
                schema = QuantitySchema(**item)
                q = Quantity.from_schema(schema)
                self.quantities[q.name] = q
                for alias in schema.aliases:
                    if alias not in self.quantities:  # Don't overwrite base names with aliases
                        self.quantities[alias] = q

quantity_registry = QuantityRegistry()
