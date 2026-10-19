# dimensional

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Lab-brightgreen?style=flat-square&logo=github)](https://lorenhey.github.io/dimensional/)
[![Version](https://img.shields.io/badge/version-2.2.0-blue?style=flat-square)](https://github.com/lorenhey/dimensional)
[![Python](https://img.shields.io/badge/python->=3.12-blue?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

> **Motor Computacional y Laboratorio Interactivo para Análisis Dimensional, Álgebra de Unidades, Grupos $\Pi$ de Vaschy-Buckingham y Similitud Física.**

Visita el laboratorio interactivo en tu navegador:  
👉 **[https://lorenhey.github.io/dimensional/](https://lorenhey.github.io/dimensional/)**

---

## ⚡ Características Principales

- **Laboratorio Web Interactivo (Zero-Backend)**: Aplicación web client-side SPA que ejecuta reducción de Gauss-Jordan y cálculo de espacio nulo $\ker(D)$ en JavaScript con aritmética racional pura (`BigInt`).
- **Álgebra Dimensional Exacta**: Representación de dimensiones como vectores racionales sobre las dimensiones fundamentales del Sistema Internacional ($[M], [L], [T], [\Theta], [I], [N], [J]$).
- **Teorema $\Pi$ de Buckingham**: Construye la matriz dimensional $D \in \mathbb{Q}^{m \times n}$, calcula su rango algebraico $r = \mathrm{rango}(D)$ y extrae la base canónica irreducible de $k = n - r$ grupos adimensionales independientes.
- **Verificador de Homogeneidad Dimensional**: Evalúa expresiones y ecuaciones matemáticas complejas, comprobando el principio de Fourier y detectando sumas de términos dimensionalmente incompatibles.
- **Estudio de Similitud y Leyes de Escala**: Resuelve relaciones entre modelo y prototipo ($\lambda_L, \lambda_v, \lambda_Q, \lambda_F, \lambda_P$) y diagnostica automáticamente **conflictos de similitud** (ej. Froude vs. Reynolds en hidrodinámica naval).
- **Síntesis Monomial de Leyes de Potencia**: Deduce relaciones exponenciales exactas (ej. período del péndulo simple $T \propto \sqrt{L/g}$, radio de choque nuclear de G.I. Taylor $R(t) \propto E^{1/5} \rho^{-1/5} t^{2/5}$).
- **Compendio de Números Adimensionales**: Catálogo exhaustivo de más de 20 números clásicos ($Re, Fr, Nu, Pr, Ma, We, Gr, Eu, St, Pe, Bi, Fo, Ra, Sc, Sh, Kn, Wo, C_d$) con definiciones físicas, regímenes de validez y límites asintóticos.
- **Simulador de Terminal CLI**: Emulador web interactivo con historial y comandos nativos (`check`, `pi`, `scale`, `synthesize`, `explain`, `recognize`, `demo`).

---

## 🚀 Instalación y Uso Local

Este proyecto utiliza [`uv`](https://docs.astral.sh/uv/) como gestor de paquetes de alto rendimiento.

```bash
# Clonar el repositorio
git clone https://github.com/lorenhey/dimensional.git
cd dimensional

# Instalar dependencias
uv sync
```

---

## 💻 Ejemplos de Línea de Comandos (CLI)

### 1. Verificar Homogeneidad de una Ecuación
```bash
uv run dimensional check "F = m*a"
```
```text
LEFT:  M L T^-2
RIGHT: M L T^-2

dimensionally consistent
```

### 2. Calcular Grupos Adimensionales $\Pi$ (Caso Arrastre en Esfera)
```bash
uv run dimensional pi rho v L F mu
```
```text
variables: 5
rank: 3
independent Pi groups: 2

Pi_1 = rho * v^2 * L^2 / F
Pi_2 = rho * v * L / mu
```

### 3. Explicar la Composición Dimensional de una Expresión
```bash
uv run dimensional explain "rho * v^2 / 2"
```
```text
Expression: rho * v^2 / 2
Dimension:  M L^-1 T^-2

Compatible quantities:
  - pressure: Fuerza aplicada perpendicularmente a la superficie por unidad de área.
```

### 4. Resolver Leyes de Escala y Diagnosticar Conflictos
```bash
uv run dimensional scale L=0.04 rho=1 g=1 Froude
```
```text
Similarity Criterion: Número de Froude
Scale Ratios (model / prototype):
  lambda_L = 0.04
  lambda_v = 0.2000
  lambda_t = 0.2000
  lambda_Q = 0.00032
  lambda_F = 0.000064
```

### 5. Lanzar Interfaz Gráfica Local (Streamlit)
```bash
uv run streamlit run src/dimensional/gui/app.py
```

---

## 🐍 API de Python

```python
import sympy as sp
from dimensional.core.dimensions import Dimension
from dimensional.core.quantities import Quantity
from dimensional.pi.builder import build_pi_groups
from dimensional.equations.checker import check_equation

# Definición de magnitudes
F = Quantity('F', Dimension({'M': 1, 'L': 1, 'T': -2}))
rho = Quantity('rho', Dimension({'M': 1, 'L': -3}))
v = Quantity('v', Dimension({'L': 1, 'T': -1}))
L = Quantity('L', Dimension({'L': 1}))
mu = Quantity('mu', Dimension({'M': 1, 'L': -1, 'T': -1}))

# Teorema Pi de Buckingham
grupos = build_pi_groups([rho, v, L, F, mu])
for i, g in enumerate(grupos, 1):
    print(f"Pi_{i} = {g}")
```

---

## 🧪 Validación y Tests

Para ejecutar la suite completa de pruebas unitarias:

```bash
uv run pytest
```

---

## 📜 Licencia

Distribuido bajo la Licencia MIT. Consulta `LICENSE` para más detalles.

Desarrollado con rigor ingenieril por **Loren Hey** (2026).
