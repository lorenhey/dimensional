import streamlit as st
import sympy as sp
from dimensional.core.dimensions import Dimension
from dimensional.core.quantities import Quantity
from dimensional.pi.builder import build_pi_groups
from dimensional.catalog.quantities import quantity_registry
from dimensional.catalog.registry import registry
from dimensional.catalog.matcher import match_group
from dimensional.similarity.solver import SimilaritySolver

st.set_page_config(page_title="dimensional", layout="wide")
st.title("dimensional: Physical Similarity & Scaling")

tab1, tab2, tab3, tab4 = st.tabs(["Buckingham Pi", "Equation Checker", "Scaling & Similarity", "Catalog Explorer"])

def get_context():
    return {name: q.dimension for name, q in quantity_registry.quantities.items()}

with tab1:
    st.header("Buckingham Pi Theorem")
    st.write("Select variables to form dimensionless groups:")
    
    selected_vars = st.multiselect(
        "Variables",
        options=sorted(list(set(q.name for q in quantity_registry.quantities.values()))),
        default=["density", "velocity", "length", "dynamic_viscosity", "force"]
    )
    
    if selected_vars:
        quants = [quantity_registry.quantities[v] for v in selected_vars]
        groups = build_pi_groups(quants)
        
        st.subheader("Results")
        st.write(f"Number of variables: {len(quants)}")
        st.write(f"Number of independent groups: {len(groups)}")
        
        for i, g in enumerate(groups, 1):
            expr_str = str(g.as_expression())
            st.latex(f"\\Pi_{i} = " + sp.latex(sp.sympify(expr_str)))
            matches = match_group(expr_str)
            if matches:
                st.success(f"Recognized as: **{matches[0].name}**")

with tab2:
    st.header("Equation Checker")
    from dimensional.equations.checker import check_equation
    
    eq_str = st.text_input("Equation", value="force = mass * acceleration")
    if eq_str and "=" in eq_str:
        left, right = eq_str.split("=", 1)
        try:
            is_consistent, l_dim, r_dim = check_equation(left, right, get_context())
            
            col1, col2 = st.columns(2)
            col1.metric("Left Dimension", str(l_dim))
            col2.metric("Right Dimension", str(r_dim))
            
            if is_consistent:
                st.success("Dimensionally consistent!")
            else:
                st.error("Dimensionally inconsistent!")
        except Exception as e:
            st.error(f"Error: {e}")

with tab3:
    st.header("Similarity & Scaling")
    st.write("Enforce similarity criteria to find scale factors between prototype and model.")
    
    known_scales_str = st.text_input("Known scales (e.g. length=0.04 density=1)", value="length=0.04 density=1 acceleration=1")
    criterion = st.selectbox("Similarity Criterion", options=[n.name for n in registry.dimensionless_numbers.values()])
    
    if st.button("Solve Scales"):
        try:
            scales_dict = {}
            for ks in known_scales_str.split():
                if "=" in ks:
                    k, v = ks.split("=")
                    scales_dict[k] = float(v)
            
            match = next(n for n in registry.dimensionless_numbers.values() if n.name == criterion)
            from dimensional.catalog.matcher import extract_exponents
            group_exp = extract_exponents(match.definition)
            
            solver = SimilaritySolver([group_exp])
            result = solver.solve_scales(scales_dict)
            
            st.subheader("Scale Ratios ($\lambda$)")
            for var, val in result.items():
                if val is not None:
                    st.write(f"$\lambda_{{{var}}} = {val:.4g}$")
                else:
                    st.write(f"$\lambda_{{{var}}} =$ Free variable")
        except Exception as e:
            st.error(f"Error: {e}")

with tab4:
    st.header("Catalog Explorer")
    st.write("Browse the built-in library of dimensionless numbers.")
    
    for num in registry.dimensionless_numbers.values():
        with st.expander(f"{num.name} ({', '.join(num.aliases)})"):
            st.write(f"**Definition:** `{num.definition}`")
            st.write(f"**Domain:** {num.domain}")
            st.write(f"**Interpretation:** {num.interpretation}")
            if hasattr(num, 'references') and num.references:
                st.write("**References:**")
                for ref in num.references:
                    st.write(f"- {ref}")
st.sidebar.markdown("\""
# dimensional
Computational engine for dimensional analysis.
- Exact dimensional algebra
- Semantic dimensionless catalog
- Buckingham Pi with nullspace
- Similarity scale constraints
"\"")
