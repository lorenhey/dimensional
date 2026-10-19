/**
 * dimensional - Controlador Principal de la Aplicación Web
 * Loren Hey - Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initLab();
    initChecker();
    initSimilarity();
    initSynthesizer();
    initCatalog();
    initTerminal();
    
    // Render initial math
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
            ]
        });
    }
});

/* =========================================================================
   TABS CONTROLLER
   ========================================================================= */
function initTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                if (window.renderMathInElement) {
                    renderMathInElement(targetPanel, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "$", right: "$", display: false }
                        ]
                    });
                }
            }
        });
    });
}

/* =========================================================================
   LABORATORIO BUCKINGHAM PI
   ========================================================================= */
let currentLabQuantities = [];
let currentMatrixObj = null;

function initLab() {
    const presetSelect = document.getElementById('lab-preset-select');
    const quantitySelect = document.getElementById('lab-add-quantity-select');
    const btnAddQuantity = document.getElementById('btn-lab-add-q');
    const btnCompute = document.getElementById('btn-lab-compute');
    const btnReset = document.getElementById('btn-lab-reset');

    // Populate preset select
    ENGINEERING_PRESETS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.title}`;
        presetSelect.appendChild(opt);
    });

    // Populate quantity select
    PHYSICAL_QUANTITIES.forEach(q => {
        const opt = document.createElement('option');
        opt.value = q.id;
        opt.textContent = `${q.name} (${q.symbol}) - [${new Dimension(q.dimension).toString()}]`;
        quantitySelect.appendChild(opt);
    });

    presetSelect.addEventListener('change', () => {
        const pId = presetSelect.value;
        if (!pId) return;
        loadPreset(pId);
    });

    btnAddQuantity.addEventListener('click', () => {
        const qId = quantitySelect.value;
        if (!qId) return;
        addQuantityToLab(qId);
    });

    btnCompute.addEventListener('click', () => {
        recomputeLab();
    });

    btnReset.addEventListener('click', () => {
        currentLabQuantities = [];
        renderLabChips();
        clearLabOutputs();
        showToast("Variables reiniciadas.", "info");
    });

    // Load default preset: Arrastre en Esfera
    loadPreset('drag_sphere');
}

function findQuantity(idOrSymbol) {
    return PHYSICAL_QUANTITIES.find(q => 
        q.id === idOrSymbol || 
        q.symbol === idOrSymbol || 
        (q.aliases && q.aliases.includes(idOrSymbol))
    );
}

function loadPreset(presetId) {
    const preset = ENGINEERING_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    currentLabQuantities = [];
    preset.quantities.forEach(qRef => {
        const found = findQuantity(qRef);
        if (found) {
            currentLabQuantities.push({
                id: found.id,
                name: found.name,
                symbol: found.symbol,
                dimension: new Dimension(found.dimension)
            });
        }
    });

    // Update preset theory box
    const theoryBox = document.getElementById('lab-preset-theory');
    if (theoryBox) {
        theoryBox.innerHTML = `
            <div class="theory-callout">
                <h4><i class="fas fa-microscope"></i> ${preset.title}</h4>
                <p>${preset.description}</p>
                <div class="theory-details">
                    <p><strong>Fundamento Físico:</strong> ${preset.theory}</p>
                </div>
            </div>
        `;
    }

    renderLabChips();
    recomputeLab();
}

function addQuantityToLab(qId) {
    const found = findQuantity(qId);
    if (!found) return;

    // Check duplicate
    if (currentLabQuantities.some(q => q.id === found.id)) {
        showToast(`La variable '${found.name}' ya está en el sistema.`, "warning");
        return;
    }

    currentLabQuantities.push({
        id: found.id,
        name: found.name,
        symbol: found.symbol,
        dimension: new Dimension(found.dimension)
    });

    renderLabChips();
    recomputeLab();
    showToast(`Variable añadida: ${found.name} (${found.symbol})`, "success");
}

function removeQuantityFromLab(index) {
    currentLabQuantities.splice(index, 1);
    renderLabChips();
    recomputeLab();
}

function renderLabChips() {
    const container = document.getElementById('lab-chips-container');
    if (!container) return;

    if (currentLabQuantities.length === 0) {
        container.innerHTML = `<span class="empty-chips-msg">No hay variables seleccionadas. Seleccioná una o cargá un preset.</span>`;
        return;
    }

    let html = '';
    currentLabQuantities.forEach((q, idx) => {
        html += `
            <div class="quantity-chip" data-idx="${idx}">
                <span class="chip-symbol">${q.symbol}</span>
                <span class="chip-name">${q.name}</span>
                <span class="chip-dim">${q.dimension.toString()}</span>
                <button type="button" class="chip-remove-btn" onclick="removeQuantityFromLab(${idx})" title="Eliminar variable">&times;</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function recomputeLab() {
    if (currentLabQuantities.length === 0) {
        clearLabOutputs();
        return;
    }

    currentMatrixObj = new DimensionalMatrix(currentLabQuantities);

    // Update summary counters
    document.getElementById('stat-num-vars').textContent = currentMatrixObj.n;
    document.getElementById('stat-num-dims').textContent = currentMatrixObj.m;
    document.getElementById('stat-rank').textContent = currentMatrixObj.analysis.rank;
    document.getElementById('stat-num-groups').textContent = currentMatrixObj.analysis.numGroups;

    // Render Matrix Table
    MatrixRenderer.renderMatrixTable('lab-matrix-display', currentMatrixObj);

    // Render RREF Table
    MatrixRenderer.renderRrefTable('lab-rref-display', currentMatrixObj.analysis, currentMatrixObj.activeDimensions, currentMatrixObj.variables);

    // Render Pi Cards
    MatrixRenderer.renderPiCards('lab-pi-results', currentMatrixObj.analysis.groups);

    // Render Math
    if (window.renderMathInElement) {
        renderMathInElement(document.getElementById('tab-lab'), {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
            ]
        });
    }
}

