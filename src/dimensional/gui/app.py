import streamlit as st
import sympy as sp
from dimensional.core.dimensions import Dimension
from dimensional.core.quantities import Quantity
from dimensional.pi.builder import build_pi_groups
from dimensional.cli.main import COMMON_QUANTITIES

st.set_page_config(page_title="dimensional", layout="wide")

st.title("dimensional: Physical Similarity & Scaling")

tab1, tab2, tab3 = st.tabs(["Buckingham Pi", "Equation Checker", "Scaling & Similarity"])

with tab1:
    st.header("Buckingham Pi Theorem")
    st.write("Select variables to form dimensionless groups:")
    
    selected_vars = st.multiselect(
        "Variables",
        options=list(COMMON_QUANTITIES.keys()),
        default=["rho", "v", "L", "mu", "F"]
    )
    
    if selected_vars:
        quants = [COMMON_QUANTITIES[v] for v in selected_vars]
        groups = build_pi_groups(quants)
        
        st.subheader("Results")
        st.write(f"Number of variables: {len(quants)}")
        st.write(f"Number of independent groups: {len(groups)}")
        
        for i, g in enumerate(groups, 1):
            st.latex(f"\\Pi_{i} = " + sp.latex(sp.sympify(g.as_expression())))

with tab2:
    st.header("Equation Checker")
    from dimensional.equations.checker import check_equation
    
    eq_str = st.text_input("Equation", value="F = m * a")
    if eq_str and "=" in eq_str:
        left, right = eq_str.split("=", 1)
        try:
            is_consistent, l_dim, r_dim = check_equation(left, right, {k: v.dimension for k, v in COMMON_QUANTITIES.items()})
            
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
    st.info("Scaling constraint solver is available in the Python API.")
    st.write("Example: If we enforce Froude similarity:")
    st.latex(r"Fr_m = Fr_p \implies \lambda_v = \sqrt{\lambda_L}")

st.sidebar.markdown("""
# dimensional
Computational engine for dimensional analysis.
- Exact dimensional algebra
- Nullspace based Pi groups
- Similarity scale constraints
""")
