/**
 * dimensional - Base de datos de magnitudes físicas, dimensiones SI y números adimensionales.
 * Loren Hey - Antigravity
 */

const BASE_DIMENSIONS = [
    { id: 'M', symbol: 'M', name: 'Masa', unit: 'kg', unitName: 'kilogramo' },
    { id: 'L', symbol: 'L', name: 'Longitud', unit: 'm', unitName: 'metro' },
    { id: 'T', symbol: 'T', name: 'Tiempo', unit: 's', unitName: 'segundo' },
    { id: 'Theta', symbol: '\\Theta', name: 'Temperatura Termodinámica', unit: 'K', unitName: 'kelvin' },
    { id: 'I', symbol: 'I', name: 'Corriente Eléctrica', unit: 'A', unitName: 'amperio' },
    { id: 'N', symbol: 'N', name: 'Cantidad de Sustancia', unit: 'mol', unitName: 'mol' },
    { id: 'J', symbol: 'J', name: 'Intensidad Luminosa', unit: 'cd', unitName: 'candela' }
];

const PHYSICAL_QUANTITIES = [
    // Magnitudes Fundamentales
    { id: 'length', name: 'Longitud', symbol: 'L', dimension: { L: 1 }, unit: 'm', domain: 'Geometría', aliases: ['L', 'x', 'y', 'z', 'r', 'd', 'D', 'h', 's'] },
    { id: 'mass', name: 'Masa', symbol: 'm', dimension: { M: 1 }, unit: 'kg', domain: 'Mecánica', aliases: ['m', 'M'] },
    { id: 'time', name: 'Tiempo', symbol: 't', dimension: { T: 1 }, unit: 's', domain: 'Cinemática', aliases: ['t', 'tau', 'time'] },
    { id: 'temperature', name: 'Temperatura', symbol: 'T', dimension: { Theta: 1 }, unit: 'K', domain: 'Termodinámica', aliases: ['T', 'theta', 'T_s', 'T_inf'] },
    { id: 'electric_current', name: 'Corriente Eléctrica', symbol: 'I', dimension: { I: 1 }, unit: 'A', domain: 'Electromagnetismo', aliases: ['I', 'i'] },
    { id: 'amount_of_substance', name: 'Cantidad de Sustancia', symbol: 'n', dimension: { N: 1 }, unit: 'mol', domain: 'Química', aliases: ['n'] },
    { id: 'luminous_intensity', name: 'Intensidad Luminosa', symbol: 'I_v', dimension: { J: 1 }, unit: 'cd', domain: 'Óptica', aliases: ['I_v', 'Iv'] },

    // Cinemática
    { id: 'area', name: 'Área / Superficie', symbol: 'A', dimension: { L: 2 }, unit: 'm²', domain: 'Geometría', aliases: ['A', 'S'] },
    { id: 'volume', name: 'Volumen', symbol: 'V', dimension: { L: 3 }, unit: 'm³', domain: 'Geometría', aliases: ['V', 'Vol'] },
    { id: 'velocity', name: 'Velocidad', symbol: 'v', dimension: { L: 1, T: -1 }, unit: 'm/s', domain: 'Cinemática', aliases: ['v', 'u', 'w', 'V', 'c', 'U'] },
    { id: 'acceleration', name: 'Aceleración', symbol: 'a', dimension: { L: 1, T: -2 }, unit: 'm/s²', domain: 'Cinemática', aliases: ['a'] },
    { id: 'gravity', name: 'Aceleración Gravitatoria', symbol: 'g', dimension: { L: 1, T: -2 }, unit: 'm/s²', domain: 'Dinámica', aliases: ['g'] },
    { id: 'angular_velocity', name: 'Velocidad Angular', symbol: '\\omega', dimension: { T: -1 }, unit: 'rad/s', domain: 'Cinemática', aliases: ['omega', 'w_rot', 'N_rot'] },
    { id: 'frequency', name: 'Frecuencia', symbol: 'f', dimension: { T: -1 }, unit: 'Hz', domain: 'Dinámica', aliases: ['f', 'nu_freq'] },
    { id: 'volumetric_flow', name: 'Caudal Volumétrico', symbol: 'Q', dimension: { L: 3, T: -1 }, unit: 'm³/s', domain: 'Mecánica de Fluidos', aliases: ['Q', 'Q_flow'] },
    { id: 'mass_flow', name: 'Caudal Másico', symbol: '\\dot{m}', dimension: { M: 1, T: -1 }, unit: 'kg/s', domain: 'Mecánica de Fluidos', aliases: ['mdot', 'm_dot'] },

    // Dinámica y Mecánica de Fluidos
    { id: 'force', name: 'Fuerza', symbol: 'F', dimension: { M: 1, L: 1, T: -2 }, unit: 'N', domain: 'Dinámica', aliases: ['F', 'W', 'T_force'] },
    { id: 'drag_force', name: 'Fuerza de Arrastre', symbol: 'F_d', dimension: { M: 1, L: 1, T: -2 }, unit: 'N', domain: 'Mecánica de Fluidos', aliases: ['F_d', 'Fd', 'D_force'] },
    { id: 'lift_force', name: 'Fuerza de Sustentación', symbol: 'F_l', dimension: { M: 1, L: 1, T: -2 }, unit: 'N', domain: 'Aerodinámica', aliases: ['F_l', 'Fl', 'L_force'] },
    { id: 'density', name: 'Densidad', symbol: '\\rho', dimension: { M: 1, L: -3 }, unit: 'kg/m³', domain: 'Mecánica de Fluidos', aliases: ['rho'] },
    { id: 'pressure', name: 'Presión / Esfuerzo', symbol: 'p', dimension: { M: 1, L: -1, T: -2 }, unit: 'Pa', domain: 'Mecánica de Fluidos', aliases: ['p', 'P', 'sigma_stress'] },
    { id: 'delta_p', name: 'Caída de Presión', symbol: '\\Delta p', dimension: { M: 1, L: -1, T: -2 }, unit: 'Pa', domain: 'Mecánica de Fluidos', aliases: ['delta_p', 'dp', 'Delta_p'] },
    { id: 'dynamic_viscosity', name: 'Viscosidad Dinámica', symbol: '\\mu', dimension: { M: 1, L: -1, T: -1 }, unit: 'Pa·s', domain: 'Mecánica de Fluidos', aliases: ['mu', 'eta'] },
    { id: 'kinematic_viscosity', name: 'Viscosidad Cinemática', symbol: '\\nu', dimension: { L: 2, T: -1 }, unit: 'm²/s', domain: 'Mecánica de Fluidos', aliases: ['nu'] },
    { id: 'surface_tension', name: 'Tensión Superficial', symbol: '\\sigma', dimension: { M: 1, T: -2 }, unit: 'N/m', domain: 'Mecánica de Fluidos', aliases: ['sigma', 'gamma_surf'] },
    { id: 'energy', name: 'Energía / Trabajo', symbol: 'E', dimension: { M: 1, L: 2, T: -2 }, unit: 'J', domain: 'Termodinámica', aliases: ['E', 'W_work', 'U', 'H_enthalpy'] },
    { id: 'power', name: 'Potencia', symbol: 'P', dimension: { M: 1, L: 2, T: -3 }, unit: 'W', domain: 'Mecánica', aliases: ['P_pow', 'Power'] },
    { id: 'torque', name: 'Momento / Par Torsor', symbol: 'M', dimension: { M: 1, L: 2, T: -2 }, unit: 'N·m', domain: 'Mecánica', aliases: ['Torque', 'M_torque'] },
    { id: 'roughness', name: 'Rugosidad Absoluta', symbol: '\\varepsilon', dimension: { L: 1 }, unit: 'm', domain: 'Mecánica de Fluidos', aliases: ['epsilon', 'k_rough'] },
    { id: 'speed_of_sound', name: 'Velocidad del Sonido', symbol: 'c', dimension: { L: 1, T: -1 }, unit: 'm/s', domain: 'Acústica / Aerodinámica', aliases: ['c_sound', 'a_sound'] },

    // Termodinámica y Transferencia de Calor
    { id: 'thermal_conductivity', name: 'Conductividad Térmica', symbol: 'k', dimension: { M: 1, L: 1, T: -3, Theta: -1 }, unit: 'W/(m·K)', domain: 'Transferencia de Calor', aliases: ['k', 'k_cond', 'lambda_th'] },
    { id: 'heat_transfer_coef', name: 'Coeficiente de Convección', symbol: 'h', dimension: { M: 1, T: -3, Theta: -1 }, unit: 'W/(m²·K)', domain: 'Transferencia de Calor', aliases: ['h', 'h_conv'] },
    { id: 'specific_heat', name: 'Calor Específico', symbol: 'c_p', dimension: { L: 2, T: -2, Theta: -1 }, unit: 'J/(kg·K)', domain: 'Termodinámica', aliases: ['cp', 'cv', 'c_heat'] },
    { id: 'thermal_diffusivity', name: 'Difusividad Térmica', symbol: '\\alpha', dimension: { L: 2, T: -1 }, unit: 'm²/s', domain: 'Transferencia de Calor', aliases: ['alpha', 'a_th'] },
    { id: 'thermal_expansion', name: 'Coeficiente de Dilatación Volumétrica', symbol: '\\beta', dimension: { Theta: -1 }, unit: '1/K', domain: 'Termodinámica', aliases: ['beta', 'beta_th'] },
    { id: 'delta_T', name: 'Salto Térmico', symbol: '\\Delta T', dimension: { Theta: 1 }, unit: 'K', domain: 'Transferencia de Calor', aliases: ['delta_T', 'dT', 'Delta_T'] },
    { id: 'heat_flux', name: 'Densidad de Flujo Térmico', symbol: 'q\"', dimension: { M: 1, T: -3 }, unit: 'W/m²', domain: 'Transferencia de Calor', aliases: ['q_flux', 'q_dot'] },

    // Transferencia de Masa
    { id: 'mass_diffusivity', name: 'Difusividad de Masa', symbol: 'D_{AB}', dimension: { L: 2, T: -1 }, unit: 'm²/s', domain: 'Transferencia de Masa', aliases: ['D_AB', 'D_mass'] },
    { id: 'mass_transfer_coef', name: 'Coeficiente de Transferencia de Masa', symbol: 'k_c', dimension: { L: 1, T: -1 }, unit: 'm/s', domain: 'Transferencia de Masa', aliases: ['k_c', 'kc'] },

    // Electromagnetismo
    { id: 'electric_charge', name: 'Carga Eléctrica', symbol: 'q', dimension: { T: 1, I: 1 }, unit: 'C', domain: 'Electromagnetismo', aliases: ['q_charge', 'Q_charge'] },
    { id: 'electric_potential', name: 'Potencial Eléctrico / Tensión', symbol: 'V', dimension: { M: 1, L: 2, T: -3, I: -1 }, unit: 'V', domain: 'Electromagnetismo', aliases: ['V_pot', 'U_volt'] },
    { id: 'electrical_resistance', name: 'Resistencia Eléctrica', symbol: 'R_e', dimension: { M: 1, L: 2, T: -3, I: -2 }, unit: 'Ω', domain: 'Electromagnetismo', aliases: ['R_elec', 'R_ohm'] },
    { id: 'capacitance', name: 'Capacitancia', symbol: 'C_e', dimension: { M: -1, L: -2, T: 4, I: 2 }, unit: 'F', domain: 'Electromagnetismo', aliases: ['C_elec'] },
    { id: 'inductance', name: 'Inductancia', symbol: 'L_e', dimension: { M: 1, L: 2, T: -2, I: -2 }, unit: 'H', domain: 'Electromagnetismo', aliases: ['L_ind'] },
    { id: 'magnetic_flux_density', name: 'Inducción Magnética', symbol: 'B', dimension: { M: 1, T: -2, I: -1 }, unit: 'T', domain: 'Electromagnetismo', aliases: ['B_field'] }
];