function clearLabOutputs() {
    document.getElementById('stat-num-vars').textContent = '0';
    document.getElementById('stat-num-dims').textContent = '0';
    document.getElementById('stat-rank').textContent = '0';
    document.getElementById('stat-num-groups').textContent = '0';
    document.getElementById('lab-matrix-display').innerHTML = '<p class="text-muted">Esperando variables...</p>';
    document.getElementById('lab-rref-display').innerHTML = '<p class="text-muted">Esperando variables...</p>';
    document.getElementById('lab-pi-results').innerHTML = '<p class="text-muted">Esperando variables...</p>';
}

/* =========================================================================
   VERIFICADOR DE HOMOGENEIDAD
   ========================================================================= */
function initChecker() {
    const inputEq = document.getElementById('checker-input-equation');
    const btnCheck = document.getElementById('btn-checker-run');
    const resultBox = document.getElementById('checker-result-box');
    const presetButtons = document.querySelectorAll('.checker-preset-btn');

    btnCheck.addEventListener('click', () => {
        const eqStr = inputEq.value.trim();
        if (!eqStr) {
            showToast("Ingresá una ecuación para verificar.", "warning");
            return;
        }
        runChecker(eqStr);
    });

    inputEq.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            btnCheck.click();
        }
    });

    presetButtons.forEach(b => {
        b.addEventListener('click', () => {
            inputEq.value = b.getAttribute('data-eq');
            btnCheck.click();
        });
    });
}

