function nowIso() {
  return new Date().toISOString();
}

function buildSummaryFromBody(body) {
  return {
    tipoIntervencionId: body?.tipoIntervencionId ?? null,
    procedenciaId: body?.procedenciaId ?? null,
    comercioId: body?.comercioId ?? null,
    numeroTerminal: body?.numeroTerminal ?? null,
    accionId: body?.accionId ?? null,
    estadoId: body?.estadoId ?? null,
    numeroProceso: body?.numeroProceso ?? null,
    observaciones: body?.observaciones ?? null,
    comercioNombre: body?.Comercio?.Nombre ?? null
  };
}

module.exports = {
  nowIso,
  buildSummaryFromBody
};