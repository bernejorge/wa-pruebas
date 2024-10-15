const { AIMessage, HumanMessage, ToolMessage } = require('@langchain/core/messages');

return [
    // El usuario solicita sacar un turno
    new HumanMessage("Quisiera sacar un turno."),

    // El modelo solicita el DNI al usuario
    new AIMessage("Para ayudarte a sacar un turno, necesito que digas tu DNI."),

    // El usuario ingresa su DNI
    new HumanMessage("Mi DNI es 12345678."),

    // El modelo hace la llamada a la herramienta "validate_user"
    new AIMessage({
        content: "",
        tool_calls: [
            {
                id: "dni_validation_001",
                name: "validate_user",
                args: {
                    dni: "12345678", // El DNI ingresado por el usuario
                },
            },
        ],
    }),

    // El resultado de la herramienta "validar_dni"
    new ToolMessage({
        tool_call_id: "dni_validation_001",
        content: JSON.stringify({
            validate: true,
            message: "El usuario ha sido validado con éxito.",
        }),
    }),

    // Respuesta del modelo tras la validación
    new AIMessage("El DNI ha sido validado con éxito. ¿En qué especialidad médica o con qué profesional te gustaría solicitar tu turno?"),

    // El usuario ingresa una especialidad médica o el nombre del profesional
    new HumanMessage("Me gustaría un turno para cardiología."),

    // El modelo hace la llamada a la herramienta "profesionalesferreyra"
    new AIMessage({
        content: "",
        tool_calls: [
            {
                id: "profesionales_query_001",
                name: "profesionalesferreyra",
                args: {
                    input: "cardiología", // El input puede ser la especialidad o el nombre del profesional
                },
            },
        ],
    }),

    // El resultado de la herramienta "profesionalesferreyra" con múltiples centros de atención
    new ToolMessage({
        tool_call_id: "profesionales_query_001",
        content: JSON.stringify({
            success: true,
            data: [
                {
                    Institucion: "Hospital Raúl Ferreyra",
                    IdCentroAtencion: 19,
                    CentroDeAtencion: "HOSPITAL RAÚL ÁNGEL FERREYRA",
                    Profesionales: [
                        {
                            IdProfesional: 17677,
                            Profesional: "EGEA PERALTA NICOLAS DANTE",
                            Servicio: "CARDIOLOGÍA",
                        },
                        {
                            IdProfesional: 19432,
                            Profesional: "ALTAMIRANO MARCELA BEATRIZ",
                            Servicio: "CARDIOLOGÍA",
                        },
                    ],
                },
                {
                    Institucion: "Hospital Raúl Ferreyra",
                    IdCentroAtencion: 32,
                    CentroDeAtencion: "HRF ANEXO CENTRO",
                    Profesionales: [
                        {
                            IdProfesional: 16410,
                            Profesional: "GUEVARA ARTEMIO ANTONIO",
                            Servicio: "CARDIOLOGÍA",
                        },
                    ],
                },
            ],
        }),
    }),

    // Respuesta del modelo agrupando profesionales por centro
    new AIMessage("Estos son los profesionales disponibles para cardiología agrupados por centros de atención:\n\n" +
        "En el HOSPITAL RAÚL ÁNGEL FERREYRA:\n" +
        "- EGEA PERALTA NICOLAS DANTE (Cardiología)\n" +
        "- ALTAMIRANO MARCELA BEATRIZ (Cardiología)\n\n" +
        "En el HRF ANEXO CENTRO:\n" +
        "- GUEVARA ARTEMIO ANTONIO (Cardiología)\n" +
        "¿Con cuál profesional y en qué centro te gustaría agendar el turno?"),

    // El usuario selecciona un profesional y un centro
    new HumanMessage("Me gustaría agendar con EGEA PERALTA NICOLAS DANTE en el HOSPITAL RAÚL ÁNGEL FERREYRA."),

    // El modelo hace la llamada a la herramienta "obtener_prestaciones_para_servicio_profesional"
    new AIMessage({
        content: "",
        tool_calls: [
            {
                id: "prestaciones_query_001",
                name: "obtener_prestaciones_para_servicio_profesional",
                args: {
                    IdCentroAtencion: 19,      // Centro seleccionado por el usuario
                    IdServicio: 421,           // Servicio de cardiología
                    IdProfesional: 17677,      // Profesional seleccionado: EGEA PERALTA NICOLAS DANTE
                },
            },
        ],
    }),

    // El resultado de la herramienta "obtener_prestaciones_para_servicio_profesional"
    new ToolMessage({
        tool_call_id: "prestaciones_query_001",
        content: JSON.stringify({
            IdCentroAtencion: 19,
            CentroDeAtencion: "HOSPITAL RAÚL ÁNGEL FERREYRA",
            IdProfesional: 17677,
            Profesional: "EGEA PERALTA NICOLAS DANTE",
            IdServicio: 421,
            Servicio: "CARDIOLOGÍA",
            Prestaciones: [
                {
                    IdPrestacion: 1,
                    NombrePrestacion: "CONSULTA TELEMEDICINA",
                },
                {
                    IdPrestacion: 2,
                    NombrePrestacion: "CONSULTA",
                },
            ],
        }),
    }),

    // Respuesta del modelo con las prestaciones disponibles
    new AIMessage("Las prestaciones disponibles con el profesional EGEA PERALTA NICOLAS DANTE son:\n" +
        "1. CONSULTA TELEMEDICINA\n" +
        "2. CONSULTA\n" +
        "¿Cuál de estas prestaciones prefieres para tu turno?"),
];