function runChecker(equationStr) {
    const resultBox = document.getElementById('checker-result-box');
    try {
        const res = EquationParser.checkEquation(equationStr);
        let badgeHtml = '';
        let msgHtml = '';

        if (res.isHomogeneous) {
            badgeHtml = `<div class="status-badge success"><i class="fas fa-check-circle"></i> Ecuación Dimensionalmente Homogénea (Consistente)</div>`;
            msgHtml = `
                <p class="checker-explanation text-success">
                    Cumple estrictamente el <strong>Principio de Homogeneidad Dimensional de Fourier</strong>.
                    Ambos miembros de la igualdad poseen idéntica representación en las dimensiones base del Sistema Internacional:
                </p>
            `;
        } else {
            badgeHtml = `<div class="status-badge error"><i class="fas fa-times-circle"></i> Inconsistencia Dimensional (Heterogénea)</div>`;
            msgHtml = `
                <p class="checker-explanation text-error">
                    <strong>Violación dimensional:</strong> El miembro izquierdo y el miembro derecho representan magnitudes físicas de naturaleza incompatible. No pueden igualarse físicamente.
                </p>
            `;
        }

        resultBox.innerHTML = `
            ${badgeHtml}
            ${msgHtml}
            <div class="checker-comparison-grid">
                <div class="checker-side-card">
                    <div class="side-title">Miembro Izquierdo (LHS)</div>
                    <div class="side-expr">$$${res.lhsStr}$$</div>
                    <div class="side-dim">Dimensión: $$[${res.lhsLatex}]$$</div>
                    <div class="side-text-dim"><code>${res.lhsString}</code></div>
                </div>
                <div class="checker-side-card">
                    <div class="side-title">Miembro Derecho (RHS)</div>
                    <div class="side-expr">$$${res.rhsStr}$$</div>
                    <div class="side-dim">Dimensión: $$[${res.rhsLatex}]$$</div>
                    <div class="side-text-dim"><code>${res.rhsString}</code></div>
                </div>
            </div>
        `;

        if (window.renderMathInElement) {
            renderMathInElement(resultBox, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
    } catch (err) {
        resultBox.innerHTML = `
            <div class="status-badge error"><i class="fas fa-exclamation-triangle"></i> Error de Evaluación</div>
            <p class="checker-error-msg">${err.message}</p>
        `;
    }
}

/* =========================================================================
   ESTUDIO DE SIMILITUD FÍSICA Y LEYES DE ESCALA
   ========================================================================= */
function initSimilarity() {
    const selectCriterion = document.getElementById('sim-criterion');
    const inputLambdaL = document.getElementById('sim-lambda-L');
    const inputLambdaRho = document.getElementById('sim-lambda-rho');
    const inputLambdaG = document.getElementById('sim-lambda-g');
    const inputLambdaMu = document.getElementById('sim-lambda-mu');
    const btnSolve = document.getElementById('btn-sim-solve');
    const resultsContainer = document.getElementById('sim-results-container');

    btnSolve.addEventListener('click', () => {
        const criterion = selectCriterion.value;
        const lambda_L = parseFloat(inputLambdaL.value);
        const lambda_rho = parseFloat(inputLambdaRho.value);
        const lambda_g = parseFloat(inputLambdaG.value);
        const lambda_mu = parseFloat(inputLambdaMu.value);

        try {
            const sim = SimilarityEngine.solveScaling({
                criterion,
                lambda_L,
                lambda_rho,
                lambda_g,
                lambda_mu
            });
            renderSimilarityResults(sim);
        } catch (e) {
            resultsContainer.innerHTML = `<div class="status-badge error">${e.message}</div>`;
        }
    });

    // Run initial
    btnSolve.click();
}

function renderSimilarityResults(sim) {
    const container = document.getElementById('sim-results-container');
    const s = sim.scales;

    let conflictHtml = '';
    if (sim.conflict) {
        conflictHtml = `
            <div class="conflict-alert-card">
                <div class="conflict-title"><i class="fas fa-exclamation-triangle"></i> ${sim.conflict.type}</div>
                <p>${sim.conflict.explanation}</p>
            </div>
        `;
    }

    let scalesGrid = `
        <div class="scales-summary-grid">
            <div class="scale-item">
                <span class="scale-label">Escala Geométrica (Longitud)</span>
                <span class="scale-math">$$\\lambda_L = \\frac{L_m}{L_p}$$</span>
                <span class="scale-val">${sim.lambda_L.toExponential(4)}</span>
            </div>
            <div class="scale-item highlight">
                <span class="scale-label">Escala Cinemática (Velocidad)</span>
                <span class="scale-math">$$\\lambda_v = \\frac{v_m}{v_p}$$</span>
                <span class="scale-val">${s.lambda_v.toFixed(4)}</span>
            </div>
            <div class="scale-item">
                <span class="scale-label">Escala Temporal</span>
                <span class="scale-math">$$\\lambda_t = \\frac{t_m}{t_p}$$</span>
                <span class="scale-val">${s.lambda_t.toFixed(4)}</span>
            </div>
            <div class="scale-item">
                <span class="scale-label">Escala de Caudal Volumétrico</span>
                <span class="scale-math">$$\\lambda_Q = \\frac{Q_m}{Q_p}$$</span>
                <span class="scale-val">${s.lambda_Q.toExponential(4)}</span>
            </div>
            <div class="scale-item highlight">
                <span class="scale-label">Escala Dinámica (Fuerza)</span>
                <span class="scale-math">$$\\lambda_F = \\frac{F_m}{F_p}$$</span>
                <span class="scale-val">${s.lambda_F.toExponential(4)}</span>
            </div>
            <div class="scale-item">
                <span class="scale-label">Escala de Presión</span>
                <span class="scale-math">$$\\lambda_p = \\frac{p_m}{p_p}$$</span>
                <span class="scale-val">${s.lambda_p.toExponential(4)}</span>
            </div>
            <div class="scale-item">
                <span class="scale-label">Escala de Potencia</span>
                <span class="scale-math">$$\\lambda_P = \\frac{P_m}{P_p}$$</span>
                <span class="scale-val">${s.lambda_P.toExponential(4)}</span>
            </div>
        </div>
    `;

    container.innerHTML = `
        ${conflictHtml}
        <h4 class="scales-section-title"><i class="fas fa-ruler-combined"></i> Factores de Escala de Similitud Calculados</h4>
        ${scalesGrid}
    `;

    if (window.renderMathInElement) {
        renderMathInElement(container, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false }
            ]
        });
    }
}

