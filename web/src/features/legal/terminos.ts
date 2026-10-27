/**
 * Términos y Condiciones de Uso de tivu.
 *
 * Texto redactado como base para el mercado peruano. NO es asesoría legal:
 * antes de publicarlo lo tiene que revisar un abogado colegiado en el Perú, y
 * hay que completar los datos marcados con corchetes en `EMPRESA`.
 *
 * Cada cambio de fondo sube `VERSION` y `VIGENTE_DESDE`: es lo que permite
 * saber qué versión aceptó cada negocio.
 */

/** Lo que falta completar. Mientras empiece por «[», la página lo resalta. */
export const EMPRESA = {
  marca: "tivu",
  razonSocial: "[RAZÓN SOCIAL DE LA EMPRESA]",
  ruc: "[RUC]",
  domicilio: "[DOMICILIO FISCAL]",
  correo: "[CORREO DE CONTACTO]",
  correoDatos: "[CORREO PARA DATOS PERSONALES]",
  ciudadJurisdiccion: "[CIUDAD]",
  web: "[DIRECCIÓN WEB]",
};

export const VERSION = "1.0";
export const VIGENTE_DESDE = "[FECHA DE PUBLICACIÓN]";

export interface SeccionLegal {
  id: string;
  titulo: string;
  /** Párrafos. Los que empiezan por «• » se pintan como lista. */
  parrafos: string[];
}

const { marca, razonSocial, ruc, domicilio, correo, correoDatos, ciudadJurisdiccion } = EMPRESA;