const DIMENSIONLESS_NUMBERS = [
    {
        id: 'reynolds',
        name: 'Número de Reynolds',
        symbol: 'Re',
        formula: '\\frac{\\rho v L}{\\mu} = \\frac{v L}{\\nu}',
        definition: 'rho * v * L / mu',
        variables: ['rho', 'v', 'L', 'mu'],
        domain: 'Mecánica de Fluidos',
        physicalRatio: 'Fuerzas Inerciales / Fuerzas Viscosas',
        interpretation: 'Gobierna el régimen hidrodinámico. Para flujo interno en conductos cerrados: laminar si Re < 2300, transición 2300 < Re < 4000, turbulento si Re > 4000. En cuerpos romos, rige el desprendimiento de vórtices y el espesor de la capa límite.',
        asymptotics: 'Re -> 0: Flujo de Stokes (inercia despreciable, reversibilidad cinemática). Re -> inf: Flujo de capa límite de Prandtl y turbulencia plenamente desarrollada.',
        references: 'Reynolds, O. (1883). Phil. Trans. Royal Soc. London.'
    },
    {
        id: 'froude',
        name: 'Número de Froude',
        symbol: 'Fr',
        formula: '\\frac{v}{\\sqrt{g L}}',
        definition: 'v / (g * L)^(1/2)',
        variables: ['v', 'g', 'L'],
        domain: 'Hidráulica de Canales y Naval',
        physicalRatio: 'Fuerzas Inerciales / Fuerzas Gravitatorias',
        interpretation: 'Crucial en flujos con superficie libre (canales, aliviaderos, cascos de buques). Fr < 1: régimen subcrítico o tranquilo; Fr = 1: régimen crítico; Fr > 1: régimen supercrítico o torrencial con posibilidad de resalto hidráulico.',
        asymptotics: 'Fr << 1: Ondas superficiales viajan más rápido que el fluido. Fr >> 1: Ondas no pueden propagarse aguas arriba.',
        references: 'Froude, W. (1868). Observations on the Hull of the HMS Greyhound.'
    },
    {
        id: 'mach',
        name: 'Número de Mach',
        symbol: 'Ma',
        formula: '\\frac{v}{c}',
        definition: 'v / c',
        variables: ['v', 'c'],
        domain: 'Aerodinámica y Flujo Compresible',
        physicalRatio: 'Velocidad de Flujo / Velocidad del Sonido Local',
        interpretation: 'Mide los efectos de compresibilidad del gas. Si Ma < 0.3, la variación de densidad es menor al 5% y el flujo puede modelarse como incompresible. Ma = 1: sónico; Ma > 1: supersónico con formación de ondas de choque normales y oblicuas.',
        asymptotics: 'Ma -> 0: Ecuaciones incompresibles de Navier-Stokes. Ma >> 1: Régimen hipersónico con disociación térmica de moléculas de aire.',
        references: 'Mach, E. (1887). Akademie der Wissenschaften, Wien.'
    },
    {
        id: 'nusselt',
        name: 'Número de Nusselt',
        symbol: 'Nu',
        formula: '\\frac{h L}{k}',
        definition: 'h * L / k',
        variables: ['h', 'L', 'k'],
        domain: 'Transferencia de Calor',
        physicalRatio: 'Convección Térmica / Conducción a través del Fluido',
        interpretation: 'Gradiente adimensional de temperatura en la interfase fluido-sólido. Nu = 1 indica pura conducción sin movimiento convectivo. Valores elevados (Nu >> 1) representan convección activa intensa.',
        asymptotics: 'Nu = 1: Conducción pura en fluido estancado. Nu ~ Re^0.8 * Pr^0.4 (Correlación de Dittus-Bölter en flujo turbulento).',
        references: 'Nusselt, W. (1915). Das Grundgesetz des Wärmeüberganges.'
    },
    {
        id: 'prandtl',
        name: 'Número de Prandtl',
        symbol: 'Pr',
        formula: '\\frac{\\nu}{\\alpha} = \\frac{c_p \\mu}{k}',
        definition: 'nu / alpha',
        variables: ['nu', 'alpha'],
        domain: 'Transferencia de Calor',
        physicalRatio: 'Difusividad de Momento / Difusividad Térmica',
        interpretation: 'Propiedad pura del fluido (no depende de la geometría). Determina la razón de espesores entre la capa límite hidrodinámica (delta) y la capa límite térmica (delta_t): delta/delta_t ~ Pr^(1/3). Metales líquidos: Pr ~ 0.01; Gases: Pr ~ 0.7; Agua: Pr ~ 2 a 10; Aceites lubricantes: Pr ~ 100 a 100000.',
        asymptotics: 'Pr << 1: Capa límite térmica mucho más gruesa que la viscosa. Pr >> 1: Capa límite térmica confinada dentro del subestrato viscoso.',
        references: 'Prandtl, L. (1904). Verh. III. Int. Math. Kongr., Heidelberg.'
    },
    {
        id: 'weber',
        name: 'Número de Weber',
        symbol: 'We',
        formula: '\\frac{\\rho v^2 L}{\\sigma}',
        definition: 'rho * v^2 * L / sigma',
        variables: ['rho', 'v', 'L', 'sigma'],
        domain: 'Mecánica de Fluidos e Interfases',
        physicalRatio: 'Fuerzas Inerciales / Fuerzas de Tensión Superficial',
        interpretation: 'Determina la estabilidad de gotas, burbujas y atomización de chorros líquidos en inyectores de combustión. Un valor crítico We_c ~ 10-12 desencadena la fragmentación secundaria aerodinámica de la gota.',
        asymptotics: 'We << 1: Tensión superficial domina; menisco y gotas perfectamente esféricas. We >> 1: Inercia fragmenta la superficie líquida.',
        references: 'Weber, M. (1930). Jahrbuch der Schiffbautechnischen Gesellschaft.'
    },
    {
        id: 'grashof',
        name: 'Número de Grashof',
        symbol: 'Gr',
        formula: '\\frac{g \\beta \\Delta T L^3}{\\nu^2}',
        definition: 'g * beta * delta_T * L^3 / nu^2',
        variables: ['g', 'beta', 'delta_T', 'L', 'nu'],
        domain: 'Convección Natural',
        physicalRatio: 'Fuerzas de Flotación Térmica / Fuerzas Viscosas',
        interpretation: 'Rige el movimiento del fluido inducido por gradientes de densidad causados por diferencias térmicas bajo gravedad. Actúa en convección libre de manera análoga al cuadrado del número de Reynolds (Gr ~ Re^2).',
        asymptotics: 'Gr / Re^2 << 1: Convección forzada pura. Gr / Re^2 >> 1: Convección natural pura. Gr / Re^2 ~ 1: Convección mixta combinada.',
        references: 'Grashof, F. (1886). Theoretische Maschinenlehre.'
    },
    {
        id: 'rayleigh',
        name: 'Número de Rayleigh',
        symbol: 'Ra',
        formula: 'Ra = Gr \\cdot Pr = \\frac{g \\beta \\Delta T L^3}{\\nu \\alpha}',
        definition: 'g * beta * delta_T * L^3 / (nu * alpha)',
        variables: ['g', 'beta', 'delta_T', 'L', 'nu', 'alpha'],
        domain: 'Convección Natural',
        physicalRatio: 'Flotación Térmica / (Amortiguamiento Viscoso y Difusión Térmica)',
        interpretation: 'Parámetro fundamental en inestabilidad de Rayleigh-Bénard y convección libre. Para una placa vertical, transición a turbulencia cuando Ra > 10^9.',
        asymptotics: 'Ra < Ra_crit: Estabilidad, calor conducido por el fluido inmóvil. Ra > Ra_crit: Formación de celdas convectivas y plumas térmicas.',
        references: 'Rayleigh, Lord (1916). Phil. Mag. Ser. 6, 32.'
    },
    {
        id: 'euler',
        name: 'Número de Euler',
        symbol: 'Eu',
        formula: '\\frac{\\Delta p}{\\rho v^2}',
        definition: 'p / (rho * v^2)',
        variables: ['p', 'rho', 'v'],
        domain: 'Mecánica de Fluidos',
        physicalRatio: 'Fuerzas de Presión / Fuerzas Inerciales',
        interpretation: 'Relaciona la pérdida de carga o caída de presión hidrodinámica con la energía cinética dinámica del fluido. En flujo incompresible no viscoso, Eu es constante.',
        asymptotics: 'Equivalente al coeficiente de presión Cp y estrechamente ligado al número de cavitación sigma = (p_ref - p_v)/(0.5 * rho * v^2).',
        references: 'Euler, L. (1757). Hist. Acad. Roy. Berlin.'
    },
    {
        id: 'strouhal',
        name: 'Número de Strouhal',
        symbol: 'St',
        formula: '\\frac{f L}{v}',
        definition: 'f * L / v',
        variables: ['f', 'L', 'v'],
        domain: 'Aeroacústica y Flujo Pulsátil',
        physicalRatio: 'Frecuencia de Desprendimiento / Tasa Convectiva',
        interpretation: 'Describe la frecuencia del desprendimiento de vórtices alternados en la calle de Von Kármán detrás de cuerpos romos (cilindros, chimeneas, cables aéreos). Para cilindros circulares en subcrítico, St ~ 0.20-0.21.',
        asymptotics: 'St << 1: Régimen cuasiestacionario. St ~ 0.2: Resonancia acústica y oscilaciones inducidas por vórtices (VIV).',
        references: 'Strouhal, V. (1878). Annalen der Physik und Chemie.'
    },
    {
        id: 'peclet',
        name: 'Número de Péclet',
        symbol: 'Pe',
        formula: 'Pe = Re \\cdot Pr = \\frac{v L}{\\alpha}',
        definition: 'L * v / alpha',
        variables: ['L', 'v', 'alpha'],
        domain: 'Transferencia de Calor y Masa',
        physicalRatio: 'Tasa de Advección / Tasa de Difusión',
        interpretation: 'Compara el transporte transportado macroscópicamente por el flujo frente a la difusión molecular. Pe >> 1 implica transporte dominado por advección (capas límite delgadas); Pe << 1 implica dominancia difusiva isotrópica.',
        asymptotics: 'Pe -> 0: Ecuación de Laplace pura (difusión elíptica). Pe -> inf: Transporte hiperbólico puro.',
        references: 'Péclet, J.C.E. (1843). Traité de la chaleur.'
    },
    {
        id: 'biot',
        name: 'Número de Biot',
        symbol: 'Bi',
        formula: '\\frac{h L_c}{k_s}',
        definition: 'h * L / k',
        variables: ['h', 'L', 'k'],
        domain: 'Conducción Transitoria',
        physicalRatio: 'Resistencia Térmica Interna (Sólido) / Resistencia Convectiva Superficial',
        interpretation: 'Criterio para aplicar el método de parámetros concentrados (lumped capacitance). Si Bi < 0.1, el gradiente térmico dentro del cuerpo es despreciable (< 5%) y la temperatura del sólido se asume espacialmente uniforme T(t).',
        asymptotics: 'Bi < 0.1: Temperatura interna uniforme. Bi >> 1: Conducción interna controla la velocidad de enfriamiento; superficie alcanza casi instantáneamente la temperatura del fluido.',
        references: 'Biot, J.B. (1804). Bull. Soc. Philomath.'
    },
    {
        id: 'fourier',
        name: 'Número de Fourier',
        symbol: 'Fo',
        formula: '\\frac{\\alpha t}{L_c^2}',
        definition: 'alpha * t / L^2',
        variables: ['alpha', 't', 'L'],
        domain: 'Conducción Transitoria',
        physicalRatio: 'Tasa de Conducción / Tasa de Almacenamiento Térmico',
        interpretation: 'Tiempo térmico adimensional en procesos de calentamiento o enfriamiento transitorio. Para Fo > 0.2, la solución por series truncadas de un solo término tiene un error inferior al 1%.',
        asymptotics: 'Fo << 1: La onda térmica sólo penetró una pequeña capa superficial (sólido semi-infinito). Fo >> 1: Se alcanza el régimen estacionario asintótico.',
        references: 'Fourier, J. (1822). Théorie analytique de la chaleur.'
    },
    {
        id: 'schmidt',
        name: 'Número de Schmidt',
        symbol: 'Sc',
        formula: '\\frac{\\nu}{D_{AB}}',
        definition: 'nu / D_AB',
        variables: ['nu', 'D_AB'],
        domain: 'Transferencia de Masa',
        physicalRatio: 'Difusividad de Momento / Difusividad de Masa Molecular',
        interpretation: 'Análogo en transferencia de masa al número de Prandtl en calor. Rige la razón entre el espesor de la capa límite de velocidad y la capa límite de concentración: delta/delta_c ~ Sc^(1/3). Gases: Sc ~ 0.6-2; Líquidos: Sc ~ 1000.',
        asymptotics: 'Sc ~ 1: Capas límite de concentración y velocidad crecen al mismo ritmo.',
        references: 'Schmidt, E. (1929). Ges. Wiss. Göttingen.'
    },
    {
        id: 'sherwood',
        name: 'Número de Sherwood',
        symbol: 'Sh',
        formula: '\\frac{k_c L}{D_{AB}}',
        definition: 'k_c * L / D_AB',
        variables: ['k_c', 'L', 'D_AB'],
        domain: 'Transferencia de Masa',
        physicalRatio: 'Transferencia Convectiva de Masa / Difusión Molecular Pura',
        interpretation: 'Análogo en transferencia de masa al número de Nusselt en calor. Representa el gradiente adimensional de concentración en la superficie limítrofe.',
        asymptotics: 'Sh = 2: Valor asintótico mínimo para una gota esférica o esfera estancada en medio infinito.',
        references: 'Sherwood, T.K. (1937). Absorption and Extraction.'
    },
    {
        id: 'knudsen',
        name: 'Número de Knudsen',
        symbol: 'Kn',
        formula: '\\frac{\\lambda_{mfp}}{L}',
        definition: 'lambda_mfp / L',
        variables: ['lambda_mfp', 'L'],
        domain: 'Gases Enrarecidos y Microfluídica',
        physicalRatio: 'Recorrido Libre Medio Molecular / Longitud Característica Macroscópica',
        interpretation: 'Define la validez de la hipótesis del medio continuo. Kn < 0.001: continuo con adherencia; 0.001 < Kn < 0.1: flujo con deslizamiento en pared; 0.1 < Kn < 10: transición; Kn > 10: flujo molecular libre (teoría cinética pura de Boltzmann).',
        asymptotics: 'Kn -> 0: Validez plena de las ecuaciones de Navier-Stokes clásicas.',
        references: 'Knudsen, M. (1909). Ann. Phys.'
    },
    {
        id: 'womersley',
        name: 'Número de Womersley',
        symbol: 'Wo',
        formula: 'L \\sqrt{\\frac{\\omega \\rho}{\\mu}} = L \\sqrt{\\frac{\\omega}{\\nu}}',
        definition: 'L * (omega * rho / mu)^(1/2)',
        variables: ['L', 'omega', 'rho', 'mu'],
        domain: 'Flujo Pulsátil y Biomecánica',
        physicalRatio: 'Fuerzas Inerciales Transitorias / Fuerzas Viscosas',
        interpretation: 'Frecuencia adimensional en flujos pulsátiles (por ejemplo, hemodinámica en arterias o pulsaciones de bombas de desplazamiento positivo). Wo < 1: perfil parabólico de Poiseuille sigue casi instantáneamente el gradiente de presión. Wo > 10: perfil aplanado con capa límite delgada desfasada 90° respecto a la presión.',
        asymptotics: 'Wo << 1: Flujo cuasi-estacionario. Wo >> 1: Flujo dominado por inercia pulsante con perfil plano ("plug flow").',
        references: 'Womersley, J.R. (1955). J. Physiol.'
    },
    {
        id: 'drag_coefficient',
        name: 'Coeficiente de Arrastre',
        symbol: 'C_d',
        formula: '\\frac{F_d}{\\frac{1}{2} \\rho v^2 A}',
        definition: 'F_d / (rho * v^2 * L^2)',
        variables: ['F_d', 'rho', 'v', 'L'],
        domain: 'Aerodinámica / Hidrodinámica',
        physicalRatio: 'Fuerza de Resistencia / Presión Dinámica por Área de Referencia',
        interpretation: 'Adimensionaliza la fuerza total de arrastre (fricción viscosa + presión de forma). Para esfera en régimen de Stokes: Cd = 24/Re. En régimen turbulento subcrítico Cd ~ 0.44; sufre la crisis de arrastre a Re ~ 3e5 donde cae a Cd ~ 0.1.',
        asymptotics: 'Re < 1: Cd = 24/Re (ley de Stokes). Re > 10^3: Cd independiente de Re debido a separación inercial fija.',
        references: 'Prandtl, L. & Tietjens, O.G. (1934).'
    }
];