/* =========================================================================
   SÍNTESIS DE LEYES DE POTENCIA
   ========================================================================= */
function initSynthesizer() {
    const selectTarget = document.getElementById('synth-target-select');
    const selectBasis = document.getElementById('synth-basis-select');
    const btnAddBasis = document.getElementById('btn-synth-add-basis');
    const btnSolve = document.getElementById('btn-synth-solve');
    const basisChips = document.getElementById('synth-basis-chips');
    const resultBox = document.getElementById('synth-result-box');

    let selectedBasis = ['length', 'gravity'];

    // Populate selects
    PHYSICAL_QUANTITIES.forEach(q => {
        const opt1 = document.createElement('option');
        opt1.value = q.id;
        opt1.textContent = `${q.name} (${q.symbol})`;
        selectTarget.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = q.id;
        opt2.textContent = `${q.name} (${q.symbol})`;
        selectBasis.appendChild(opt2);
    });

    selectTarget.value = 'time';

    function renderBasis() {
        if (selectedBasis.length === 0) {
            basisChips.innerHTML = '<span class="empty-chips-msg">Ninguna variable base seleccionada.</span>';
            return;
        }
        let html = '';
        selectedBasis.forEach((bId, idx) => {
            const f = findQuantity(bId);
            html += `
                <div class="quantity-chip">
                    <span class="chip-symbol">${f.symbol}</span>
                    <span class="chip-name">${f.name}</span>
                    <button type="button" class="chip-remove-btn" onclick="removeSynthBasis(${idx})">&times;</button>
                </div>
            `;
        });
        basisChips.innerHTML = html;
    }

    window.removeSynthBasis = (idx) => {
        selectedBasis.splice(idx, 1);
        renderBasis();
    };

    btnAddBasis.addEventListener('click', () => {
        const bId = selectBasis.value;
        if (!selectedBasis.includes(bId)) {
            selectedBasis.push(bId);
            renderBasis();
        }
    });

    btnSolve.addEventListener('click', () => {
        const targetId = selectTarget.value;
        const targetQ = findQuantity(targetId);
        const basisQs = selectedBasis.map(id => {
            const f = findQuantity(id);
            return {
                id: f.id,
                name: f.name,
                symbol: f.symbol,
                dimension: new Dimension(f.dimension)
            };
        });

        const targetObj = {
            id: targetQ.id,
            name: targetQ.name,
            symbol: targetQ.symbol,
            dimension: new Dimension(targetQ.dimension)
        };

        const res = PowerLawSolver.solve(targetObj, basisQs);
        if (!res.possible) {
            resultBox.innerHTML = `
                <div class="status-badge error"><i class="fas fa-times-circle"></i> Síntesis Imposible</div>
                <p class="checker-error-msg">No existe combinación exponencial de las variables base que reproduzca la dimensión de la variable objetivo.</p>
            `;
            return;
        }

        resultBox.innerHTML = `
            <div class="status-badge success"><i class="fas fa-check-circle"></i> Ley de Potencia Deducida</div>
            <div class="synth-math-display">
                $$${res.toLatex()}$$
            </div>
            <div class="synth-exponents-table">
                <strong>Exponentes Algebraicos Exactos:</strong>
                <ul>
                    ${Object.entries(res.exponents).map(([sym, exp]) => `<li>$$${sym}: \\quad ${exp.toLatex()}$$</li>`).join('')}
                </ul>
            </div>
        `;

        if (window.renderMathInElement) {
            renderMathInElement(resultBox, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
    });

    renderBasis();
    btnSolve.click();
}

/* =========================================================================
   CATÁLOGO DE NÚMEROS ADIMENSIONALES
   ========================================================================= */
function initCatalog() {
    const searchInput = document.getElementById('catalog-search-input');
    const domainFilter = document.getElementById('catalog-domain-filter');
    const container = document.getElementById('catalog-cards-container');

    // Extract unique domains
    const domains = new Set(DIMENSIONLESS_NUMBERS.map(n => n.domain));
    domains.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        domainFilter.appendChild(opt);
    });

    function renderCatalog() {
        const query = searchInput.value.toLowerCase().trim();
        const selectedDomain = domainFilter.value;

        const filtered = DIMENSIONLESS_NUMBERS.filter(item => {
            const matchQuery = item.name.toLowerCase().includes(query) ||
                               item.symbol.toLowerCase().includes(query) ||
                               item.interpretation.toLowerCase().includes(query) ||
                               item.domain.toLowerCase().includes(query);
            const matchDomain = selectedDomain === 'ALL' || item.domain === selectedDomain;
            return matchQuery && matchDomain;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<p class="empty-chips-msg">No se encontraron números adimensionales que coincidan con la búsqueda.</p>`;
            return;
        }

        let html = '';
        filtered.forEach(item => {
            html += `
                <div class="catalog-card">
                    <div class="catalog-card-header">
                        <span class="catalog-symbol">${item.symbol}</span>
                        <div class="catalog-header-text">
                            <h4 class="catalog-name">${item.name}</h4>
                            <span class="catalog-domain-tag">${item.domain}</span>
                        </div>
                    </div>
                    <div class="catalog-formula-box">
                        $$${item.symbol} = ${item.formula}$$
                    </div>
                    <div class="catalog-details">
                        <div class="catalog-ratio">
                            <i class="fas fa-balance-scale"></i> <strong>Balance Físico:</strong> ${item.physicalRatio}
                        </div>
                        <p class="catalog-interpretation">${item.interpretation}</p>
                        ${item.asymptotics ? `<div class="catalog-asymptotics"><i class="fas fa-chart-line"></i> <strong>Límites Asintóticos:</strong> ${item.asymptotics}</div>` : ''}
                        <div class="catalog-ref"><i class="fas fa-book"></i> <em>${item.references}</em></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        if (window.renderMathInElement) {
            renderMathInElement(container, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
    }

    searchInput.addEventListener('input', renderCatalog);
    domainFilter.addEventListener('change', renderCatalog);
    renderCatalog();
}

/* =========================================================================
   TERMINAL CLI INTERACTIVO
   ========================================================================= */
function initTerminal() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const history = [];
    let historyIdx = -1;

    printToTerminal("dimensional CLI Web Terminal Simulator [v2.2.0]", "term-header");
    printToTerminal("Escribí 'help' para ver los comandos disponibles o 'demo' para ejecutar un showcase guiado.", "term-muted");
    printToTerminal("");

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (cmd) {
                history.push(cmd);
                historyIdx = history.length;
                printToTerminal(`$ dimensional ${cmd}`, "term-cmd");
                executeCommand(cmd);
                input.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            if (historyIdx > 0) {
                historyIdx--;
                input.value = history[historyIdx];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIdx < history.length - 1) {
                historyIdx++;
                input.value = history[historyIdx];
            } else {
                historyIdx = history.length;
                input.value = '';
            }
        }
    });

    function printToTerminal(text, className = "term-line") {
        const line = document.createElement('div');
        line.className = className;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function executeCommand(fullCmd) {
        const parts = fullCmd.split(' ').map(s => s.trim()).filter(s => s.length > 0);
        const cmd = parts[0];
        const args = parts.slice(1);

        switch (cmd) {
            case 'help':
                printToTerminal("Comandos disponibles en dimensional CLI:");
                printToTerminal("  check <ecuación>           Verifica la homogeneidad dimensional (ej: check F=m*a)");
                printToTerminal("  pi <v1> <v2> ...           Calcula grupos Pi para una lista de variables");
                printToTerminal("  explain <expresión>        Explica la dimensión resultante de una expresión");
                printToTerminal("  recognize <expresión>      Identifica si la expresión equivale a un número conocido");
                printToTerminal("  scale L=<val> <criterio>   Resuelve factores de escala (ej: scale L=0.04 Froude)");
                printToTerminal("  demo                       Ejecuta la demostración interactiva completa");
                printToTerminal("  clear                      Limpia la pantalla de la terminal");
                break;

            case 'clear':
                output.innerHTML = '';
                break;

            case 'check':
                if (args.length === 0) {
                    printToTerminal("Uso: check <ecuacion> (ej: check F=m*a)", "term-error");
                    return;
                }
                const eqStr = args.join(' ');
                try {
                    const res = EquationParser.checkEquation(eqStr);
                    printToTerminal(`LEFT:  ${res.lhsString}`);
                    printToTerminal(`RIGHT: ${res.rhsString}`);
                    if (res.isHomogeneous) {
                        printToTerminal("dimensionally consistent [OK]", "term-success");
                    } else {
                        printToTerminal("dimensionally inconsistent [FAIL]", "term-error");
                    }
                } catch (e) {
                    printToTerminal(`Error: ${e.message}`, "term-error");
                }
                break;

            case 'pi':
                if (args.length === 0) {
                    printToTerminal("Uso: pi <var1> <var2> ... (ej: pi rho v L mu F)", "term-error");
                    return;
                }
                const quants = [];
                for (const v of args) {
                    const f = findQuantity(v);
                    if (!f) {
                        printToTerminal(`Error: Variable desconocida '${v}'`, "term-error");
                        return;
                    }
                    quants.push({
                        id: f.id,
                        name: f.name,
                        symbol: f.symbol,
                        dimension: new Dimension(f.dimension)
                    });
                }
                const mat = new DimensionalMatrix(quants);
                printToTerminal(`variables: ${mat.n}`);
                printToTerminal(`dimensiones activas: ${mat.m}`);
                printToTerminal(`rango algebraico: ${mat.analysis.rank}`);
                printToTerminal(`grupos Pi independientes: ${mat.analysis.numGroups}`);
                printToTerminal("");
                mat.analysis.groups.forEach((g, i) => {
                    printToTerminal(`Pi_${i + 1} = ${g.text}`, "term-success");
                    if (g.match) {
                        printToTerminal(`       -> Reconocido: ${g.match.name} (${g.match.symbol})`, "term-info");
                    }
                });
                break;

            case 'explain':
                if (args.length === 0) {
                    printToTerminal("Uso: explain <expresion> (ej: explain rho*v^2/2)", "term-error");
                    return;
                }
                const expr = args.join(' ');
                try {
                    const d = EquationParser.evaluate(expr, {});
                    printToTerminal(`Expresión: ${expr}`);
                    printToTerminal(`Dimensión: ${d.toString()}`, "term-info");
                    const matches = PHYSICAL_QUANTITIES.filter(q => new Dimension(q.dimension).eq(d));
                    if (matches.length > 0) {
                        printToTerminal("Magnitudes compatibles en el catálogo:");
                        matches.forEach(m => printToTerminal(`  - ${m.name} (${m.symbol}) [${m.unit}]`, "term-success"));
                    } else {
                        printToTerminal("No hay coincidencia exacta única en el catálogo.", "term-muted");
                    }
                } catch (e) {
                    printToTerminal(`Error: ${e.message}`, "term-error");
                }
                break;

            case 'recognize':
                if (args.length === 0) {
                    printToTerminal("Uso: recognize <expresion> (ej: recognize rho*v*L/mu)", "term-error");
                    return;
                }
                const recExpr = args.join(' ');
                try {
                    const d = EquationParser.evaluate(recExpr, {});
                    if (!d.isDimensionless()) {
                        printToTerminal(`La expresión no es adimensional. Dimensión: ${d.toString()}`, "term-error");
                        return;
                    }
                    printToTerminal("Analizando estructura adimensionada...", "term-muted");
                    // Simple search in dimensionless numbers
                    const found = DIMENSIONLESS_NUMBERS.find(n => n.definition.replace(/\s+/g, '') === recExpr.replace(/\s+/g, ''));
                    if (found) {
                        printToTerminal(`Equivalente a: ${found.name} (${found.symbol})`, "term-success");
                        printToTerminal(`Dominio: ${found.domain}`);
                        printToTerminal(`Interpretación: ${found.interpretation}`);
                    } else {
                        printToTerminal("La expresión es adimensional pero no se encontró coincidencia directa exacta en el catálogo básico.", "term-warning");
                    }
                } catch (e) {
                    printToTerminal(`Error: ${e.message}`, "term-error");
                }
                break;

            case 'scale':
                let lVal = 0.04;
                let crit = 'froude';
                args.forEach(a => {
                    if (a.toLowerCase().startsWith('l=')) lVal = parseFloat(a.split('=')[1]);
                    else crit = a.toLowerCase();
                });
                try {
                    const s = SimilarityEngine.solveScaling({ criterion: crit, lambda_L: lVal });
                    printToTerminal(`Criterio de Semejanza: ${crit.toUpperCase()}`);
                    printToTerminal(`Escala geométrica lambda_L = ${s.lambda_L}`);
                    printToTerminal(`Factores de escala (modelo / prototipo):`);
                    printToTerminal(`  lambda_v = ${s.scales.lambda_v.toFixed(4)}`, "term-success");
                    printToTerminal(`  lambda_t = ${s.scales.lambda_t.toFixed(4)}`, "term-success");
                    printToTerminal(`  lambda_Q = ${s.scales.lambda_Q.toExponential(4)}`, "term-success");
                    printToTerminal(`  lambda_F = ${s.scales.lambda_F.toExponential(4)}`, "term-success");
                    printToTerminal(`  lambda_P = ${s.scales.lambda_P.toExponential(4)}`, "term-success");
                    if (s.conflict) {
                        printToTerminal(`[ALERTA] ${s.conflict.type}`, "term-warning");
                        printToTerminal(`  ${s.conflict.explanation}`, "term-muted");
                    }
                } catch (e) {
                    printToTerminal(`Error: ${e.message}`, "term-error");
                }
                break;

            case 'demo':
                runDemo();
                break;

            default:
                printToTerminal(`Comando no reconocido: '${cmd}'. Escribí 'help' para ver la lista.`, "term-error");
                break;
        }
        printToTerminal("");
    }

    function runDemo() {
        printToTerminal("=== EJECUTANDO DEMOSTRACIÓN GUIADA DE DIMENSIONAL ===", "term-header");
        setTimeout(() => {
            printToTerminal("\n1. Verificación de Ecuación: F = m * a");
            executeCommand("check F = m * a");
        }, 500);
        setTimeout(() => {
            printToTerminal("\n2. Explicación Dimensional: rho * v^2 / 2 (Presión dinámica)");
            executeCommand("explain rho * v^2 / 2");
        }, 1200);
        setTimeout(() => {
            printToTerminal("\n3. Teorema de Buckingham Pi: Caso Arrastre (rho, v, L, mu, F)");
            executeCommand("pi rho v L mu F");
        }, 2000);
        setTimeout(() => {
            printToTerminal("\n4. Similitud y Leyes de Escala: Froude con L=0.04");
            executeCommand("scale L=0.04 froude");
        }, 2800);
    }
}

/* =========================================================================
   NOTIFICACIONES TOAST
   ========================================================================= */
function showToast(message, type = "info") {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle');
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
