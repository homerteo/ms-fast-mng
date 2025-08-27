export default {
  navigation: {
    settings: "Settings",
    "fast-mng-shark-attack-management": "SharkAttacks",
  },
  shark_attacks: {
    shark_attacks: "SharkAttacks",
    search: "Quick search by name",
    add_new_shark_attack: "ADD NEW",
    add_new_shark_attack_short: "NEW",
    rows_per_page: "Rows per page:",
    of: "of",
    remove: "Remove",
    table_colums: {
      name: "Name",
      active: "Active",
    },
    remove_dialog_title: "Do you want to delete the selected SharkAttacks??",
    remove_dialog_description: "This action can not be undone",
    remove_dialog_no: "No",
    remove_dialog_yes: "Yes",
    filters: {
      title: "Filters",
      active: "Active",
    },
  },
  shark_attack: {
    shark_attacks: "SharkAttacks",
    shark_attack_detail: "SharkAttack detail",
    save: "SAVE",
    basic_info: "Basic Info",
    name: "Name",
    description: "Description",
    active: "Active",
    date: "Date",
    year: "Year",
    type: "Type",
    country: "Country",
    area: "Area",
    location: "Location",
    activity: "Activity",
    sex: "Sex",
    age: "Age",
    injury: "Injury",
    fatal_y_n: "Fatal (Y/N)",
    time: "Time",
    species: "Species",
    investigator_or_source: "Investigator or source",
    pdf: "PDF",
    href_formula: "Link formula",
    href: "Link",
    case_number: "Case number",
    case_number0: "Alternative case number",
    description: "Description",
    active: "Active",
    metadata_tab: "Metadata",
    metadata: {
      createdBy: "Created by",
      createdAt: "Created at",
      updatedBy: "Modified by",
      updatedAt: "Modified at",
    },
    not_found: "Sorry but we could not find the entity you are looking for",
    internal_server_error: "Internal Server Error",
    update_success: "SharkAttack has been updated",
    create_success: "SharkAttack has been created",
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
};
