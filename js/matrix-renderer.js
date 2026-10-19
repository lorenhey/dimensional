/**
 * dimensional - Renderizador interactivo de matrices dimensionales,
 * escalonamiento de Gauss-Jordan y visualización de grupos Pi.
 * Loren Hey - Antigravity
 */

class MatrixRenderer {
    static renderMatrixTable(containerId, matrixObj, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { rawMatrix, activeDimensions, variables, quantities, analysis } = matrixObj;
        const { pivotCols = [], freeCols = [] } = analysis || {};

        let html = `
            <div class="matrix-table-wrapper">
                <table class="dimensional-matrix-table">
                    <thead>
                        <tr>
                            <th class="matrix-corner-th">Dimensión \\ Variable</th>
        `;

        variables.forEach((v, colIdx) => {
            const isPivot = pivotCols.includes(colIdx);
            const isFree = freeCols.includes(colIdx);
            const badgeClass = isPivot ? 'badge-pivot' : (isFree ? 'badge-free' : '');
            const badgeText = isPivot ? 'Pivote (Base)' : (isFree ? 'Libre' : '');
            const q = quantities[colIdx];
            html += `
                <th class="matrix-col-th ${badgeClass}">
                    <div class="col-symbol">${v}</div>
                    <div class="col-name">${q.name}</div>
                    <span class="col-type-tag">${badgeText}</span>
                </th>
            `;
        });

        html += `
                    </tr>
                </thead>
                <tbody>
        `;

        activeDimensions.forEach((dimName, rowIdx) => {
            const dimInfo = BASE_DIMENSIONS.find(d => d.id === dimName) || { name: dimName, unit: '' };
            html += `
                <tr>
                    <td class="matrix-row-th">
                        <span class="dim-symbol">[${dimName}]</span>
                        <span class="dim-name">${dimInfo.name} (${dimInfo.unit})</span>
                    </td>
            `;

            variables.forEach((_, colIdx) => {
                const cellVal = rawMatrix[rowIdx][colIdx];
                const isPivotCell = pivotCols.includes(colIdx) && rowIdx === pivotCols.indexOf(colIdx);
                const isZero = cellVal.isZero();
                const cellClass = isPivotCell ? 'cell-pivot' : (isZero ? 'cell-zero' : 'cell-nonzero');

                html += `
                    <td class="matrix-cell ${cellClass}">
                        ${cellVal.toString()}
                    </td>
                `;
            });

            html += `</tr>`;
        });

        html += `
                </tbody>
            </table>
        </div>
        `;

        container.innerHTML = html;
    }

    static renderRrefTable(containerId, analysis, activeDimensions, variables) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { rref, pivotCols, rank } = analysis;
        if (!rref || rref.length === 0) {
            container.innerHTML = "<p class='text-muted'>Matriz vacía.</p>";
            return;
        }

        let html = `
            <div class="matrix-table-wrapper">
                <table class="dimensional-matrix-table rref-table">
                    <thead>
                        <tr>
                            <th class="matrix-corner-th">Fila Reducida</th>
        `;

        variables.forEach((v, colIdx) => {
            const isPivot = pivotCols.includes(colIdx);
            html += `
                <th class="matrix-col-th ${isPivot ? 'badge-pivot' : 'badge-free'}">
                    <div class="col-symbol">${v}</div>
                    <span class="col-type-tag">${isPivot ? 'Pivote' : 'Libre'}</span>
                </th>
            `;
        });

        html += `
                    </tr>
                </thead>
                <tbody>
        `;

        rref.forEach((row, rIdx) => {
            html += `
                <tr>
                    <td class="matrix-row-th">Fila ${rIdx + 1}</td>
            `;
            row.forEach((cell, cIdx) => {
                const isPivot = pivotCols.includes(cIdx) && rIdx === pivotCols.indexOf(cIdx);
                const isZero = cell.isZero();
                html += `
                    <td class="matrix-cell ${isPivot ? 'cell-pivot' : (isZero ? 'cell-zero' : 'cell-nonzero')}">
                        ${cell.toString()}
                    </td>
                `;
            });
            html += `</tr>`;
        });

        html += `
                </tbody>
            </table>
        </div>
        <div class="matrix-stats-bar">
            <span class="stat-pill"><i class="fas fa-layer-group"></i> Rango algebraico $r = ${rank}$</span>
            <span class="stat-pill"><i class="fas fa-columns"></i> Variables totales $n = ${variables.length}$</span>
            <span class="stat-pill highlight"><i class="fas fa-calculator"></i> Grupos $\\Pi$ independientes $k = n - r = ${analysis.numGroups}$</span>
        </div>
        `;

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

    static renderPiCards(containerId, groups, onSelectGroup = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!groups || groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>No se encontraron grupos adimensionales independientes ($n - r = 0$). El conjunto de variables es dimensionalmente determinado o insuficiente.</p>
                </div>
            `;
            return;
        }

        let html = `<div class="pi-groups-grid">`;

        groups.forEach((g, idx) => {
            const hasMatch = g.match !== null;
            const matchBadge = hasMatch
                ? `<div class="match-badge" title="${g.match.interpretation}"><i class="fas fa-check-circle"></i> Reconocido: <strong>${g.match.name} (${g.match.symbol})</strong></div>`
                : `<div class="custom-badge"><i class="fas fa-cube"></i> Grupo Adimensional Independiente</div>`;

            html += `
                <div class="pi-card ${hasMatch ? 'card-matched' : ''}" data-group-index="${idx}">
                    <div class="pi-card-header">
                        <span class="pi-badge">${g.symbol}</span>
                        ${matchBadge}
                    </div>
                    <div class="pi-formula-container">
                        <div class="pi-latex-display">$$${g.symbol} = ${g.latex}$$</div>
                        <div class="pi-text-mono">${g.text}</div>
                    </div>
            `;

            if (hasMatch) {
                html += `
                    <div class="pi-match-details">
                        <div class="ratio-label"><i class="fas fa-balance-scale"></i> Balance Físico:</div>
                        <div class="ratio-text">${g.match.physicalRatio || g.match.domain}</div>
                        <p class="interpretation-text">${g.match.interpretation}</p>
                    </div>
                `;
            } else {
                html += `
                    <div class="pi-exponents-summary">
                        <strong>Composición Exponencial:</strong>
                        <div class="exp-tags">
                            ${Object.entries(g.exponents).map(([k, v]) => `<span class="exp-tag">${k}<sup>${v}</sup></span>`).join('')}
                        </div>
                    </div>
                `;
            }

            html += `
                    <div class="pi-card-actions">
                        <button class="btn-action-copy" onclick="MatrixRenderer.copyToClipboard('${g.latex}')" title="Copiar código LaTeX">
                            <i class="fas fa-copy"></i> Copiar LaTeX
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
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

    static copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showToast === 'function') {
                showToast("Fórmula LaTeX copiada al portapapeles.", "success");
            } else {
                alert("Copiado al portapapeles: " + text);
            }
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MatrixRenderer };
}
