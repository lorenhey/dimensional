/**
 * dimensional - Motor computacional exacto para análisis dimensional,
 * álgebra de dimensiones, teorema Pi de Buckingham y similitud física.
 * Loren Hey - Antigravity
 */

class Rational {
    constructor(num = 0n, den = 1n) {
        if (num instanceof Rational) {
            this.num = num.num;
            this.den = num.den;
            return;
        }
        if (typeof num === 'number') num = BigInt(Math.round(num));
        else if (typeof num === 'string') num = BigInt(num.trim());
        
        if (typeof den === 'number') den = BigInt(Math.round(den));
        else if (typeof den === 'string') den = BigInt(den.trim());

        if (den === 0n) throw new Error("División por cero en Rational.");
        if (den < 0n) {
            num = -num;
            den = -den;
        }
        const g = Rational.gcd(Rational.abs(num), den);
        this.num = num / g;
        this.den = den / g;
    }

    static gcd(a, b) {
        a = Rational.abs(a);
        b = Rational.abs(b);
        while (b !== 0n) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    static lcm(a, b) {
        if (a === 0n || b === 0n) return 0n;
        return Rational.abs(a * b) / Rational.gcd(a, b);
    }

    static abs(n) {
        return n < 0n ? -n : n;
    }

    static fromNumber(val) {
        if (Number.isInteger(val)) return new Rational(BigInt(val), 1n);
        const s = val.toString();
        const parts = s.split('.');
        if (parts.length === 1) return new Rational(BigInt(parts[0]), 1n);
        const decPlaces = parts[1].length;
        const den = 10n ** BigInt(decPlaces);
        const num = BigInt(parts[0]) * den + (val < 0 ? -BigInt(parts[1]) : BigInt(parts[1]));
        return new Rational(num, den);
    }

    add(o) {
        const other = o instanceof Rational ? o : Rational.fromNumber(o);
        return new Rational(this.num * other.den + other.num * this.den, this.den * other.den);
    }

    sub(o) {
        const other = o instanceof Rational ? o : Rational.fromNumber(o);
        return new Rational(this.num * other.den - other.num * this.den, this.den * other.den);
    }

    mul(o) {
        const other = o instanceof Rational ? o : Rational.fromNumber(o);
        return new Rational(this.num * other.num, this.den * other.den);
    }

    div(o) {
        const other = o instanceof Rational ? o : Rational.fromNumber(o);
        if (other.isZero()) throw new Error("División por cero.");
        return new Rational(this.num * other.den, this.den * other.num);
    }

    neg() {
        return new Rational(-this.num, this.den);
    }

    isZero() {
        return this.num === 0n;
    }

    isPositive() {
        return this.num > 0n;
    }

    isNegative() {
        return this.num < 0n;
    }

    eq(o) {
        const other = o instanceof Rational ? o : Rational.fromNumber(o);
        return this.num === other.num && this.den === other.den;
    }

    toNumber() {
        return Number(this.num) / Number(this.den);
    }

    toString() {
        if (this.den === 1n) return this.num.toString();
        return `${this.num}/${this.den}`;
    }

    toLatex() {
        if (this.den === 1n) return this.num.toString();
        if (this.num < 0n) return `-\\frac{${-this.num}}{${this.den}}`;
        return `\\frac{${this.num}}{${this.den}}`;
    }
}

class Dimension {
    constructor(vector = {}) {
        this._vector = {};
        for (const [k, v] of Object.entries(vector)) {
            let rat;
            if (v instanceof Rational) rat = v;
            else if (typeof v === 'number') rat = Rational.fromNumber(v);
            else if (typeof v === 'string') {
                if (v.includes('/')) {
                    const [n, d] = v.split('/');
                    rat = new Rational(n, d);
                } else {
                    rat = Rational.fromNumber(parseFloat(v));
                }
            } else if (typeof v === 'bigint') {
                rat = new Rational(v, 1n);
            }
            if (rat && !rat.isZero()) {
                this._vector[k] = rat;
            }
        }
    }

    static dimensionless() {
        return new Dimension();
    }

    isDimensionless() {
        return Object.keys(this._vector).length === 0;
    }

    get(dimName) {
        return this._vector[dimName] || new Rational(0n);
    }

