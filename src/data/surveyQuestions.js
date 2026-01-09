// Default survey questions - can be modified from admin panel
export const defaultSurveyQuestions = [
    {
        id: 'q1',
        category: 'ambiente',
        categoryName: 'Ambiente Laboral',
        question: 'Me siento cómodo y seguro en mi lugar de trabajo'
    },
    {
        id: 'q2',
        category: 'ambiente',
        categoryName: 'Ambiente Laboral',
        question: 'Las instalaciones y equipos de trabajo son adecuados para realizar mis funciones'
    },
    {
        id: 'q3',
        category: 'ambiente',
        categoryName: 'Ambiente Laboral',
        question: 'Existe un buen ambiente de compañerismo y colaboración entre colegas'
    },
    {
        id: 'q4',
        category: 'ambiente',
        categoryName: 'Ambiente Laboral',
        question: 'Me siento valorado y respetado por mis compañeros de trabajo'
    },
    {
        id: 'q5',
        category: 'ambiente',
        categoryName: 'Ambiente Laboral',
        question: 'El ambiente de trabajo me permite concentrarme y ser productivo'
    },
    {
        id: 'q6',
        category: 'liderazgo',
        categoryName: 'Liderazgo y Supervisión',
        question: 'Mi supervisor inmediato me brinda el apoyo necesario para realizar mi trabajo'
    },
    {
        id: 'q7',
        category: 'liderazgo',
        categoryName: 'Liderazgo y Supervisión',
        question: 'Recibo retroalimentación constructiva sobre mi desempeño de manera regular'
    },
    {
        id: 'q8',
        category: 'liderazgo',
        categoryName: 'Liderazgo y Supervisión',
        question: 'Mi supervisor trata a todos los miembros del equipo de manera justa y equitativa'
    },
    {
        id: 'q9',
        category: 'liderazgo',
        categoryName: 'Liderazgo y Supervisión',
        question: 'Confío en las decisiones que toma mi supervisor'
    },
    {
        id: 'q10',
        category: 'liderazgo',
        categoryName: 'Liderazgo y Supervisión',
        question: 'Mi supervisor reconoce y valora mi trabajo y esfuerzo'
    },
    {
        id: 'q11',
        category: 'comunicacion',
        categoryName: 'Comunicación',
        question: 'La comunicación entre departamentos es clara y efectiva'
    },
    {
        id: 'q12',
        category: 'comunicacion',
        categoryName: 'Comunicación',
        question: 'Me siento informado sobre los cambios y decisiones importantes de la empresa'
    },
    {
        id: 'q13',
        category: 'comunicacion',
        categoryName: 'Comunicación',
        question: 'Puedo expresar mis ideas y opiniones sin temor a represalias'
    },
    {
        id: 'q14',
        category: 'comunicacion',
        categoryName: 'Comunicación',
        question: 'Mis sugerencias y comentarios son tomados en cuenta'
    },
    {
        id: 'q15',
        category: 'comunicacion',
        categoryName: 'Comunicación',
        question: 'Existe transparencia en la comunicación de la dirección hacia los empleados'
    },
    {
        id: 'q16',
        category: 'desarrollo',
        categoryName: 'Desarrollo Profesional',
        question: 'Tengo oportunidades de crecimiento y desarrollo profesional en la empresa'
    },
    {
        id: 'q17',
        category: 'desarrollo',
        categoryName: 'Desarrollo Profesional',
        question: 'La empresa me ofrece capacitación y formación para mejorar mis habilidades'
    },
    {
        id: 'q18',
        category: 'desarrollo',
        categoryName: 'Desarrollo Profesional',
        question: 'Veo un futuro a largo plazo para mí en esta organización'
    },
    {
        id: 'q19',
        category: 'desarrollo',
        categoryName: 'Desarrollo Profesional',
        question: 'Mi trabajo actual me permite aprender y desarrollar nuevas competencias'
    },
    {
        id: 'q20',
        category: 'desarrollo',
        categoryName: 'Desarrollo Profesional',
        question: 'Existen planes de carrera claros y alcanzables en la empresa'
    },
    {
        id: 'q21',
        category: 'compensacion',
        categoryName: 'Compensación y Beneficios',
        question: 'Considero que mi salario es justo en relación con mis responsabilidades'
    },
    {
        id: 'q22',
        category: 'compensacion',
        categoryName: 'Compensación y Beneficios',
        question: 'Los beneficios que ofrece la empresa satisfacen mis necesidades'
    },
    {
        id: 'q23',
        category: 'compensacion',
        categoryName: 'Compensación y Beneficios',
        question: 'El sistema de reconocimientos e incentivos es adecuado y motivador'
    },
    {
        id: 'q24',
        category: 'compensacion',
        categoryName: 'Compensación y Beneficios',
        question: 'Mi compensación es competitiva comparada con otras empresas del sector'
    },
    {
        id: 'q25',
        category: 'compensacion',
        categoryName: 'Compensación y Beneficios',
        question: 'Estoy satisfecho con el paquete total de compensación y beneficios'
    },
    {
        id: 'q26',
        category: 'balance',
        categoryName: 'Balance Vida-Trabajo',
        question: 'Puedo mantener un equilibrio saludable entre mi vida personal y laboral'
    },
    {
        id: 'q27',
        category: 'balance',
        categoryName: 'Balance Vida-Trabajo',
        question: 'La carga de trabajo es razonable y manejable'
    },
    {
        id: 'q28',
        category: 'balance',
        categoryName: 'Balance Vida-Trabajo',
        question: 'La empresa respeta mi tiempo personal y familiar'
    },
    {
        id: 'q29',
        category: 'balance',
        categoryName: 'Balance Vida-Trabajo',
        question: 'Tengo flexibilidad en mi horario cuando lo necesito'
    },
    {
        id: 'q30',
        category: 'balance',
        categoryName: 'Balance Vida-Trabajo',
        question: 'Me siento descansado y con energía para realizar mi trabajo'
    }
];

export const categoryInfo = {
    ambiente: {
        name: 'Ambiente Laboral',
        description: 'Evalúa las condiciones físicas y sociales del entorno de trabajo',
        color: '#10b981'
    },
    liderazgo: {
        name: 'Liderazgo y Supervisión',
        description: 'Mide la efectividad del liderazgo y la supervisión directa',
        color: '#6366f1'
    },
    comunicacion: {
        name: 'Comunicación',
        description: 'Evalúa la calidad y efectividad de la comunicación organizacional',
        color: '#f59e0b'
    },
    desarrollo: {
        name: 'Desarrollo Profesional',
        description: 'Mide las oportunidades de crecimiento y desarrollo de carrera',
        color: '#8b5cf6'
    },
    compensacion: {
        name: 'Compensación y Beneficios',
        description: 'Evalúa la satisfacción con la compensación total',
        color: '#ec4899'
    },
    balance: {
        name: 'Balance Vida-Trabajo',
        description: 'Mide el equilibrio entre responsabilidades laborales y personales',
        color: '#14b8a6'
    }
};

export const scaleLabels = {
    1: 'Muy en desacuerdo',
    2: 'En desacuerdo',
    3: 'Neutral',
    4: 'De acuerdo',
    5: 'Muy de acuerdo'
};
