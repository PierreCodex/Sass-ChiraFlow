# Flujos del SaaS

Diagramas de cómo funciona el sistema, sacados de leer el Laravel
(`SAAS_LINEA_BIEN`, rama `feat/planes-suscripcion`).

## Cómo pasarlos a Excalidraw

1. Abre [excalidraw.com](https://excalidraw.com)
2. Menú (☰) → **Mermaid to Excalidraw**
3. Copia **un** bloque de código de este archivo y pégalo ahí
4. **Insert** — quedan como formas editables, no como imagen

> Van de uno en uno: el conversor toma un diagrama por vez. Excalidraw solo
> entiende `flowchart`, así que todos están escritos así (nada de diagramas
> de clases ni ER, que no importaría).

Lo que aparece marcado con ⚠️ o en los nodos `FALTA` **no existe en el código**:
es un hueco detectado, no algo que haya que dibujar como si funcionara. Cómo
se resuelve cada uno está en [api-contract.md](api-contract.md) y en la ficha
de la vista correspondiente.

---

## 1. Las tres caras del producto

Lo primero que conviene entender: no es una aplicación, son tres, sobre la
misma base de datos.

```mermaid
flowchart TD
    subgraph publico["PUBLICO - sin sesion"]
        LAND["Landing del SaaS<br/>lienaben.com"]
        TIENDA["Tienda del negocio<br/>negocio.lienaben.com"]
    end

    subgraph panel["PANEL DEL NEGOCIO - rol dueno / admin / profesional"]
        AGENDA["Citas y calendario"]
        GESTION["Clientes, servicios,<br/>empleados, locales"]
        OPER["Caja, inventario, reportes"]
        CUENTA["Mi plan, WhatsApp,<br/>configuracion, soporte"]
    end

    subgraph interno["INTERNO - rol superadmin / soporte"]
        SA["Superadmin<br/>negocios, planes, pagos"]
        SOP["Soporte<br/>tickets, auditoria"]
    end

    VISITA["Dueno de un negocio"] --> LAND
    LAND -->|"registro de prueba"| AGENDA
    CLIENTE["Cliente final"] --> TIENDA
    TIENDA -->|"crea cita pendiente"| AGENDA
    CUENTA -->|"abre ticket"| SOP
    SA -->|"activa plan, suspende"| CUENTA
```

**Clave:** el cliente final **nunca** entra al panel, y el dueño **nunca**
gestiona su tienda desde otro sitio que no sea el panel. La tienda es un
reflejo de lo que se configura dentro.

---

## 2. Alta de un negocio

Un solo formulario crea cuatro cosas. Es el momento en que nace el inquilino.

```mermaid
flowchart TD
    A["Formulario de prueba<br/>en la landing"] --> B{"Validacion"}
    B -->|"error"| A
    B -->|"ok"| C["Transaccion"]

    C --> D["Negocio<br/>slug unico del nombre<br/>estado = prueba<br/>vence en 14 dias"]
    C --> E["Usuario dueno<br/>rol = dueno"]
    C --> F["Local 1<br/>es_principal = true"]
    C --> G["Asigna plan"]

    G --> H{"Busca plan<br/>slug = profesional"}
    H -->|"NO EXISTE"| I["Cae en Plan::first()<br/>plan casi al azar"]

    D --> J["Login automatico"]
    E --> J
    F --> J
    I --> J
    J --> K["Panel del negocio"]
    D --> L["Tienda publica ya viva<br/>slug.dominio.com"]
```

⚠️ El nodo del plan es un **bug real**: los slugs son `basico`, `premium` y
`pro`. Nunca encuentra `profesional`, así que todo negocio nuevo recibe el
primero por id.

---

## 3. Reserva desde la tienda pública

El flujo que da de comer al producto.

```mermaid
flowchart TD
    A["Cliente entra a<br/>negocio.dominio.com"] --> B{"Cuantas sedes<br/>activas?"}
    B -->|"1"| D["Pagina de la sede"]
    B -->|"varias"| C["Elige sucursal"]
    C --> D

    D --> E["Ve catalogo por categoria<br/>solo servicios activos"]
    E --> F["Agrega servicios al carrito<br/>con cantidad"]
    F --> G{"Mas de un<br/>servicio?"}

    G -->|"si"| H{"Como agendar?"}
    G -->|"no"| J

    H -->|"unica"| I["Todo seguido,<br/>un solo profesional"]
    H -->|"separada"| K["Cada servicio con su<br/>profesional, dia y hora"]

    I --> J["Elige profesional"]
    K --> J
    J --> L["Elige fecha"]
    L --> M["El backend calcula huecos"]
    M --> N["Elige hora de la lista"]
    N --> O["Datos de contacto"]
    O --> P["Confirma"]

    P --> Q{"modo"}
    Q -->|"unica"| R["1 cita<br/>+ N filas en cita_servicio<br/>duracion = suma"]
    Q -->|"separada"| S["N citas independientes"]

    R --> T["estado = pendiente<br/>fuente = publica"]
    S --> T
    T --> U["Comprobante al cliente"]
    T --> V["Aparece en el panel<br/>del negocio"]
```

**El punto crítico es "el backend calcula huecos".** Solo se ofrecen horas en
las que la cita cabe de verdad; el cliente no puede elegir una hora imposible.

---

## 4. Cómo se calculan los huecos

El corazón del producto. Este es el árbol de decisión real de
`generarHorarios`.

```mermaid
flowchart TD
    A["Profesional + fecha + duracion"] --> B{"Tiene excepcion<br/>ese dia?"}

    B -->|"si, no disponible"| C["Sin huecos<br/>permiso, feriado"]
    B -->|"si, disponible"| D["Usa el horario<br/>de la excepcion"]
    B -->|"no"| E{"Tiene horario<br/>semanal propio?"}

    E -->|"no"| F["Usa el horario<br/>del negocio"]
    E -->|"si"| G{"Ese dia<br/>esta activo?"}
    G -->|"no"| H["Sin huecos<br/>libra ese dia"]
    G -->|"si"| I["Usa su horario del dia<br/>con sus descansos"]

    D --> J["Jornada resuelta"]
    F --> J
    I --> J

    J --> K["Genera rejilla<br/>cada N minutos"]
    K --> L["Anade los bordes:<br/>fin de cada descanso<br/>y de cada cita"]
    L --> M["Descarta los que chocan<br/>con descanso o cita"]
    M --> N["Descarta los que no<br/>caben antes del cierre"]
    N --> O["Lista de horas libres"]
```

Los **bordes** del paso 3 importan: sin ellos, un servicio de 50 minutos
sobre una rejilla de 30 dejaría huecos muertos. Una cita que termina a las
09:50 debe ofrecer las 09:50, no esperar a las 10:00.

---

## 5. El mismo hueco, dos puertas distintas

Esto explica el problema del punto 5.3 de la lectura.

```mermaid
flowchart TD
    subgraph via1["Desde la tienda publica"]
        A1["Cliente elige"] --> B1["generarHorarios"]
        B1 --> C1["Solo horas validas"]
        C1 --> D1["Cita correcta"]
    end

    subgraph via2["Desde el panel del negocio"]
        A2["Recepcionista escribe"] --> B2["Valida solo<br/>formato H:i"]
        B2 --> C2["FALTA: no comprueba<br/>horario, descanso<br/>ni solape"]
        C2 --> D2["Cita posiblemente<br/>solapada"]
    end

    D1 --> E["Mismo calendario"]
    D2 --> E
    E --> F["Dos citas encima<br/>del mismo profesional"]
```

⚠️ El motor existe una sola vez y vive dentro del controlador público. El
panel no lo usa.

---

## 6. Ciclo de vida de la suscripción

Aquí está el agujero más grande del producto.

```mermaid
flowchart TD
    A["Registro"] --> B["estado = prueba<br/>14 dias"]
    B --> C{"Termina la prueba"}

    C --> D["FALTA: nadie<br/>cambia el estado"]
    C --> E["El dueno entra a Mi Plan"]

    E --> F["Elige plan y extras"]
    F --> G["Pulsa Pagar"]
    G --> H["FALTA: no hay cobro<br/>abre un ticket de soporte"]

    H --> I["Soporte lo lee"]
    I --> J["Superadmin activa<br/>el plan a mano"]
    J --> K["estado = activa"]

    K --> L{"Vence el periodo"}
    L --> M["FALTA: sin renovacion<br/>sin aviso previo<br/>sin gracia, sin corte"]

    N["Superadmin"] -.->|"manual"| O["estado = suspendida"]
    O --> P["La tienda publica<br/>deja de responder"]
```

Todo lo que dice `FALTA` funciona hoy porque **alguien lo hace a mano**. Con
5 clientes se sostiene; con 30 no.

---

## 7. Qué límites impone el plan

```mermaid
flowchart TD
    A["Plan del negocio"] --> B["features[]<br/>que modulos ve"]
    A --> C["max_profesionales"]
    A --> D["max_sucursales"]
    A --> E["max_whatsapp_mes"]

    B --> F["Middleware<br/>EnsurePlanFeature"]
    F --> G["Bloquea la ruta<br/>si no tiene la feature"]

    C --> H["Se comprueba al<br/>crear empleado"]
    D --> I["Se comprueba al<br/>crear local"]
    E --> J["FALTA: nadie lo cuenta<br/>no hay tabla de envios"]

    K["Extras contratados<br/>en el negocio"] --> L["extra_profesionales"]
    K --> M["extra_whatsapp"]
    L --> N["FALTA: no suma<br/>al cupo automaticamente"]
    M --> N
```

⚠️ Se cobra un cupo de WhatsApp que nadie mide, y los extras que se pagan no
suben ningún límite solos.

---

## 8. La caja del día

```mermaid
flowchart TD
    A["Entra a Caja"] --> B{"Hay caja<br/>de hoy?"}
    B -->|"no"| C["Abrir caja<br/>con monto inicial"]
    C --> D["Caja abierta"]
    B -->|"si"| D

    D --> E["Registrar movimientos"]
    E --> F{"tipo"}
    F -->|"ingreso"| G["suma a ingresos"]
    F -->|"egreso"| H["suma a egresos"]
    G --> D
    H --> D

    D --> I["Cerrar caja<br/>con monto contado"]
    I --> J["PROBLEMA: sobrescribe<br/>el saldo inicial"]
    J --> K["Se pierde con cuanto<br/>se abrio"]
    J --> L["FALTA: la diferencia<br/>se promete y no se calcula"]
    J --> M["FALTA: no hay estado<br/>se puede seguir moviendo"]
```

⚠️ Los tres problemas se arreglan con dos columnas: `monto_inicial` y
`monto_final` (nullable = abierta).

---

## 9. Mensajes de WhatsApp

```mermaid
flowchart TD
    A["El negocio crea plantillas<br/>una por evento"] --> B["9 eventos posibles"]

    B --> C["confirmacion"]
    B --> D["recordatorio"]
    B --> E["cancelacion"]
    B --> F["finalizado"]
    B --> G["bienvenida"]
    B --> H["pago_linea"]
    B --> I["redes_sociales"]
    B --> J["cumpleanos"]
    B --> K["personalizado"]

    C --> L["Se dispara solo"]
    D --> L
    E --> L
    F --> L

    G --> M["FALTA: nada los dispara"]
    H --> M
    I --> M
    J --> M
    K --> M

    L --> N["Rellena variables<br/>con datos de la cita"]
    N --> O["Envia por wa.me"]
```

⚠️ Cuatro de nueve eventos funcionan. Los otros cinco se pueden configurar
pero no los llama nadie.

---

## 10. Quién ve qué

```mermaid
flowchart LR
    SA["superadmin"] --> N1["Todos los negocios"]
    SA --> N2["Planes y precios"]
    SA --> N3["Pagos y anuncios"]
    SA --> N4["Usuarios de soporte"]

    SOP["soporte"] --> S1["Tickets de todos"]
    SOP --> S2["Ficha de un negocio"]
    SOP --> S3["Usuarios de un negocio"]
    SOP --> S4["Queda auditado:<br/>accion, antes, despues, IP"]

    DUE["dueno"] --> D1["Todo su negocio"]
    ADM["admin"] --> D1
    PRO["profesional"] --> P1["Su agenda"]

    CLI["cliente final"] --> C1["Solo la tienda publica"]
```

La fila de auditoría es de lo mejor del proyecto: cada acción de soporte
guarda qué tocó, cómo estaba antes, cómo quedó y desde qué IP.

---

## 11. Cómo se relacionan los datos

Estructura, no ER formal (Excalidraw no dibuja diagramas ER).

```mermaid
flowchart TD
    NEG["NEGOCIO<br/>el inquilino"] --> PLAN["plan_id"]
    NEG --> LOC["LOCALES<br/>sedes"]
    NEG --> USR["USUARIOS<br/>dueno, admin, profesional"]
    NEG --> SRV["SERVICIOS"]
    NEG --> CLI["CLIENTES"]
    NEG --> CIT["CITAS"]

    SRV --> CAT["categoria_servicio_id"]
    LOC --> LP["local_profesional<br/>habilitado, nombre_publico<br/>perfil, horario"]
    USR --> LP

    CIT --> CS["cita_servicio<br/>cantidad, precio, duracion"]
    SRV --> CS
    CIT --> LOC
    CIT --> USR
    CIT --> CLI

    NEG --> CAJA["CAJA<br/>cierres y movimientos"]
    NEG --> INV["INVENTARIO<br/>productos y movimientos"]
    NEG --> TIC["TICKETS de soporte"]
    NEG --> PLW["PLANTILLAS WhatsApp"]
    NEG --> GRU["GRUPOS<br/>nadie los consulta"]
```

Dos cosas que se ven mejor dibujadas que leyendo:

- **`cita_servicio` es la clave del multi-servicio**, y solo la usa la tienda
  pública. El panel trabaja con un servicio por cita.
- **`local_profesional` es donde vive la identidad pública** del profesional:
  con qué nombre aparece y su biografía, distinto en cada sede.

---

## 12. Lo que hay que decidir

```mermaid
flowchart TD
    A["Rediseno de la base de datos"] --> B["Sede principal duplicada<br/>negocios vs locales"]
    A --> C["Sin tabla de resenas<br/>aunque se vende la feature"]
    A --> D["Sin tabla local_servicio<br/>servicios no son por sede"]
    A --> E["Sin tabla de envios<br/>de WhatsApp"]
    A --> F["Sin historial de<br/>suscripciones ni cobros"]

    B --> G["Que negocios sea solo la cuenta<br/>y toda sede viva en locales"]
    C --> H["resenas ligadas a cita_id"]
    E --> I["para poder medir el cupo"]
    F --> J["para poder cobrar solo"]
```

El detalle de cada punto, con los esquemas ya decididos, está en
[plan-backend.md](plan-backend.md) y en
[vistas/tienda-publica.md](vistas/tienda-publica.md).