    mul(other) {
        if (!(other instanceof Dimension)) throw new TypeError("Solo se pueden multiplicar Dimensiones entre sí.");
        const newVec = { ...this._vector };
        for (const [k, v] of Object.entries(other._vector)) {
            const cur = newVec[k] || new Rational(0n);
            const sum = cur.add(v);
            if (sum.isZero()) delete newVec[k];
            else newVec[k] = sum;
        }
        return new Dimension(newVec);
    }

    div(other) {
        if (!(other instanceof Dimension)) throw new TypeError("Solo se pueden dividir Dimensiones entre sí.");
        const newVec = { ...this._vector };
        for (const [k, v] of Object.entries(other._vector)) {
            const cur = newVec[k] || new Rational(0n);
            const diff = cur.sub(v);
            if (diff.isZero()) delete newVec[k];
            else newVec[k] = diff;
        }
        return new Dimension(newVec);
    }

    pow(exponent) {
        const exp = exponent instanceof Rational ? exponent : Rational.fromNumber(exponent);
        if (exp.isZero()) return Dimension.dimensionless();
        const newVec = {};
        for (const [k, v] of Object.entries(this._vector)) {
            const prod = v.mul(exp);
            if (!prod.isZero()) newVec[k] = prod;
        }
        return new Dimension(newVec);
    }

    eq(other) {
        if (!(other instanceof Dimension)) return false;
        const keys1 = Object.keys(this._vector);
        const keys2 = Object.keys(other._vector);
        if (keys1.length !== keys2.length) return false;
        for (const k of keys1) {
            const v1 = this._vector[k];
            const v2 = other._vector[k];
            if (!v2 || !v1.eq(v2)) return false;
        }
        return true;
    }

    toString() {
        if (this.isDimensionless()) return "[1]";
        const order = ['M', 'L', 'T', 'Theta', 'I', 'N', 'J'];
        const parts = [];
        for (const d of order) {
            if (this._vector[d]) {
                const exp = this._vector[d];
                if (exp.eq(new Rational(1n))) parts.push(d);
                else parts.push(`${d}^(${exp.toString()})`);
            }
        }
        return `[${parts.join(' ')}]`;
    }

    toLatex() {
        if (this.isDimensionless()) return "1";
        const order = [
            { k: 'M', s: '\\mathsf{M}' },
            { k: 'L', s: '\\mathsf{L}' },
            { k: 'T', s: '\\mathsf{T}' },
            { k: 'Theta', s: '\\Theta' },
            { k: 'I', s: '\\mathsf{I}' },
            { k: 'N', s: '\\mathsf{N}' },
            { k: 'J', s: '\\mathsf{J}' }
        ];
        const parts = [];
        for (const d of order) {
            if (this._vector[d.k]) {
                const exp = this._vector[d.k];
                if (exp.eq(new Rational(1n))) parts.push(d.s);
                else parts.push(`${d.s}^{${exp.toLatex()}}`);
            }
        }
        return parts.join(' \\, ');
    }
}

class DimensionalMatrix {
    constructor(quantities) {
        this.quantities = quantities; // Array of { id, symbol, name, dimension: Dimension }
        this.variables = quantities.map(q => q.symbol || q.id);

        // Find active dimensions
        const activeSet = new Set();
        const baseOrder = ['M', 'L', 'T', 'Theta', 'I', 'N', 'J'];
        for (const q of quantities) {
            for (const d of baseOrder) {
                if (q.dimension.get(d) && !q.dimension.get(d).isZero()) {
                    activeSet.add(d);
                }
            }
        }
        this.activeDimensions = baseOrder.filter(d => activeSet.has(d));

        // Build raw matrix of Rational
        this.rawMatrix = [];
        for (const dim of this.activeDimensions) {
            const row = [];
            for (const q of quantities) {
                row.push(q.dimension.get(dim));
            }
            this.rawMatrix.push(row);
        }

        this.m = this.activeDimensions.length;
        this.n = this.quantities.length;

        // Perform RREF and compute rank and nullspace
        this.analysis = this.computeNullspace();
    }

