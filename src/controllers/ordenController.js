const { saveRequest } = require("../services/requestStore");
const { buildSummaryFromBody, nowIso } = require("../utils/helpers");

function buildPiSuccessResponse(req, saved, body) {
  return {
    Status: 1,
    Id: `PI-${saved.id}`,
    Mensaje: "Orden de intervención creada correctamente",
    RequestId: saved.id,
    Fecha: nowIso(),
    NumeroProceso: body?.numeroProceso || null
  };
}

function buildPiErrorResponse(message, saved, body = null) {
  return {
    Status: -1,
    Id: null,
    Mensaje: message,
    RequestId: saved?.id || null,
    NumeroProceso: body?.numeroProceso || null
  };
}

function buildAspNetValidationEstadoIdError() {
  return {
    type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    title: "One or more validation errors occurred.",
    status: 400,
    traceId: "|c40fe94c-4303bb33b1bc3508.",
    errors: {
      "$.estadoId": [
        "The JSON value could not be converted to System.Nullable`1[System.Int32]. Path: $.estadoId | LineNumber: 2 | BytePositionInLine: 23."
      ]
    }
  };
}

function getScenarioMessage(scenario, body) {
  const comercioId = body?.comercioId || "{0}";
  const procedenciaId = body?.procedenciaId || "{0}";
  const tipoActualizacionId = body?.tipoActualizacionId || "{0}";
  const numeroTerminal = body?.numeroTerminal || "{0}";
  const entidad = body?.entidadId || "{1}";

  const scenarios = {
    "datos-invalidos": "Datos de entrada inválidos",
    "incidencias-cantidad": "La lista de números de serie e incidencias indicadas debe tener la misma cantidad de items",
    "comercio-crear": "No se ha podido crear el comercio indicado",
    "incidencia-requerida": "El campo incidenciaIndicadaId es requerido para el tipo de Intervencion Incidencia",
    "actualizacion-requerida": "El campo tipoActualizacionId es requerido para el tipo de Intervencion Actualizacion",
    "terminal-no-existe": "El terminal indicado no existe en PI",
    "orden-pendiente": `Ya existe una Orden de intervención pendiente para el terminal ${numeroTerminal}`,
    "entidad-incorrecta": "La entidad es incorrecta",
    "tipo-servicio-incorrecto": "El tipo de servicio es incorrecto o no permitido para la entidad",
    "comercio-no-existe": "El comercio no existe",
    "error-crear-orden": "Error crear orden intervención",
    "cliente-entidad": `El cliente introducido ${comercioId} no corresponde con la entidad seleccionada ${entidad}`,
    "procedencia-entidad": `La procedencia introducida ${procedenciaId} no corresponde con la entidad seleccionada ${entidad}`,
    "actualizacion-entidad": `El tipo de actualización introducido ${tipoActualizacionId} no corresponde a la entidad seleccionada ${entidad}`,
    "terminal-no-operativo": "El terminal no está OPERATIVO",
    "ubicacion-instalacion": "La ubicación del terminal debe ser un ALMACÉN o TÉCNICO",
    "ubicacion-cliente": `El terminal no se encuentra en el CLIENTE ${comercioId}`,
    "terminal-inexistente": `El terminal ${numeroTerminal} no existe`,
    "terminal-transito": `El terminal ${numeroTerminal} está en tránsito actualmente`,
    "fecha-entrada": "La fecha de comienzo de responsabilidad N+ no puede ser inferior a la Fecha de entrada de la orden",
    "fecha-limite-superior": "fecha límite superior a la permitida",
    "fecha-limite-inferior": "La fecha límite no puede ser inferior a la fecha de comienzo de responsabilidad N+",
    "apikey-error": "Ha ocurrido un error a la hora de obtener el token para el usuario",
    "error-general": "Error general creando la orden"
  };

  return scenarios[scenario] || "Error crear orden intervención";
}

function postOrdenIntervencion(req, res) {
  const summary = buildSummaryFromBody(req.body);

  const saved = saveRequest(req, {
    endpointType: "ordenIntervencion",
    summary
  });

  console.log("Body /api/OrdenIntervencion:");
  console.log(JSON.stringify(req.body, null, 2));

  const scenario = (req.query.scenario || "success").toLowerCase();

  // Simular error ASP.NET de parsing/validación de estadoId
  if (scenario === "invalid-estadoid") {
    return res.status(400).json(buildAspNetValidationEstadoIdError());
  }

  // Éxito
  if (scenario === "success") {
    return res.status(200).json(buildPiSuccessResponse(req, saved, req.body));
  }

  // Error PI controlado
  const message = getScenarioMessage(scenario, req.body);
  return res.status(400).json(buildPiErrorResponse(message, saved, req.body));
}

module.exports = { postOrdenIntervencion };