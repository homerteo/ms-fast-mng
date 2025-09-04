export default {
  navigation: {
    settings: "Configuraciones",
    "fast-mng-shark-attack-management": "SharkAttacks",
  },
  shark_attacks: {
    shark_attacks: "SharkAttacks",
    search: "Búsqueda rápida por nombre",
    add_new_shark_attack: "Agregar",
    add_new_shark_attack_short: "+",
    import_shark_attacks: "Importar",
    import_shark_attacks_short: "↓",
    import_shark_attacks_by_Country: "Consultar más casos en",
    import_shark_attacks_by_Country_short: "Consultar en",
    rows_per_page: "Filas por página:",
    of: "de",
    remove: "Eliminar",
    table_colums: {
      date: "Fecha",
      country: "País",
      type: "tipo",
      species: "Especie",
      active: "Activo",
    },
    remove_dialog_title: "¿Desea eliminar las sharkAttacks seleccionadas?",
    remove_dialog_description: "Esta acción no se puede deshacer",
    remove_dialog_no: "No",
    remove_dialog_yes: "Si",
    filters: {
      title: "Filtros",
      active: "Activo",
    },
  },
  shark_attack: {
    shark_attacks: "SharkAttacks",
    shark_attack_detail: "Detalle de la SharkAttack",
    save: "GUARDAR",
    basic_info: "Información Básica",
    name: "Nombre",
    description: "Descripción",
    active: "Activo",
    date: "Fecha",
    year: "Año",
    type: "Tipo",
    country: "País",
    area: "Área",
    location: "Ubicación",
    activity: "Actividad",
    sex: "Sexo",
    age: "Edad",
    injury: "Lesión",
    fatal_y_n: "Fatal (S/N)",
    time: "Hora",
    species: "Especie",
    investigator_or_source: "Investigador o fuente",
    pdf: "PDF",
    href_formula: "Fórmula de enlace",
    href: "Enlace",
    case_number: "Número de caso",
    case_number0: "Número de caso alternativo",
    description: "Descripción",
    active: "Activo",
    metadata_tab: "Metadatos",
    metadata: {
      createdBy: "Creado por",
      createdAt: "Creado el",
      updatedBy: "Modificado por",
      updatedAt: "Modificado el",
    },
    not_found: "Lo sentimos pero no pudimos encontrar la entidad que busca",
    internal_server_error: "Error Interno del Servidor",
    update_success: "SharkAttack ha sido actualizado",
    create_success: "SharkAttack ha sido creado",
    form_validations: {
      name: {
        length: "El nombre debe tener al menos {len} caracteres",
        required: "El nombre es requerido",
      },
      date: {
        required: "La fecha es requerida",
      },
      year: {
        required: "El año es requerido",
        type: "El año debe ser un número",
      },
      type: {
        required: "El tipo es requerido",
      },
      country: {
        required: "El país es requerido",
      },
      area: {
        required: "El área es requerida",
      },
      location: {
        required: "La ubicación es requerida",
      },
      activity: {
        required: "La actividad es requerida",
      },
      sex: {
        required: "El sexo es requerido",
        oneOf: "El sexo debe ser 'M' o 'F'",
      },
      age: {
        required: "La edad es requerida",
        min: "La edad debe ser mayor o igual a 0",
        type: "La edad debe ser un número",
      },
      injury: {
        required: "La lesión es requerida",
      },
      fatal_y_n: {
        required: "El campo fatal_s_n es requerido",
        oneOf: "Debe ser 'Y' (Sí) o 'N' (No)",
      },
      time: {
        required: "La hora es requerida",
      },
      species: {
        required: "La especie es requerida",
      },
      investigator_or_source: {
        required: "El investigador o fuente es requerido",
      },
      pdf: {
        required: "El PDF es requerido",
      },
      href_formula: {
        required: "La fórmula de enlace es requerida",
      },
      href: {
        required: "El enlace es requerido",
        url: "El enlace debe ser una URL válida",
      },
      case_number: {
        required: "El número de caso es requerido",
      },
      case_number0: {
        required: "El número de caso alternativo es requerido",
      },
    },
  },
  dashboard: {
    title: "Tablero de Ataques de Tiburones",
    subtitle: "Estadísticas y análisis de datos de ataques de tiburones importados",
    total_attacks: "Total de Ataques",
    total_attacks_description: "Ataques de Tiburones Importados",
    top_countries: "Principales Países",
    year_range: "Rango de Años",
    data_range: "Rango de Datos",
    top_countries_chart_title: "Top 5 Países - Ataques de Tiburones",
    attacks_by_year_chart_title: "Ataques de Tiburones por Año",
    loading: "Cargando estadísticas...",
    no_data: "No hay datos disponibles",
    chart_label_attacks: "Número de Ataques",
    view_dashboard: "Tablero"
  }
};