    computeRREF() {
        if (this.m === 0 || this.n === 0) {
            return { rref: [], pivotCols: [], rank: 0, steps: [] };
        }

        const A = this.rawMatrix.map(row => row.map(cell => new Rational(cell.num, cell.den)));
        const steps = [];
        let lead = 0;
        const pivotCols = [];

        steps.push({
            desc: "Matriz dimensional inicial $D$",
            matrix: A.map(r => r.map(c => new Rational(c.num, c.den)))
        });

        for (let r = 0; r < this.m; r++) {
            if (lead >= this.n) break;
            let i = r;
            while (i < this.m && A[i][lead].isZero()) i++;
            if (i === this.m) {
                lead++;
                r--;
                continue;
            }

            // Swap rows
            if (i !== r) {
                const temp = A[i];
                A[i] = A[r];
                A[r] = temp;
                steps.push({
                    desc: `Intercambio de fila $F_{${r + 1}} \\leftrightarrow F_{${i + 1}}$`,
                    matrix: A.map(row => row.map(c => new Rational(c.num, c.den)))
                });
            }

            // Scale pivot row
            const pivot = A[r][lead];
            if (!pivot.eq(new Rational(1n))) {
                for (let j = 0; j < this.n; j++) {
                    A[r][j] = A[r][j].div(pivot);
                }
                steps.push({
                    desc: `Normalización de fila pivote $F_{${r + 1}} \\leftarrow F_{${r + 1}} / (${pivot.toLatex()})$`,
                    matrix: A.map(row => row.map(c => new Rational(c.num, c.den)))
                });
            }

            // Eliminate column entries above and below
            for (let row = 0; row < this.m; row++) {
                if (row !== r && !A[row][lead].isZero()) {
                    const factor = A[row][lead];
                    for (let j = 0; j < this.n; j++) {
                        A[row][j] = A[row][j].sub(factor.mul(A[r][j]));
                    }
                    steps.push({
                        desc: `Eliminación en fila $F_{${row + 1}} \\leftarrow F_{${row + 1}} - (${factor.toLatex()}) \\cdot F_{${r + 1}}$`,
                        matrix: A.map(rw => rw.map(c => new Rational(c.num, c.den)))
                    });
                }
            }

            pivotCols.push(lead);
            lead++;
        }

        return {
            rref: A,
            pivotCols,
            rank: pivotCols.length,
            steps
        };
    }

    computeNullspace() {
        const { rref: A, pivotCols, rank, steps } = this.computeRREF();
        const freeCols = [];
        for (let j = 0; j < this.n; j++) {
            if (!pivotCols.includes(j)) freeCols.push(j);
        }

        const basis = [];
        for (const f of freeCols) {
            const vec = new Array(this.n).fill(null).map(() => new Rational(0n));
            vec[f] = new Rational(1n);
            for (let i = 0; i < pivotCols.length; i++) {
                const p = pivotCols[i];
                vec[p] = A[i][f].neg();
            }

            // Canonicalize to integer coprime vector
            let lcmDen = 1n;
            for (const val of vec) {
                lcmDen = Rational.lcm(lcmDen, val.den);
            }
            const intVec = vec.map(val => (val.num * lcmDen) / val.den);
            let gcdNum = 0n;
            for (const val of intVec) {
                if (val !== 0n) gcdNum = Rational.gcd(gcdNum, Rational.abs(val));
            }
            let canonical = intVec.map(val => (gcdNum > 0n ? val / gcdNum : val));

            // Heuristic for sign: if free variable exponent is negative, invert vector so free variable has positive exponent
            if (canonical[f] < 0n) {
                canonical = canonical.map(v => -v);
            }

            basis.push({
                rawVec: vec,
                canonical: canonical.map(v => Number(v)),
                freeCol: f,
                freeVar: this.variables[f]
            });
        }

        const groups = basis.map((b, idx) => {
            return this.buildPiGroup(b.canonical, idx + 1);
        });

        return {
            rank,
            numVariables: this.n,
            numDimensions: this.m,
            numGroups: freeCols.length,
            pivotCols,
            freeCols,
            pivotVars: pivotCols.map(c => this.variables[c]),
            freeVars: freeCols.map(c => this.variables[c]),
            rref: A,
            steps,
            basis,
            groups
        };
    }