const ENGINEERING_PRESETS = [
    {
        id: 'drag_sphere',
        title: 'Fuerza de Arrastre en Esfera Fluida',
        description: 'Deducción de la resistencia hidrodinámica/aerodinámica sobre un cuerpo sumergido como función de la densidad, velocidad, diámetro y viscosidad dinámica.',
        quantities: ['density', 'velocity', 'length', 'drag_force', 'dynamic_viscosity'],
        symbols: ['\\rho', 'v', 'D', 'F_d', '\\mu'],
        expectedGroups: [
            { id: 'pi_drag', name: 'Coeficiente de Arrastre', formula: '\\frac{F_d}{\\rho v^2 D^2} = C_d' },
            { id: 'pi_reynolds', name: 'Número de Reynolds Inverso', formula: '\\frac{\\mu}{\\rho v D} = \\frac{1}{Re}' }
        ],
        theory: 'La fuerza de arrastre $F_d$ depende de cuatro variables independientes $(\\rho, v, D, \\mu)$. Al haber 3 dimensiones básicas activas ($M, L, T$), el teorema $\\Pi$ garantiza $5 - 3 = 2$ grupos adimensionales independientes: $C_d = \\phi(Re)$.'
    },
    {
        id: 'simple_pendulum',
        title: 'Período del Péndulo Simple',
        description: 'Deducción de la ley de oscilación de un péndulo gravitatorio demostrando dimensionalmente la independencia de la masa.',
        quantities: ['length', 'gravity', 'mass', 'time'],
        symbols: ['L', 'g', 'm', 'T'],
        expectedGroups: [
            { id: 'pi_pendulum', name: 'Frecuencia Adimensional', formula: '\\frac{g T^2}{L} \\implies T = C \\sqrt{\\frac{L}{g}}' }
        ],
        theory: 'Al incluir la masa $m$, observamos que la dimensión $M$ sólo aparece en ella y en ninguna otra variable del problema mecánico. Por lo tanto, el exponente de $m$ en el espacio nulo es estrictamente 0, demostrando formalmente que el período del péndulo no depende de la masa oscilante.'
    },
    {
        id: 'darcy_weisbach',
        title: 'Pérdida de Carga en Tuberías (Darcy-Weisbach)',
        description: 'Análisis dimensional de la caída de presión en conductos circulares rugosos para flujo estacionario incompresible.',
        quantities: ['density', 'velocity', 'length', 'delta_p', 'dynamic_viscosity', 'roughness'],
        symbols: ['\\rho', 'v', 'D', '\\Delta p', '\\mu', '\\varepsilon'],
        expectedGroups: [
            { id: 'pi_euler', name: 'Número de Euler / Coeficiente de Pérdida', formula: '\\frac{\\Delta p}{\\rho v^2} = \\frac{1}{2} f \\frac{L}{D}' },
            { id: 'pi_reynolds', name: 'Número de Reynolds Inverso', formula: '\\frac{\\mu}{\\rho v D} = \\frac{1}{Re}' },
            { id: 'pi_roughness', name: 'Rugosidad Relativa', formula: '\\frac{\\varepsilon}{D}' }
        ],
        theory: 'Permite fundamentar rigurosamente el diagrama de Moody: el factor de fricción de Darcy depende únicamente del número de Reynolds y de la rugosidad relativa del conducto: $f = \\phi(Re, \\varepsilon/D)$.'
    },
    {
        id: 'taylor_blast',
        title: 'Explosión Nuclear de G.I. Taylor (Trinity 1947)',
        description: 'Cálculo de la energía liberada en una detonación puntual mediante el radio de expansión de la onda de choque en el tiempo.',
        quantities: ['density', 'energy', 'time', 'length'],
        symbols: ['\\rho', 'E', 't', 'R'],
        expectedGroups: [
            { id: 'pi_taylor', name: 'Invariante de Taylor', formula: '\\frac{\\rho R^5}{E t^2} = \\xi_0^5 \\implies R(t) = \\xi_0 \\left(\\frac{E}{\\rho}\\right)^{1/5} t^{2/5}' }
        ],
        theory: 'En 1947, Sir Geoffrey Ingram Taylor utilizó este único grupo adimensional para estimar con menos del 10% de error la potencia secreta de la bomba nuclear Trinity (aprox. 22 kilotones de TNT) a partir de fotografías militares publicadas en revistas desclasificadas.'
    },
    {
        id: 'convection_dittus',
        title: 'Convección Térmica Forzada en Conducto',
        description: 'Deducción de la ecuación universal de transferencia de calor en flujo interno turbulento.',
        quantities: ['density', 'velocity', 'length', 'thermal_conductivity', 'heat_transfer_coef', 'dynamic_viscosity', 'specific_heat'],
        symbols: ['\\rho', 'v', 'D', 'k', 'h', '\\mu', 'c_p'],
        expectedGroups: [
            { id: 'pi_nusselt', name: 'Número de Nusselt', formula: '\\frac{h D}{k} = Nu' },
            { id: 'pi_reynolds', name: 'Número de Reynolds Inverso', formula: '\\frac{\\mu}{\\rho v D} = \\frac{1}{Re}' },
            { id: 'pi_peclet', name: 'Número de Péclet', formula: '\\frac{\\rho v D c_p}{k} = Re \\cdot Pr' }
        ],
        theory: 'Al haber 7 variables y 4 dimensiones básicas ($M, L, T, \\Theta$), el teorema $\\Pi$ arroja exactamente 3 grupos independientes: $Nu = f(Re, Pr)$, que es la estructura de la correlación de Dittus-Bölter.'
    },
    {
        id: 'surface_waves',
        title: 'Velocidad de Propagación de Ondas Superficiales',
        description: 'Ondas en interfase líquido-gas bajo gravedad y tensión superficial (ondas de gravedad y capilares).',
        quantities: ['density', 'velocity', 'length', 'gravity', 'surface_tension'],
        symbols: ['\\rho', 'c', '\\lambda', 'g', '\\sigma'],
        expectedGroups: [
            { id: 'pi_froude', name: 'Número de Froude Inverso Cuadrado', formula: '\\frac{g \\lambda}{c^2} = \\frac{1}{Fr^2}' },
            { id: 'pi_weber', name: 'Número de Weber Inverso', formula: '\\frac{\\sigma}{\\rho c^2 \\lambda} = \\frac{1}{We}' }
        ],
        theory: 'Explica la transición entre olas de gravedad marinas (longitud de onda kilométrica o métrica dominadas por $g$) y ondas capilares milimétricas (dominadas por la tensión superficial $\\sigma$).'
    },
    {
        id: 'centrifugal_pump',
        title: 'Turbomáquinas Hidráulicas (Leyes de Afinidad)',
        description: 'Comportamiento adimensional de bombas centrífugas para cambio de velocidad de giro y diámetro del impulsor.',
        quantities: ['density', 'angular_velocity', 'length', 'volumetric_flow', 'energy'],
        symbols: ['\\rho', '\\omega', 'D', 'Q', 'gH'],
        expectedGroups: [
            { id: 'pi_flow', name: 'Coeficiente de Caudal', formula: '\\frac{Q}{\\omega D^3} = C_Q' },
            { id: 'pi_head', name: 'Coeficiente Manométrico', formula: '\\frac{g H}{\\omega^2 D^2} = C_H' }
        ],
        theory: 'Demuestra las leyes de semejanza de bombas centrífugas: $Q \\propto N D^3$, $H \\propto N^2 D^2$, y $P \\propto \\rho N^3 D^5$.'
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BASE_DIMENSIONS,
        PHYSICAL_QUANTITIES,
        DIMENSIONLESS_NUMBERS,
        ENGINEERING_PRESETS
    };
}