export const SECCIONES: SeccionLegal[] = [
  {
    id: "partes",
    titulo: "1. Quiénes somos y aceptación de estos términos",
    parrafos: [
      `${marca} es una plataforma de software como servicio (SaaS) de agenda, reservas y gestión para negocios que prestan servicios por tiempo (barberías, salones, spas, clínicas y similares). La plataforma es operada por ${razonSocial}, con RUC ${ruc} y domicilio en ${domicilio} (en adelante, «${marca}», «nosotros» o «la Empresa»).`,
      `Estos Términos y Condiciones (los «Términos») regulan el acceso y uso de la plataforma por parte de la persona natural o jurídica que crea una cuenta para su negocio (el «Negocio» o «usted») y por las personas a las que el Negocio da acceso al panel (sus «Usuarios Autorizados»).`,
      `Al marcar la casilla de aceptación durante el registro, o al usar la plataforma, usted declara que ha leído, entendido y aceptado estos Términos en su totalidad. Esta aceptación por medios electrónicos tiene plena validez conforme al artículo 141 del Código Civil peruano, modificado por la Ley N.° 27291. Si no está de acuerdo con alguno de estos Términos, no debe crear una cuenta ni usar la plataforma.`,
      `Quien acepta en nombre de una empresa declara que tiene facultades suficientes para obligarla. Usted declara además ser mayor de edad y tener capacidad legal para contratar.`,
    ],
  },
  {
    id: "definiciones",
    titulo: "2. Definiciones",
    parrafos: [
      `• «Plataforma» o «Servicio»: el software ${marca}, su panel de gestión, la tienda pública de reservas de cada Negocio, sus aplicaciones, APIs y cualquier funcionalidad asociada.`,
      `• «Cliente Final»: la persona que reserva o recibe los servicios del Negocio. El Cliente Final es cliente del Negocio, no de ${marca}.`,
      `• «Contenido del Negocio»: toda la información que el Negocio o sus Usuarios Autorizados ingresan en la Plataforma, incluidos los datos de sus Clientes Finales, servicios, precios, imágenes y textos.`,
      `• «Plan»: la modalidad de suscripción contratada, con sus funciones, límites y precio.`,
    ],
  },
  {
    id: "servicio",
    titulo: "3. Qué ofrece la plataforma y qué no",
    parrafos: [
      `${marca} ofrece herramientas para que el Negocio organice su agenda, reciba reservas en línea, registre a sus clientes, controle su caja y se comunique con sus Clientes Finales. Las funciones disponibles dependen del Plan contratado y pueden cambiar con el tiempo.`,
      `${marca} es únicamente un proveedor de software. ${marca} NO presta los servicios que ofrece el Negocio, NO es parte de la relación entre el Negocio y sus Clientes Finales, NO garantiza la calidad, legalidad, puntualidad ni resultado de esos servicios y NO intermedia en los pagos entre ellos. El Negocio es el único responsable frente a sus Clientes Finales por los servicios que presta, sus precios, cancelaciones, devoluciones y reclamos.`,
    ],
  },
  {
    id: "cuenta",
    titulo: "4. Registro, cuenta y seguridad",
    parrafos: [
      `Para usar la plataforma debe registrarse con información veraz, completa y actualizada. ${marca} puede verificar el correo electrónico y rechazar o dar de baja registros con información falsa o incompleta.`,
      `Usted es el único responsable de mantener la confidencialidad de sus credenciales y de todo lo que se haga desde su cuenta y desde las cuentas de sus Usuarios Autorizados, incluidos los permisos que les otorgue. Debe avisarnos de inmediato a ${correo} si sospecha de un acceso no autorizado.`,
      `${marca} no será responsable por pérdidas o daños derivados del uso indebido de las credenciales, de permisos mal asignados por el Negocio o de no haber protegido su cuenta.`,
    ],
  },
  {
    id: "planes",
    titulo: "5. Planes, prueba gratuita, pagos y renovación",
    parrafos: [
      `Los precios de cada Plan se muestran en soles en la plataforma y en nuestra web. [INDICAR SI LOS PRECIOS INCLUYEN O NO EL IGV.]`,
      `La prueba gratuita, cuando se ofrezca, dura el plazo indicado al registrarse y no requiere tarjeta. Al terminar, el acceso queda limitado hasta que el Negocio contrate un Plan.`,
      `Las suscripciones se pagan por adelantado por el periodo elegido y se renuevan por periodos iguales mientras el Negocio no las cancele. Los precios promocionales se aplican solo durante el plazo indicado en la promoción.`,
      `Si un pago no se realiza en la fecha debida, ${marca} podrá limitar funciones o suspender la cuenta hasta que se regularice, previo aviso por correo electrónico o dentro del panel. La suspensión no exime del pago de lo adeudado.`,
      `${marca} podrá modificar los precios de los Planes avisando con al menos treinta (30) días calendario de anticipación. El nuevo precio se aplicará desde la siguiente renovación; si no está de acuerdo, puede cancelar antes de esa fecha.`,
      `Salvo que la ley disponga otra cosa, los montos pagados no son reembolsables, ni total ni parcialmente, por periodos ya iniciados, por funciones no usadas ni por cancelación anticipada.`,
    ],
  },
  {
    id: "uso",
    titulo: "6. Uso permitido y prohibiciones",
    parrafos: [
      `Usted se compromete a usar la plataforma de buena fe, conforme a la ley peruana y a estos Términos. Está prohibido, entre otros:`,
      `• Usar la plataforma para actividades ilícitas, fraudulentas o que vulneren derechos de terceros.`,
      `• Enviar comunicaciones no solicitadas (spam) o contactar a personas que no han autorizado ser contactadas.`,
      `• Cargar datos personales sin contar con una base legal válida para tratarlos, o datos sensibles sin las garantías que exige la ley.`,
      `• Intentar acceder a cuentas, datos o sistemas ajenos; probar, escanear o vulnerar la seguridad de la plataforma; o interferir con su funcionamiento.`,
      `• Copiar, descompilar, hacer ingeniería inversa, revender, sublicenciar o explotar comercialmente la plataforma sin autorización escrita.`,
      `• Usar robots, scrapers u otros medios automáticos para extraer información o generar carga anormal.`,
      `• Suplantar a otra persona o negocio, o publicar contenido falso, ofensivo, discriminatorio o que infrinja derechos de propiedad intelectual.`,
      `El incumplimiento de esta cláusula faculta a ${marca} a suspender o cancelar la cuenta de inmediato y sin reembolso, sin perjuicio de las acciones legales que correspondan.`,
    ],
  },
  {
    id: "datos-negocio",
    titulo: "7. Contenido del Negocio y datos de sus Clientes Finales",
    parrafos: [
      `El Contenido del Negocio le pertenece. Usted otorga a ${marca} una licencia limitada, no exclusiva y gratuita para alojarlo, procesarlo, mostrarlo y transmitirlo solo en la medida necesaria para prestar, mantener, proteger y mejorar el Servicio.`,
      `Respecto de los datos personales de sus Clientes Finales, el Negocio es el TITULAR DEL BANCO DE DATOS PERSONALES y ${marca} actúa como ENCARGADO DEL TRATAMIENTO, en los términos de la Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento. En consecuencia, el Negocio es el único responsable de:`,
      `• Obtener el consentimiento de sus Clientes Finales u otra base legal válida para tratar sus datos, incluido el contacto por WhatsApp, correo o teléfono.`,
      `• Informarles sobre el tratamiento de sus datos y atender sus derechos de acceso, rectificación, cancelación y oposición.`,
      `• Cumplir las obligaciones que la ley impone al titular del banco de datos, incluida su inscripción cuando corresponda.`,
      `${marca} tratará esos datos únicamente siguiendo las instrucciones del Negocio y para prestar el Servicio; no los venderá ni los usará para fines propios distintos del Servicio, y aplicará medidas de seguridad técnicas y organizativas razonables. El Negocio mantendrá indemne a ${marca} frente a cualquier reclamo, multa o sanción derivados de no haber cumplido sus obligaciones como titular de esos datos.`,
    ],
  },
  {
    id: "privacidad",
    titulo: "8. Datos personales del Negocio y de sus Usuarios Autorizados",
    parrafos: [
      `Los datos que usted y sus Usuarios Autorizados nos entregan al registrarse y usar la plataforma (nombre, correo, teléfono, datos del negocio, datos de facturación y registros de uso) forman parte de un banco de datos cuyo titular es ${razonSocial}, con domicilio en ${domicilio}.`,
      `Finalidades: crear y administrar la cuenta; prestar, mantener y dar soporte al Servicio; facturar y cobrar; enviar avisos operativos y de seguridad; prevenir fraudes y abusos; cumplir obligaciones legales; y, solo si usted lo autoriza aparte, enviarle información comercial de ${marca}. Puede retirar esa autorización comercial en cualquier momento sin afectar el Servicio.`,
      `Proveedores: para prestar el Servicio nos apoyamos en proveedores de alojamiento en la nube, envío de correos y mensajería, que pueden estar ubicados fuera del Perú. Ello implica un flujo transfronterizo de datos personales que se realiza con proveedores que ofrecen niveles de protección adecuados, conforme a la Ley N.° 29733 y su Reglamento. [LISTAR LOS PROVEEDORES Y PAÍSES.]`,
      `Conservación: los datos se conservan mientras la cuenta esté activa y, después, por el plazo necesario para cumplir obligaciones legales, tributarias o para la defensa de derechos.`,
      `Derechos: puede ejercer sus derechos de información, acceso, rectificación, cancelación y oposición escribiendo a ${correoDatos}, indicando su nombre, documento de identidad y lo que solicita. Responderemos en los plazos que fija la ley. Si considera que no fue atendido, puede acudir a la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.`,
      `Al aceptar estos Términos, usted autoriza de manera libre, previa, expresa, inequívoca e informada el tratamiento de sus datos para las finalidades necesarias descritas en esta cláusula.`,
    ],
  },
  {
    id: "terceros",
    titulo: "9. Servicios de terceros: WhatsApp, pagos y comprobantes",
    parrafos: [
      `WhatsApp: los recordatorios y avisos por WhatsApp se abren y envían desde la cuenta de WhatsApp del propio Negocio. WhatsApp es un servicio de Meta Platforms, Inc., ajeno a ${marca}. El Negocio es responsable del contenido de sus mensajes, del consentimiento de sus destinatarios y de cumplir las políticas de WhatsApp. ${marca} no responde por bloqueos, fallas, cambios o cobros de ese servicio.`,
      `Pagos: cuando el Negocio muestra un código QR o datos de Yape, Plin, bancos u otros medios, el dinero va directamente del Cliente Final al Negocio. ${marca} no recibe, custodia, transfiere ni garantiza esos pagos, no verifica su autenticidad más allá de mostrar lo que el Negocio registra, y no es responsable por pagos no recibidos, duplicados, fraudulentos o en disputa.`,
      `Comprobantes: los documentos que la plataforma permite generar (por ejemplo, notas de venta) son documentos internos de control y NO son comprobantes de pago electrónicos válidos ante la SUNAT, salvo que la plataforma indique expresamente lo contrario. El Negocio es el único responsable de emitir los comprobantes de pago que exige la normativa tributaria y de cumplir sus obligaciones con la SUNAT.`,
      `En general, el uso de cualquier servicio de terceros enlazado o integrado se rige por los términos de ese tercero, y ${marca} no responde por él.`,
    ],
  },
  {
    id: "disponibilidad",
    titulo: "10. Disponibilidad, cambios y respaldos",
    parrafos: [
      `${marca} hará esfuerzos razonables para mantener la plataforma disponible, pero no garantiza que funcione de forma ininterrumpida, sin errores ni libre de componentes dañinos. Puede haber interrupciones por mantenimiento, actualizaciones, fallas de proveedores, de internet o casos fortuitos o de fuerza mayor.`,
      `${marca} puede agregar, modificar o retirar funciones para mejorar el Servicio. Si se retira una función esencial del Plan contratado, se le avisará con anticipación razonable.`,
      `Aunque realizamos copias de seguridad, el Negocio es responsable de exportar y conservar por su cuenta la información que considere importante.`,
    ],
  },
  {
    id: "garantias",
    titulo: "11. Exclusión de garantías",
    parrafos: [
      `En la máxima medida que permite la ley, la plataforma se ofrece «tal cual» y «según disponibilidad». ${marca} no otorga garantías de que el Servicio cumplirá todos los requisitos del Negocio, de que generará resultados económicos determinados (más reservas, menos inasistencias u otros) ni de que los datos mostrados en reportes y estadísticas estén libres de errores. Las cifras que aparecen en nuestra publicidad son referenciales.`,
    ],
  },
  {
    id: "responsabilidad",
    titulo: "12. Limitación de responsabilidad",
    parrafos: [
      `En la máxima medida que permite la ley, ${marca}, sus socios, directores, trabajadores y proveedores no serán responsables por daños indirectos, lucro cesante, pérdida de clientes, de ingresos, de reputación o de datos, ni por daños derivados de: (a) los servicios que el Negocio presta a sus Clientes Finales; (b) pagos entre el Negocio y sus Clientes Finales; (c) servicios de terceros; (d) el uso indebido de la cuenta; (e) interrupciones o fallas ajenas a nuestro control razonable.`,
      `En cualquier caso, la responsabilidad total de ${marca} frente al Negocio por cualquier reclamo relacionado con el Servicio no superará el monto efectivamente pagado por el Negocio a ${marca} durante los tres (3) meses anteriores al hecho que originó el reclamo.`,
      `Nada en estos Términos limita la responsabilidad que no puede limitarse según la ley peruana, como la derivada de dolo o culpa inexcusable (artículo 1328 del Código Civil).`,
    ],
  },
  {
    id: "indemnidad",
    titulo: "13. Indemnidad",
    parrafos: [
      `El Negocio se obliga a defender, indemnizar y mantener indemne a ${marca}, sus socios, directores y trabajadores frente a cualquier reclamo, demanda, multa, sanción, daño o gasto (incluidos honorarios de abogados razonables) que se derive de: el Contenido del Negocio; los servicios que presta a sus Clientes Finales; el tratamiento que haga de datos personales; sus comunicaciones con terceros; o el incumplimiento de estos Términos o de la ley.`,
    ],
  },
  {
    id: "propiedad",
    titulo: "14. Propiedad intelectual",
    parrafos: [
      `La plataforma, su código, diseño, marca «${marca}», logotipos, textos y demás elementos son de propiedad de ${razonSocial} o de sus licenciantes y están protegidos por las normas de propiedad intelectual. Estos Términos solo le otorgan un derecho de uso limitado, personal, no exclusivo e intransferible mientras su suscripción esté vigente; no le transfieren ningún derecho de propiedad.`,
      `Si nos envía sugerencias o comentarios sobre el Servicio, podremos usarlos libremente y sin obligación de compensarle.`,
    ],
  },
  {
    id: "terminacion",
    titulo: "15. Cancelación, suspensión y fin del servicio",
    parrafos: [
      `Usted puede cancelar su suscripción en cualquier momento desde el panel o escribiendo a ${correo}. La cancelación surte efecto al final del periodo ya pagado.`,
      `${marca} puede suspender o cancelar la cuenta, con aviso previo cuando sea razonable, por falta de pago, por incumplimiento de estos Términos, por uso que ponga en riesgo la seguridad de la plataforma o de terceros, o por orden de autoridad competente.`,
      `Tras la cancelación, el Negocio dispondrá de treinta (30) días calendario para solicitar la exportación de su información. Vencido ese plazo, ${marca} podrá eliminarla definitivamente, salvo lo que deba conservar por obligación legal. Las copias de seguridad se eliminan conforme a sus ciclos ordinarios.`,
      `Las cláusulas que por su naturaleza deban subsistir (pagos pendientes, exclusión de garantías, limitación de responsabilidad, indemnidad, propiedad intelectual y ley aplicable) seguirán vigentes tras la terminación.`,
    ],
  },
  {
    id: "cambios",
    titulo: "16. Cambios a estos Términos",
    parrafos: [
      `${marca} puede modificar estos Términos. Los cambios relevantes se avisarán por correo electrónico o dentro del panel con al menos quince (15) días calendario de anticipación. Si continúa usando la plataforma después de la fecha de entrada en vigor, se entenderá que acepta la nueva versión; si no está de acuerdo, puede cancelar su suscripción antes de esa fecha.`,
    ],
  },
  {
    id: "consumidor",
    titulo: "17. Reclamos y protección al consumidor",
    parrafos: [
      `Para consultas o reclamos sobre el Servicio puede escribirnos a ${correo}. [INDICAR EL ENLACE AL LIBRO DE RECLAMACIONES VIRTUAL.]`,
      `Cuando el Negocio califique como consumidor según la Ley N.° 29571, Código de Protección y Defensa del Consumidor, conserva los derechos irrenunciables que esa ley le reconoce, incluida la posibilidad de acudir al INDECOPI, y ninguna cláusula de estos Términos se interpretará en su contra.`,
    ],
  },
  {
    id: "ley",
    titulo: "18. Ley aplicable y jurisdicción",
    parrafos: [
      `Estos Términos se rigen por las leyes de la República del Perú. Las partes procurarán resolver cualquier controversia de buena fe y de forma directa. De no lograrlo, se someten a la competencia de los jueces y tribunales de ${ciudadJurisdiccion}, Perú, sin perjuicio de los derechos que la ley reconozca al consumidor.`,
    ],
  },
  {
    id: "generales",
    titulo: "19. Disposiciones generales",
    parrafos: [
      `Si alguna cláusula fuera declarada inválida, las demás seguirán vigentes. Que ${marca} no exija en algún momento el cumplimiento de una cláusula no implica que renuncie a ella. Usted no puede ceder su posición en este contrato sin nuestra autorización; ${marca} sí puede hacerlo en caso de reorganización, fusión o venta del negocio, avisándole. Las comunicaciones se realizarán al correo registrado en la cuenta, que usted se obliga a mantener actualizado.`,
    ],
  },
  {
    id: "contacto",
    titulo: "20. Contacto",
    parrafos: [
      `${razonSocial} — RUC ${ruc}`,
      `Domicilio: ${domicilio}`,
      `Correo: ${correo}`,
      `Datos personales: ${correoDatos}`,
    ],
  },
];