    buildPiGroup(exponents, groupIndex) {
        const numTerms = [];
        const denTerms = [];
        const expMap = {};

        for (let i = 0; i < exponents.length; i++) {
            const exp = exponents[i];
            const sym = this.variables[i];
            const cleanSym = this.quantities[i].id;
            expMap[cleanSym] = exp;

            if (exp > 0) {
                if (exp === 1) numTerms.push(sym);
                else numTerms.push(`${sym}^{${exp}}`);
            } else if (exp < 0) {
                const posExp = -exp;
                if (posExp === 1) denTerms.push(sym);
                else denTerms.push(`${sym}^{${posExp}}`);
            }
        }

        let latexFormula = "";
        let textFormula = "";

        const numLatex = numTerms.join(' \\cdot ');
        const denLatex = denTerms.join(' \\cdot ');

        if (numTerms.length === 0) {
            latexFormula = denTerms.length > 0 ? `\\frac{1}{${denLatex}}` : "1";
            textFormula = denTerms.length > 0 ? `1 / (${denTerms.join(' * ')})` : "1";
        } else if (denTerms.length === 0) {
            latexFormula = numLatex;
            textFormula = numTerms.join(' * ');
        } else {
            latexFormula = `\\frac{${numLatex}}{${denLatex}}`;
            textFormula = `(${numTerms.join(' * ')}) / (${denTerms.join(' * ')})`;
        }

        // Match against known catalog
        const match = this.matchKnownNumber(expMap);

        return {
            index: groupIndex,
            symbol: `\\Pi_{${groupIndex}}`,
            latex: latexFormula,
            text: textFormula,
            exponents: expMap,
            match
        };
    }

    matchKnownNumber(expMap) {
        if (typeof DIMENSIONLESS_NUMBERS === 'undefined') return null;

        for (const num of DIMENSIONLESS_NUMBERS) {
            // Check matching variables
            const vars = num.variables;
            let allPresent = true;
            for (const v of vars) {
                let found = false;
                for (const qKey of Object.keys(expMap)) {
                    if (qKey === v || this.quantities.some(q => q.id === qKey && (q.symbol === v || (q.aliases && q.aliases.includes(v))))) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    allPresent = false;
                    break;
                }
            }
            if (allPresent) {
                return num;
            }
        }
        return null;
    }
}

class EquationParser {
    static tokenize(expr) {
        const tokens = [];
        let i = 0;
        while (i < expr.length) {
            const c = expr[i];
            if (/\s/.test(c)) {
                i++;
                continue;
            }
            if (/[0-9]/.test(c)) {
                let numStr = c;
                i++;
                while (i < expr.length && /[0-9\.]/.test(expr[i])) {
                    numStr += expr[i];
                    i++;
                }
                tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
                continue;
            }
            if (/[a-zA-Z_\\Delta\\rho\\mu\\nu\\alpha\\beta\\omega]/.test(c)) {
                let ident = c;
                i++;
                while (i < expr.length && /[a-zA-Z0-9_]/.test(expr[i])) {
                    ident += expr[i];
                    i++;
                }
                tokens.push({ type: 'IDENT', value: ident });
                continue;
            }
            if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^' || c === '(' || c === ')') {
                tokens.push({ type: c, value: c });
                i++;
                continue;
            }
            throw new Error(`Carácter inesperado en la expresión: '${c}'`);
        }
        return tokens;
    }

