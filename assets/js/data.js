window.KORA_DATA = {
  teamMembers: [
    { id: 'johan', name: 'Johan Guzman', code: 'A00401480', role: 'user', roleLabel: 'Oyente curador', city: 'Cali', initial: 'J', avatar: 'assets/img/johan-stiven-guzman.svg', bio: 'Explorador de escenas urbanas y cápsulas de alto contexto.' },
    { id: 'karold', name: 'Karold Mejia', code: 'A00401806', role: 'artist', roleLabel: 'Artista local', city: 'Cali', initial: 'K', avatar: 'assets/img/karold-lizeth-mejia-orozco.svg', bio: 'Perfil artista para publicar lanzamientos, asociar visuales y revisar licencias.' },
    { id: 'luna', name: 'Luna Martinez', code: 'A00401964', role: 'user', roleLabel: 'Oyente exploradora', city: 'Cali', initial: 'L', avatar: 'assets/img/luna-catalina-martinez.svg', bio: 'Curadora de hallazgos digitales y playlists locales.' },
    { id: 'renzo', name: 'Renzo Mosquera', code: 'A00401681', role: 'company', roleLabel: 'Scout discográfica', city: 'Cali', initial: 'R', avatar: 'assets/img/renzo-mosquera-daza.svg', bio: 'Gestión comercial, analítica autorizada y scouting de artistas locales.' }
  ],
  roleProfiles: [
    { id: 'scout-role', name: 'Agencia Brújula', role: 'company', roleLabel: 'Scout discográfica', city: 'Cali', initial: 'A', avatar: 'assets/img/agencia-brujula.svg', bio: 'Perfil empresarial para scouting, campañas y facturación con datos autorizados.' },
    { id: 'ambassador-role', name: 'Laura Pérez', role: 'user', roleLabel: 'Embajadora cultural', city: 'Cali', initial: 'L', avatar: 'assets/img/laura-perez.svg', bio: 'Perfil de curaduría comunitaria, tableros y aporte a playlists locales.' },
    { id: 'listener-role', name: 'Mateo Rivas', role: 'user', roleLabel: 'Explorador musical', city: 'Cali', initial: 'M', avatar: 'assets/img/mateo-rivas.svg', bio: 'Perfil estándar para descubrir, guardar y compartir contenido.' },
    { id: 'artist-role', name: 'Sara León', role: 'artist', roleLabel: 'Artista local', city: 'Cali', initial: 'S', avatar: 'assets/img/sara-leon.svg', bio: 'Perfil con publicación de canciones, contenido visual, licencia de uso y métricas.' }
  ],
  artists: [
    {
      id: 'valentina-cruz', name: 'Valentina Cruz', track: 'Rio de Fuego', genre: 'R&B afrolatino', city: 'Cali', neighborhood: 'San Antonio', scene: 'Afro urbano', language: 'Español', match: 94, duration: 150, preview: 30, symbol: '♪', tone: 'sunset', cover: 'assets/img/cover-valentina-cruz.svg', avatar: 'assets/img/valentina-cruz.svg', audio: 'assets/audio/rio-de-fuego.wav',
      story: 'Voces suaves, percusión del Pacífico y una narrativa íntima sobre crecer cerca del río y volver a la ciudad con identidad propia.',
      tags: ['San Antonio', 'Afro urbano', 'Voz cálida', 'Cali nocturna'],
      insight: ['Entrada vocal clara antes de los 8 segundos.', 'Contexto fuerte de barrio y escena local.', 'Alta probabilidad de guardado para oyentes de R&B.']
    },
    {
      id: 'maelo-solar', name: 'Kmelo', track: 'Barrio Norte', genre: 'Hip hop alternativo', city: 'Cali', neighborhood: 'La Flora', scene: 'Rap independiente', language: 'Español', match: 88, duration: 132, preview: 30, symbol: '◆', tone: 'green', cover: 'assets/img/cover-kmelo.svg', avatar: 'assets/img/karold-lizeth-mejia-orozco.svg', audio: 'assets/audio/barrio-norte.wav',
      story: 'Rap de observación urbana con beats cálidos y referencias a movilidad, universidad y vida de barrio.',
      tags: ['La Flora', 'Rap local', 'Lírica urbana', 'Beat cálido'],
      insight: ['Gancho lírico claro desde los primeros 10 segundos.', 'Buen contenido para compartir como cápsula cultural.', 'Ideal para playlist de rap caleño.']
    },
    {
      id: 'nina-santacruz', name: 'Soledad', track: 'Palmeras de Sal', genre: 'Pop tropical', city: 'Cali', neighborhood: 'El Peñón', scene: 'Pop independiente', language: 'Español', match: 91, duration: 146, preview: 30, symbol: '✦', tone: 'coral', cover: 'assets/img/cover-soleada.svg', avatar: 'assets/img/valentina-cruz.svg', audio: 'assets/audio/palmeras-de-sal.wav',
      story: 'Pop luminoso con percusión latina, diseñado para cápsulas breves y fácil recordación.',
      tags: ['El Peñón', 'Pop local', 'Hook rápido', 'Playlist verano'],
      insight: ['La melodía principal entra antes del segundo 12.', 'Alta recordación por coro directo.', 'Recomendable para usuarios que priorizan energía.']
    },
    {
      id: 'duo-cables', name: 'Andrés Mora', track: 'Cables de Lluvia', genre: 'Electrónica orgánica', city: 'Cali', neighborhood: 'Granada', scene: 'Electro local', language: 'Instrumental', match: 82, duration: 158, preview: 30, symbol: '⌁', tone: 'blue', cover: 'assets/img/cover-andres-mora.svg', avatar: 'assets/img/angela-quitiaquez.svg', audio: 'assets/audio/cables-de-lluvia.wav',
      story: 'Texturas electrónicas inspiradas en lluvia, tráfico y noches de estudio en el oeste de Cali.',
      tags: ['Granada', 'Electrónica', 'Textura ambiental', 'Noche'],
      insight: ['Puede requerir modo extendido por entrada instrumental.', 'Buen candidato para usuarios de música ambiental.', 'Se recomienda mostrar contexto antes del play.']
    },
    {
      id: 'santa-loma', name: 'Maracuyás', track: 'Tierra Sonora', genre: 'Fusión pacífico', city: 'Cali', neighborhood: 'Siloé', scene: 'Raíz contemporánea', language: 'Español', match: 90, duration: 154, preview: 30, symbol: '●', tone: 'gold', cover: 'assets/img/cover-maracuyas.svg', avatar: 'assets/img/david-vergara-laverde.svg', audio: 'assets/audio/tierra-sonora.wav',
      story: 'Marimba, bajo moderno y relato sobre memoria familiar entre ladera, mercado y escena independiente.',
      tags: ['Siloé', 'Fusión', 'Pacífico', 'Raíz'],
      insight: ['Contexto cultural diferencial y fácil de explicar.', 'Conecta con usuarios que buscan identidad local.', 'Aporta diversidad al feed principal.']
    },
    {
      id: 'lucia-puerto', name: 'Los Pleneros', track: 'Amanecer del Puerto', genre: 'Soul latino', city: 'Cali', neighborhood: 'Alameda', scene: 'Soul independiente', language: 'Español', match: 86, duration: 138, preview: 30, symbol: '◐', tone: 'violet', cover: 'assets/img/cover-pleneros.svg', avatar: 'assets/img/renzo-mosquera-daza.svg', audio: 'assets/audio/amanecer-del-puerto.wav',
      story: 'Soul con guitarras limpias y narrativa de trayectos cotidianos, mercado y madrugadas creativas.',
      tags: ['Alameda', 'Soul', 'Guitarra limpia', 'Madrugada'],
      insight: ['Buena entrada vocal en menos de 8 segundos.', 'Funciona para usuarios de descubrimiento tranquilo.', 'Puede generar guardados por historia cercana.']
    }
  ],
  interactions: [
    { id: 'post-1', artistId: 'valentina-cruz', type: 'Lanzamiento', title: 'Nueva cápsula disponible', body: 'Valentina comparte un fragmento de su próximo sencillo y pregunta qué parte conecta más con la escena de San Antonio.', cta: 'Responder con criterio cultural' },
    { id: 'post-2', artistId: 'maelo-solar', type: 'Pregunta', title: '¿Qué barra representa mejor a Cali?', body: 'Kmelo abre votación para elegir la línea que aparecerá en la versión final del track.', cta: 'Votar y comentar' },
    { id: 'post-3', artistId: 'santa-loma', type: 'Proceso', title: 'Detrás del sonido', body: 'Maracuyás explica cómo mezcla marimba con bajo moderno y por qué esa decisión importa para la identidad local.', cta: 'Guardar contexto' },
    { id: 'post-4', artistId: 'nina-santacruz', type: 'Curaduría', title: 'Arma el tablero visual', body: 'Soledad invita a guardar referencias visuales asociadas a su lanzamiento para construir comunidad alrededor del concepto.', cta: 'Aportar al tablero' }
  ],
  friendActivity: [
    { name: 'Luna', action: 'guardó Río de Fuego', detail: 'Lo añadió a su tablero Cali nocturna.' },
    { name: 'Johan', action: 'comentó en Barrio Norte', detail: 'Resaltó la lírica urbana y el beat cálido.' },
    { name: 'Karold', action: 'publicó una cápsula', detail: 'Nuevo adelanto visible para la comunidad.' }
  ],
  notifications: [
    { title: 'Nueva cápsula en San Antonio', body: 'Valentina Cruz tiene una actualización de lanzamiento.' },
    { title: 'Tu playlist local creció', body: 'La comunidad sumó nuevos aportes esta semana.' },
    { title: 'Autorizaciones al día', body: 'Tu configuración de datos está activa por rol.' }
  ],
  settings: [
    { title: 'Tu cuenta', body: 'Perfil, correo, privacidad y baja de cuenta.' },
    { title: 'Playback', body: 'Modo de reproducción, repetir, aleatorio y calidad.' },
    { title: 'Vista', body: 'Tema claro u oscuro, densidad de interfaz y accesibilidad.' },
    { title: 'Modo privado', body: 'Oculta temporalmente tu actividad de escucha.' },
    { title: 'Nueva playlist', body: 'Crea tableros de descubrimiento musical local.' },
    { title: 'Help y comunidad KORA', body: 'Soporte, preguntas frecuentes y normas comunitarias.' },
    { title: 'About KORA', body: 'Propósito, célula A y enfoque de descubrimiento digital.' }
  ],
  plans: [
    { id: 'free', name: 'KORA Base', price: 0, audience: 'Usuarios', badge: 'Inicio', features: ['Cápsulas de 30 segundos', 'Guardados básicos', 'Feed de interacción', 'Playlist local pública'] },
    { id: 'premium', name: 'KORA Premium Ligero', price: 12900, audience: 'Usuarios frecuentes', badge: 'Más elegido', features: ['Descubrimiento más personalizado', 'Playlists locales curadas', 'Acceso anticipado a lanzamientos', 'Pasaporte digital con insignias'] },
    { id: 'artist', name: 'KORA Artista', price: 24900, audience: 'Artistas', badge: 'Publicación', features: ['Publicación de canciones', 'Contenido visual asociado', 'Promoción de cápsulas', 'Métricas de engagement'] },
    { id: 'company', name: 'KORA Empresas CM', price: 69900, audience: 'Community managers', badge: 'B2B', features: ['Scouting por escena', 'Analítica autorizada', 'Gestión de campañas', 'SLA y soporte comercial'] }
  ],
  legalDocs: {
    terms: {
      title: 'Reglamento y Condiciones de Uso',
      lead: 'Estas condiciones regulan el acceso a KORA para usuarios, artistas y empresas que participan en el ecosistema de descubrimiento musical local.',
      sections: [
        ['Objeto de la plataforma', 'KORA permite descubrir artistas locales emergentes mediante cápsulas de audio, contexto cultural, tableros de hallazgos, interacción social y servicios asociados a suscripciones.'],
        ['Categorías de usuario', 'Los usuarios normales pueden crear, guardar y compartir contenido tipo tablero. Los artistas pueden publicar canciones, asociar contenido visual y promocionar material. Las empresas pueden contratar planes para scouting, community management y analítica autorizada.'],
        ['Permisos por rol', 'La plataforma aplica control de acceso por roles para que cada categoría vea únicamente las funciones y datos necesarios para su operación.'],
        ['Baja de cuenta', 'Cuando una cuenta se da de baja, el perfil deja de ser visible de inmediato. Los datos personales sensibles se eliminan según la política aplicable y puede conservarse información mínima anonimizada para estadísticas globales e integridad del sistema.'],
        ['Menores de edad', 'Los menores podrán acceder bajo restricciones y, cuando corresponda, con autorización de su tutor legal. KORA podrá limitar funciones de publicación, visibilidad o tratamiento de datos en estos casos.']
      ]
    },
    privacy: {
      title: 'Autorización de Tratamiento de Datos Personales',
      lead: 'Esta autorización explica qué datos se recogen, para qué se usan y cómo se comparten según la categoría del usuario.',
      sections: [
        ['Datos personales', 'KORA trata datos de autenticación, perfil, preferencias, guardados, actividad de cápsulas, interacciones y configuración de cuenta para prestar el servicio.'],
        ['Datos de artistas', 'KORA puede tratar métricas de contenido, engagement, publicaciones, rendimiento de cápsulas, perfil artístico y señales de curaduría.'],
        ['Datos de empresas', 'KORA puede tratar información de contacto, facturación, suscripción, gestión de cuentas, analíticas consultadas y límites de acceso.'],
        ['Compartición con empresas CM', 'Los datos de artistas solo serán visibles o analizables por empresas suscriptoras cuando exista autorización expresa del artista y únicamente dentro de los límites informados.'],
        ['Canal de datos', 'Las dudas, quejas o reclamos sobre tratamiento de datos podrán enviarse al correo privacidad@kora.local.']
      ]
    },
    license: {
      title: 'Licencia Musical y Protocolo Notice and Takedown',
      lead: 'Los artistas conservan sus derechos morales sobre la obra, pero autorizan usos patrimoniales necesarios para que KORA funcione.',
      sections: [
        ['Licencia no exclusiva', 'Al publicar contenido, el artista otorga a KORA una licencia no exclusiva, revocable según las condiciones aplicables, para reproducir, comunicar públicamente, alojar y distribuir cápsulas musicales dentro de la plataforma.'],
        ['Derechos morales', 'El artista conserva la autoría de la obra y el reconocimiento moral correspondiente. KORA no se presenta como propietaria de la creación musical.'],
        ['Derechos patrimoniales autorizados', 'La autorización permite operar el feed, el player, las playlists colaborativas, la promoción interna y la visualización de contenido por usuarios o empresas autorizadas.'],
        ['Música de terceros', 'Quien suba contenido declara que cuenta con autorizaciones suficientes. Si existe posible infracción, KORA podrá retirar preventivamente el contenido mediante protocolo Notice and Takedown.'],
        ['Retiro de contenido', 'Los titulares de derechos podrán reportar material presuntamente infractor al correo derechos@kora.local indicando obra, titularidad y motivo de retiro.']
      ]
    },
    payments: {
      title: 'Pagos, Facturación y Comercio Electrónico',
      lead: 'Esta sección informa las condiciones comerciales de las suscripciones de KORA.',
      sections: [
        ['Precios', 'Los precios se muestran en pesos colombianos e incluyen impuestos aplicables cuando correspondan.'],
        ['Factura electrónica', 'Si KORA opera como responsable obligado a facturar, emitirá factura electrónica a los suscriptores de acuerdo con la normativa DIAN aplicable.'],
        ['Pasarela de pago', 'El proveedor de pagos deberá cumplir estándares de seguridad para proteger la información financiera, incluyendo controles equivalentes a PCI-DSS para datos de tarjetas.'],
        ['Derecho de retracto', 'En ventas electrónicas, el usuario podrá ejercer el derecho de retracto dentro de los cinco días hábiles siguientes a la compra, siempre que el servicio no haya comenzado a ejecutarse en los términos aplicables.'],
        ['Reversión del pago', 'KORA habilitará revisión de reversión por fraude, operación no solicitada o fallas del servicio. El contacto operativo será soporte@kora.local.'],
        ['SLA empresas', 'Los planes empresariales informarán disponibilidad esperada, alcance de datos autorizados, límites de exactitud y canales de soporte comercial.']
      ]
    }
  }
};
