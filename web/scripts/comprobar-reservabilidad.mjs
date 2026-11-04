// Ejecutar con el panel en localhost:3001, NEXT_PUBLIC_USE_MOCKS=true
// y NEXT_PUBLIC_MODULOS_CONECTADOS vacío. Solo modifica datos ficticios.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const session = `reservabilidad-${process.pid}`;
const base = "http://localhost:3001";
const npm = process.env.npm_execpath;
assert.ok(npm, "Ejecuta esta comprobación con npm run test:reservabilidad.");

function browser(...args) {
  const result = spawnSync(process.execPath, [npm, "exec", "--yes", "--package=agent-browser", "--",
    "agent-browser", "--session", session, "--json", ...args], {
    encoding: "utf8", timeout: 60000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.status, 0, `${args[0]}: ${result.stderr || result.stdout || result.error}`);
  const output = result.stdout.trim().split("\n").findLast((line) => line.startsWith("{"));
  const response = JSON.parse(output);
  assert.equal(response.success, true, response.error);
  return response.data;
}

const evaluate = (expression) => browser("eval", expression).result;
const wait = (expression) => browser("wait", "--fn", expression);
const row = (name) => `Array.from(document.querySelectorAll('tbody tr')).find(r => r.querySelector('h6')?.textContent === ${JSON.stringify(name)})`;
const avisos = (name) => `${row(name)}?.querySelectorAll('[role=alert], .MuiChip-root').length`;
const dialogAlert = "document.querySelector('[role=dialog] [role=alert]')";
const edit = () => browser("find", "role", "button", "click", "--name", "Editar", "--exact");
const cancel = () => browser("find", "role", "button", "click", "--name", "Cancelar", "--exact");

function navigate(path, ready) {
  browser("pushstate", `${base}${path}`);
  wait(`location.pathname === ${JSON.stringify(path)} && (${ready})`);
}

function search(name) {
  browser("find", "role", "textbox", "fill", "--name", "Buscar servicio…", name);
  wait(`document.querySelectorAll('tbody tr').length === 1 && Boolean(${row(name)})`);
}

try {
  browser("open", "about:blank");
  browser("cookies", "set", "mi_saas_token", "prueba-local-reservabilidad", "--url", base, "--http-only");
  browser("network", "route", "**/api/user", "--body", JSON.stringify({ data: {
    id: 1, name: "Administración de prueba", email: "prueba@example.test", avatar_url: null,
    rol: "Administrador", negocio: { id: "demo", nombre: "Clínica de prueba", slug: "demo" },
  } }));
  browser("open", `${base}/servicios`);
  wait(`Boolean(${row("AAA")})`);
  assert.equal(evaluate(`${row("AAA")}.querySelector('.MuiChip-root').textContent`), "No reservable");
  assert.equal(evaluate(`${row("Limpieza dental")}.querySelector('.MuiChip-root').textContent`), "Revisar sedes");

  search("Limpieza dental");
  edit();
  wait(`Boolean(${dialogAlert})`);
  assert.match(evaluate(`${dialogAlert}.textContent`), /la molina.*Sucursal Miraflores/);
  cancel();

  // Calentar la consulta de sedes antes de guardar: detecta invalidaciones ausentes.
  navigate("/administracion/locales/servicios", `Boolean(${row("AAA")})`);
  assert.equal(evaluate(avisos("AAA")), 1);
  navigate("/servicios", "Boolean(document.querySelector('input[placeholder=\"Buscar servicio…\"]'))");
  search("AAA");
  edit();
  browser("find", "role", "checkbox", "check", "--name", "Dra. Carmen Ríos");
  assert.match(evaluate(`${dialogAlert}.textContent`), /No se puede reservar/);
  browser("find", "role", "button", "click", "--name", "Guardar", "--exact");
  wait("!document.querySelector('[role=dialog]')");
  assert.equal(evaluate(`${row("AAA")}.querySelector('.MuiChip-root').textContent`), "Revisar sedes");
  navigate("/administracion/locales/servicios", `Boolean(${row("AAA")})`);
  wait(`${avisos("AAA")} === 0`);
  browser("find", "role", "button", "click", "--name", "Sucursal Miraflores", "--exact");
  wait(`${avisos("AAA")} === 1`);

  browser("find", "role", "link", "click", "--name", "Quién atiende en cada sede");
  browser("find", "role", "button", "click", "--name", "Sucursal Miraflores", "--exact");
  wait(`Boolean(${row("Dra. Carmen Ríos")})`);
  const position = evaluate("Array.from(document.querySelectorAll('tbody tr')).findIndex(r => r.textContent.includes('Dra. Carmen Ríos')) + 1");
  browser("check", `tbody tr:nth-child(${position}) input[type=checkbox]`);
  browser("wait", "--text", "Profesional actualizado");
  navigate("/servicios", "Boolean(document.querySelector('input[placeholder=\"Buscar servicio…\"]'))");
  search("AAA");
  wait(`${avisos("AAA")} === 0`);
  edit();
  wait("Boolean(document.querySelector('[role=dialog]'))");
  assert.equal(evaluate(`Boolean(${dialogAlert})`), false);
  cancel();

  search("Certificado médico");
  assert.equal(evaluate(avisos("Certificado médico")), 0);
  edit();
  wait("Boolean(document.querySelector('[role=dialog]'))");
  assert.equal(evaluate(`Boolean(${dialogAlert})`), false);
  console.log("OK: tres avisos, sede parcial, edición sin guardar, asignación, habilitación, caché e inactividad.");
} finally {
  browser("close");
}