    /**
     * Recursive descent parser for dimensional algebra.
     * Gramática:
     *   E -> T ( ('+' | '-') T )*
     *   T -> P ( ('*' | '/') P )*
     *   P -> F ( '^' F )?
     *   F -> NUMBER | IDENT | '(' E ')' | ('+' | '-') F
     */
    static evaluate(expr, context) {
        const tokens = EquationParser.tokenize(expr);
        let pos = 0;

        function peek() {
            return tokens[pos] || null;
        }

        function consume(expectedType) {
            const tok = tokens[pos];
            if (!tok) throw new Error(`Se esperaba '${expectedType}' pero se llegó al final de la expresión.`);
            if (expectedType && tok.type !== expectedType) {
                throw new Error(`Se esperaba '${expectedType}' pero se encontró '${tok.value}' en posición ${pos}.`);
            }
            pos++;
            return tok;
        }

        function parseE() {
            let left = parseT();
            while (peek() && (peek().type === '+' || peek().type === '-')) {
                const op = consume().type;
                const right = parseT();
                // Regla fundamental de Fourier / Homogeneidad: sólo se pueden sumar o restar magnitudes de la misma dimensión!
                if (!left.dim.eq(right.dim)) {
                    throw new Error(`Incompatibilidad dimensional en '${op}': el término izquierdo tiene dimensión ${left.dim.toString()} y el derecho ${right.dim.toString()}. No se pueden sumar o restar magnitudes de distinta naturaleza física.`);
                }
                left = { dim: left.dim, expr: `(${left.expr} ${op} ${right.expr})` };
            }
            return left;
        }

        function parseT() {
            let left = parseP();
            while (peek() && (peek().type === '*' || peek().type === '/')) {
                const op = consume().type;
                const right = parseP();
                if (op === '*') {
                    left = { dim: left.dim.mul(right.dim), expr: `(${left.expr} * ${right.expr})` };
                } else {
                    left = { dim: left.dim.div(right.dim), expr: `(${left.expr} / ${right.expr})` };
                }
            }
            return left;
        }

        function parseP() {
            let left = parseF();
            if (peek() && peek().type === '^') {
                consume('^');
                const expNode = parseF();
                // Exponent must be dimensionless number
                if (!expNode.dim.isDimensionless()) {
                    throw new Error(`El exponente en una potencia debe ser estrictamente adimensional. Dimensión encontrada: ${expNode.dim.toString()}`);
                }
                const expVal = expNode.val !== undefined ? expNode.val : 1;
                left = { dim: left.dim.pow(expVal), expr: `(${left.expr}^${expVal})` };
            }
            return left;
        }

        function parseF() {
            const tok = peek();
            if (!tok) throw new Error("Expresión incompleta.");

            if (tok.type === '+') {
                consume('+');
                return parseF();
            }
            if (tok.type === '-') {
                consume('-');
                const node = parseF();
                return { dim: node.dim, expr: `(-${node.expr})`, val: node.val !== undefined ? -node.val : undefined };
            }
            if (tok.type === 'NUMBER') {
                consume('NUMBER');
                return { dim: Dimension.dimensionless(), val: tok.value, expr: tok.value.toString() };
            }
            if (tok.type === '(') {
                consume('(');
                const node = parseE();
                consume(')');
                return { dim: node.dim, expr: `(${node.expr})` };
            }
            if (tok.type === 'IDENT') {
                consume('IDENT');
                const name = tok.value;
                // Look up in context
                if (context[name]) {
                    const d = context[name];
                    return { dim: d instanceof Dimension ? d : new Dimension(d), expr: name };
                }
                // Try to find in catalog
                if (typeof PHYSICAL_QUANTITIES !== 'undefined') {
                    const match = PHYSICAL_QUANTITIES.find(q => q.id === name || q.symbol === name || (q.aliases && q.aliases.includes(name)));
                    if (match) {
                        return { dim: new Dimension(match.dimension), expr: name };
                    }
                }
                throw new Error(`Variable física desconocida '${name}'. Defina su dimensión en el contexto o selecciónela del catálogo.`);
            }
            throw new Error(`Token no reconocido: ${tok.value}`);
        }

        const res = parseE();
        if (pos < tokens.length) {
            throw new Error(`Tokens adicionales no procesados al final: '${tokens.slice(pos).map(t => t.value).join(' ')}'`);
        }
        return res.dim;
    }

    static checkEquation(equationStr, context = {}) {
        if (!equationStr.includes('=')) {
            throw new Error("La ecuación debe contener el signo igual '=' separando el miembro izquierdo del derecho.");
        }
        const [lhsStr, rhsStr] = equationStr.split('=').map(s => s.trim());
        const lhsDim = EquationParser.evaluate(lhsStr, context);
        const rhsDim = EquationParser.evaluate(rhsStr, context);
        const isHomogeneous = lhsDim.eq(rhsDim);

        return {
            equation: equationStr,
            lhsStr,
            rhsStr,
            lhsDim,
            rhsDim,
            isHomogeneous,
            lhsLatex: lhsDim.toLatex(),
            rhsLatex: rhsDim.toLatex(),
            lhsString: lhsDim.toString(),
            rhsString: rhsDim.toString()
        };
    }
}

class PowerLawSolver {
    /**
     * Solves target ∝ X_1^a1 * X_2^a2 * ...
     */
    static solve(targetQuantity, basisQuantities) {
        const matrix = new DimensionalMatrix(basisQuantities);
        const targetDim = targetQuantity.dimension;
        const targetVec = matrix.activeDimensions.map(d => targetDim.get(d));

        // Augmented matrix [A | b]
        const aug = matrix.rawMatrix.map((row, i) => [...row, targetVec[i]]);
        const m = matrix.m;
        const n = matrix.n;

        // Perform Gauss elimination
        let lead = 0;
        const pivotCols = [];

        for (let r = 0; r < m; r++) {
            if (lead >= n) break;
            let i = r;
            while (i < m && aug[i][lead].isZero()) i++;
            if (i === m) {
                lead++;
                r--;
                continue;
            }
            const temp = aug[i];
            aug[i] = aug[r];
            aug[r] = temp;

            const pivot = aug[r][lead];
            for (let j = 0; j <= n; j++) aug[r][j] = aug[r][j].div(pivot);

            for (let row = 0; row < m; row++) {
                if (row !== r && !aug[row][lead].isZero()) {
                    const factor = aug[row][lead];
                    for (let j = 0; j <= n; j++) {
                        aug[row][j] = aug[row][j].sub(factor.mul(aug[r][j]));
                    }
                }
            }
            pivotCols.push(lead);
            lead++;
        }

        // Check consistency: any row where all coefficients are 0 but rhs != 0?
        for (let r = 0; r < m; r++) {
            let allZeros = true;
            for (let j = 0; j < n; j++) {
                if (!aug[r][j].isZero()) {
                    allZeros = false;
                    break;
                }
            }
            if (allZeros && !aug[r][n].isZero()) {
                return { possible: false, message: "No existe combinación dimensional que reproduzca la magnitud objetivo." };
            }
        }

        const solution = {};
        for (let i = 0; i < pivotCols.length; i++) {
            const col = pivotCols[i];
            const sym = basisQuantities[col].symbol || basisQuantities[col].id;
            solution[sym] = aug[i][n];
        }

        return {
            possible: true,
            target: targetQuantity.symbol || targetQuantity.id,
            exponents: solution,
            toLatex: () => {
                const parts = [];
                for (const [sym, exp] of Object.entries(solution)) {
                    if (exp.isZero()) continue;
                    if (exp.eq(new Rational(1n))) parts.push(sym);
                    else parts.push(`${sym}^{${exp.toLatex()}}`);
                }
                return `${targetQuantity.symbol || targetQuantity.id} \\propto ${parts.join(' \\cdot ')}`;
            }
        };
    }
}

class SimilarityEngine {
    /**
     * Solves physical scaling relations: model (m) vs prototype (p).
     * Scale ratio lambda_X = X_m / X_p.
     */
    static solveScaling({ criterion, lambda_L, lambda_rho = 1, lambda_g = 1, lambda_mu = 1 }) {
        const L_ratio = parseFloat(lambda_L);
        const rho_ratio = parseFloat(lambda_rho);
        const g_ratio = parseFloat(lambda_g);
        const mu_ratio = parseFloat(lambda_mu);

        if (isNaN(L_ratio) || L_ratio <= 0) throw new Error("La escala de longitud lambda_L debe ser un número positivo.");

        const res = {
            criterion,
            lambda_L: L_ratio,
            lambda_rho: rho_ratio,
            lambda_g: g_ratio,
            lambda_mu: mu_ratio,
            scales: {},
            conflict: null
        };

        if (criterion === 'froude') {
            // Fr_m = Fr_p => v_m / sqrt(g_m * L_m) = v_p / sqrt(g_p * L_p)
            // lambda_v = sqrt(lambda_g * lambda_L)
            const v_ratio = Math.sqrt(g_ratio * L_ratio);
            const t_ratio = L_ratio / v_ratio; // lambda_t = sqrt(lambda_L / lambda_g)
            const a_ratio = g_ratio;
            const Q_ratio = L_ratio ** 2 * v_ratio; // lambda_L^2.5
            const F_ratio = rho_ratio * g_ratio * (L_ratio ** 3); // Fuerzas gravitatorias / boyamiento
            const p_ratio = rho_ratio * g_ratio * L_ratio;
            const P_ratio = F_ratio * v_ratio;

            res.scales = {
                lambda_v: v_ratio,
                lambda_t: t_ratio,
                lambda_a: a_ratio,
                lambda_Q: Q_ratio,
                lambda_F: F_ratio,
                lambda_p: p_ratio,
                lambda_P: P_ratio
            };

            // Check Reynolds conflict with same fluid
            const Re_ratio = (rho_ratio * v_ratio * L_ratio) / mu_ratio;
            if (Math.abs(Re_ratio - 1.0) > 0.001) {
                res.conflict = {
                    type: "Conflicto Froude - Reynolds",
                    ratio: Re_ratio,
                    explanation: `Para satisfacer semejanza de Froude, la relación de velocidades es lambda_v = sqrt(lambda_L) = ${v_ratio.toFixed(4)}. Sin embargo, la razón de números de Reynolds resultante es Re_m / Re_p = ${Re_ratio.toFixed(4)} != 1. En un canal de remolque naval con agua, es imposible satisfacer ambos simultáneamente (requeriría un fluido con viscosidad cinemática nu_m = nu_p * (lambda_L)^1.5, inalcanzable prácticamente). Solución de William Froude: medir arrastre total, sustraer resistencia de fricción calculada analíticamente, escalar la resistencia de olas por Froude, y recomponer el total del prototipo.`
                };
            }
        } else if (criterion === 'reynolds') {
            // Re_m = Re_p => rho_m * v_m * L_m / mu_m = rho_p * v_p * L_p / mu_p
            // lambda_v = (lambda_mu / lambda_rho) / lambda_L
            const v_ratio = (mu_ratio / rho_ratio) / L_ratio;
            const t_ratio = L_ratio / v_ratio;
            const a_ratio = v_ratio / t_ratio;
            const Q_ratio = L_ratio ** 2 * v_ratio;
            const F_ratio = rho_ratio * (v_ratio ** 2) * (L_ratio ** 2);
            const p_ratio = rho_ratio * (v_ratio ** 2);
            const P_ratio = F_ratio * v_ratio;

            res.scales = {
                lambda_v: v_ratio,
                lambda_t: t_ratio,
                lambda_a: a_ratio,
                lambda_Q: Q_ratio,
                lambda_F: F_ratio,
                lambda_p: p_ratio,
                lambda_P: P_ratio
            };

            const Fr_ratio = v_ratio / Math.sqrt(g_ratio * L_ratio);
            if (Math.abs(Fr_ratio - 1.0) > 0.001) {
                res.conflict = {
                    type: "Conflicto Reynolds - Froude",
                    ratio: Fr_ratio,
                    explanation: `Para satisfacer semejanza de Reynolds con el mismo fluido, la velocidad del modelo debe ser inversamente proporcional a su escala (lambda_v = 1 / lambda_L = ${v_ratio.toFixed(4)}). Esto distorsiona masivamente el número de Froude (Fr_m / Fr_p = ${Fr_ratio.toFixed(4)}), produciendo una alteración severa del régimen de olas si existe superficie libre.`
                };
            }
        } else if (criterion === 'mach') {
            // Ma_m = Ma_p => lambda_v = lambda_c = 1 (en el mismo gas y temperatura)
            const v_ratio = 1.0;
            const t_ratio = L_ratio / v_ratio;
            const a_ratio = 1.0 / L_ratio;
            const Q_ratio = (L_ratio ** 2) * v_ratio;
            const F_ratio = rho_ratio * (v_ratio ** 2) * (L_ratio ** 2);
            const p_ratio = rho_ratio * (v_ratio ** 2);
            const P_ratio = F_ratio * v_ratio;

            res.scales = {
                lambda_v: v_ratio,
                lambda_t: t_ratio,
                lambda_a: a_ratio,
                lambda_Q: Q_ratio,
                lambda_F: F_ratio,
                lambda_p: p_ratio,
                lambda_P: P_ratio
            };
        }

        return res;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Rational,
        Dimension,
        DimensionalMatrix,
        EquationParser,
        PowerLawSolver,
        SimilarityEngine
    };
}
