window.KORA_DATA = {
  teamMembers: [
    { id: 'johan', name: 'Johan Guzman', code: 'A00401480', role: 'curator', roleLabel: 'Oyente curador', city: 'Cali', initial: 'J', avatar: 'assets/img/johan-stiven-guzman.svg', bio: 'Recomienda cápsulas, comenta con criterio y ayuda a ordenar hallazgos por escena.' },
    { id: 'karold', name: 'Karold Mejia', code: 'A00401806', role: 'artist', roleLabel: 'Artista local', city: 'Cali', initial: 'K', avatar: 'assets/img/karold-lizeth-mejia-orozco.svg', bio: 'Publica cápsulas, cuenta la historia de su lanzamiento y gestiona visibilidad autorizada.' },
    { id: 'luna', name: 'Luna Martinez', code: 'A00401964', role: 'user', roleLabel: 'Exploradora musical', city: 'Cali', initial: 'L', avatar: 'assets/img/luna-catalina-martinez.svg', bio: 'Descubre artistas emergentes, guarda hallazgos y sigue actividad de la comunidad.' },
    { id: 'renzo', name: 'Renzo Mosquera', code: 'A00401681', role: 'company', roleLabel: 'Empresa / scout', city: 'Cali', initial: 'R', avatar: 'assets/img/renzo-mosquera-daza.svg', bio: 'Analiza talento emergente con métricas agregadas, permisos y límites de datos.' }
  ],
  roleProfiles: [
    { id: 'scout-role', name: 'Agencia Brújula', role: 'company', roleLabel: 'Empresa / scout', city: 'Cali', initial: 'A', avatar: 'assets/img/agencia-brujula.svg', bio: 'Analiza escenas, identifica artistas y revisa señales autorizadas para scouting responsable.' },
    { id: 'ambassador-role', name: 'Laura Pérez', role: 'ambassador', roleLabel: 'Embajadora cultural', city: 'Cali', initial: 'L', avatar: 'assets/img/laura-perez.svg', bio: 'Contextualiza música local conectando canciones con barrio, escena y comunidad.' },
    { id: 'listener-role', name: 'Mateo Rivas', role: 'user', roleLabel: 'Explorador musical', city: 'Cali', initial: 'M', avatar: 'assets/img/mateo-rivas.svg', bio: 'Descubre artistas emergentes, guarda hallazgos y comparte canciones con amigos.' },
    { id: 'artist-role', name: 'Sara León', role: 'artist', roleLabel: 'Artista local', city: 'Cali', initial: 'S', avatar: 'assets/img/sara-leon.svg', bio: 'Publica cápsulas, agrega contexto cultural y revisa señales de recepción.' }
  ],
  roleSystem: {
    user: {
      label: 'Explorador musical',
      action: 'Descubrir',
      purpose: 'Encuentra artistas emergentes y guarda hallazgos para volver a escucharlos.',
      accountState: 'Descubriendo escena local',
      accountMeta: 'Hallazgos, playlists y actividad protegidos.',
      profileAxis: 'Descubrimiento musical',
      interactionHeadline: 'Descubre artistas, guarda hallazgos y conversa con la escena local.',
      interactionCta: 'Sumar a playlist local',
      saveLabel: 'Guardar artista',
      impactTitle: 'artistas visibles',
      impactBody: 'Cada guardado alimenta tu memoria musical y convierte el descubrimiento en una señal para otros oyentes.',
      workspace: {
        eyebrow: 'Rol: descubrir',
        title: 'Explorador musical',
        badge: 'Descubrir',
        intro: 'El explorador musical encuentra artistas emergentes, guarda lo que conecta con sus gustos y vuelve a esos hallazgos sin perderlos entre listas genéricas.',
        features: [
          ['Cápsulas locales', 'Escucha fragmentos breves con historia, barrio y escena antes de decidir si quieres seguir.'],
          ['Memoria musical', 'Guarda hallazgos para construir un tablero propio y recordarlos después.'],
          ['Comunidad cercana', 'Sigue lo que tus amigos guardan, comentan o recomiendan dentro de KORA.']
        ],
        actions: [
          ['primary', 'Abrir amigos y actividad', 'openFriends'],
          ['soft', 'Guardar cápsula actual', 'saveCurrent']
        ]
      },
      privacy: [['Actividad de descubrimiento', 'Tus guardados, likes y playlists se usan para personalizar la experiencia sin convertirlos en datos comerciales visibles por defecto.']]
    },
    curator: {
      label: 'Oyente curador',
      action: 'Recomendar',
      purpose: 'Comenta, repostea y da criterio para que otros descubran con razones.',
      accountState: 'Curaduría activa',
      accountMeta: 'Comentarios, tableros y recomendaciones visibles.',
      profileAxis: 'Curaduría local',
      interactionHeadline: 'Recomienda cápsulas con criterio cultural y señales para otros oyentes.',
      interactionCta: 'Crear recomendación',
      saveLabel: 'Guardar para curar',
      impactTitle: 'señales curatoriales',
      impactBody: 'Cada aporte ayuda a convertir canciones emergentes en rutas de escucha con criterio humano.',
      workspace: {
        eyebrow: 'Rol: recomendar',
        title: 'Oyente curador',
        badge: 'Recomendar',
        intro: 'El oyente curador no solo escucha: explica por qué una cápsula vale la pena, la repostea con criterio y ayuda a otros usuarios a encontrar música relevante.',
        features: [
          ['Lectura crítica', 'Comenta canciones desde letra, sonido, contexto cultural o afinidad con una escena.'],
          ['Repost con criterio', 'Convierte un hallazgo en recomendación visible para la comunidad.'],
          ['Tableros curados', 'Agrupa canciones por barrio, energía, género o intención de escucha.']
        ],
        actions: [
          ['primary', 'Recomendar en feed', 'interactPost:post-1'],
          ['soft', 'Guardar para curar', 'saveCurrent']
        ]
      },
      privacy: [['Aportes curatoriales', 'Tus comentarios y recomendaciones pueden mostrarse en el feed como señales comunitarias asociadas a tu perfil.']]
    },
    ambassador: {
      label: 'Embajadora cultural',
      action: 'Contextualizar',
      purpose: 'Conecta música con barrio, escena, memoria cultural y comunidad.',
      accountState: 'Contexto comunitario activo',
      accountMeta: 'Barrios, escenas y tableros culturales visibles.',
      profileAxis: 'Embajada cultural',
      interactionHeadline: 'Conecta canciones con barrio, escena y memoria cultural de la comunidad.',
      interactionCta: 'Crear aporte cultural',
      saveLabel: 'Guardar con contexto',
      impactTitle: 'aportes culturales',
      impactBody: 'Cada contexto agregado evita que la música local aparezca como contenido aislado y fortalece la memoria de la escena.',
      workspace: {
        eyebrow: 'Rol: contextualizar',
        title: 'Embajadora cultural',
        badge: 'Contextualizar',
        intro: 'La embajadora cultural relaciona canciones con barrio, escena, relatos locales y comunidad para que el descubrimiento tenga memoria territorial.',
        features: [
          ['Barrio y escena', 'Resalta de dónde viene una cápsula y qué conversación cultural abre.'],
          ['Notas de contexto', 'Aporta datos, relatos o referencias que expliquen por qué importa la canción.'],
          ['Activación comunitaria', 'Invita a otros usuarios a sumar recuerdos, comentarios o playlists locales.']
        ],
        actions: [
          ['primary', 'Aportar contexto', 'interactPost:post-3'],
          ['soft', 'Ver actividad comunitaria', 'openFriends']
        ]
      },
      privacy: [['Contexto comunitario', 'Tus aportes culturales pueden mostrarse como parte de la memoria pública de la plataforma.']]
    },
    artist: {
      label: 'Artista local',
      action: 'Publicar',
      purpose: 'Sube cápsulas, cuenta la historia de su obra y revisa señales de recepción.',
      accountState: 'Publicación activa',
      accountMeta: 'Licencia, cápsulas y visibilidad configurables.',
      profileAxis: 'Publicación musical',
      interactionHeadline: 'Responde a la comunidad y revisa señales para tus lanzamientos.',
      interactionCta: 'Impulsar cápsula activa',
      saveLabel: 'Guardar referencia',
      impactTitle: 'señales para lanzamiento',
      impactBody: 'Cada guardado, comentario o repost ayuda a leer cómo conecta tu música con la comunidad.',
      workspace: {
        eyebrow: 'Rol: publicar',
        title: 'Artista local',
        badge: 'Publicar',
        intro: 'El artista local publica cápsulas de 30 segundos, agrega historia y decide qué señales pueden analizar empresas autorizadas.',
        features: [
          ['Cápsulas', 'Publica adelantos con audio, portada, barrio, género e historia cultural.'],
          ['Recepción', 'Revisa guardados, likes, reposts y señales de interacción simuladas.'],
          ['Visibilidad autorizada', 'Controla si empresas suscriptoras pueden ver métricas agregadas del lanzamiento.']
        ],
        actions: [
          ['primary', 'Ir a publicar música', 'view:publish'],
          ['soft', 'Generar copy de lanzamiento', 'openAi']
        ]
      },
      privacy: [['Visibilidad para empresas CM', 'El perfil artístico y sus métricas solo se comparten con empresas cuando existe autorización expresa.']]
    },
    company: {
      label: 'Empresa / scout',
      action: 'Analizar',
      purpose: 'Revisa talento emergente mediante métricas agregadas y datos autorizados.',
      accountState: 'Scouting activo',
      accountMeta: 'Métricas agregadas y datos autorizados visibles.',
      profileAxis: 'Scouting responsable',
      interactionHeadline: 'Analiza artistas, señales y oportunidades con datos autorizados.',
      interactionCta: 'Marcar artista para contacto',
      saveLabel: 'Guardar en radar',
      impactTitle: 'señales comerciales',
      impactBody: 'El radar prioriza artistas con autorización, afinidad cultural y límites claros de acceso a datos.',
      workspace: {
        eyebrow: 'Rol: analizar',
        title: 'Empresa / scout',
        badge: 'Analizar',
        intro: 'La empresa o scout explora talento emergente con métricas agregadas y solo accede a información autorizada por artistas.',
        features: [
          ['Radar de talento', 'Marca artistas con afinidad alta para revisar oportunidades de scouting.'],
          ['Datos autorizados', 'Consulta señales agregadas sin acceder a información privada no habilitada.'],
          ['Decisión responsable', 'Prepara contacto o campaña respetando límites legales y de visibilidad.']
        ],
        actions: [
          ['primary', 'Ver radar en interacción', 'view:interaction'],
          ['soft', 'Revisar plan empresa', 'view:billing']
        ]
      },
      privacy: [['Límites empresariales', 'La empresa accede a datos autorizados para scouting y gestión, con límites de disponibilidad y veracidad informados.']]
    }
  },
  roleLegal: {
    user: {
      title: 'Autorizaciones para explorador musical',
      lead: 'Estas autorizaciones se enfocan en descubrimiento, guardados, playlists, actividad social y recordatorios de hallazgos.',
      terms: 'Acepto el uso de KORA como explorador musical para descubrir cápsulas, guardar hallazgos, crear playlists y participar en el feed comunitario.',
      privacy: 'Autorizo el tratamiento de mis datos de perfil, gustos, guardados, reproducciones, notas de hallazgo y actividad social para personalizar mi experiencia.',
      roleData: 'Entiendo que mis guardados y comentarios pueden mostrarse como señales comunitarias cuando yo interactúe públicamente dentro de KORA.'
    },
    curator: {
      title: 'Autorizaciones para oyente curador',
      lead: 'Estas autorizaciones se enfocan en recomendaciones, comentarios curatoriales, reposts y tableros de escucha.',
      terms: 'Acepto participar como oyente curador, publicando recomendaciones, comentarios y señales de criterio sobre canciones emergentes.',
      privacy: 'Autorizo el tratamiento de mis comentarios, reposts, guardados y criterios de curaduría para ordenar recomendaciones dentro de la comunidad.',
      roleData: 'Entiendo que mis aportes curatoriales pueden aparecer asociados a mi perfil como recomendaciones visibles para otros usuarios.'
    },
    ambassador: {
      title: 'Autorizaciones para embajador cultural',
      lead: 'Estas autorizaciones se enfocan en contexto territorial, memoria cultural, barrios, escenas y aportes comunitarios.',
      terms: 'Acepto participar como embajador cultural, aportando contexto sobre barrios, escenas, relatos y memoria local vinculada a canciones.',
      privacy: 'Autorizo el tratamiento de mis aportes culturales, escenas seguidas, barrios destacados y comentarios comunitarios para fortalecer la memoria musical local.',
      roleData: 'Entiendo que mis aportes culturales pueden mostrarse públicamente como contexto de canciones, playlists o escenas dentro de KORA.'
    },
    artist: {
      title: 'Autorizaciones para artista local',
      lead: 'Estas autorizaciones se enfocan en publicación musical, licencia de cápsulas, portada, historia cultural y métricas de recepción.',
      terms: 'Acepto publicar contenido como artista local y declaro que cuento con derechos o permisos suficientes sobre el audio, portada e información que suba.',
      privacy: 'Autorizo el tratamiento de mi perfil artístico, publicaciones, métricas de interacción, comentarios recibidos y señales de engagement de mis cápsulas.',
      roleData: 'Entiendo que las empresas solo podrán ver métricas agregadas o señales de mis lanzamientos cuando yo active la autorización correspondiente.'
    },
    company: {
      title: 'Autorizaciones para empresa o scout',
      lead: 'Estas autorizaciones se enfocan en scouting responsable, analítica agregada, facturación y límites de acceso a datos de artistas.',
      terms: 'Acepto usar KORA como empresa o scout únicamente para analizar talento con datos autorizados y sin contactar o explotar información fuera de los límites informados.',
      privacy: 'Autorizo el tratamiento de datos de cuenta empresarial, facturación, suscripción, artistas revisados y actividad de scouting dentro de KORA.',
      roleData: 'Entiendo que el acceso empresarial se limita a métricas agregadas y datos autorizados por artistas, sin visibilidad de información privada no habilitada.'
    }
  },
  viewGuides: {
    discover: {
      eyebrow: 'Inicio de exploración',
      title: 'Qué vas a encontrar en Descubrir',
      body: 'Aquí aparecen cápsulas locales, historia del artista, barrio, escena y señales rápidas para decidir qué vale la pena escuchar después.',
      roleNotes: {
        user: 'Como explorador, este es tu punto de partida para encontrar y guardar hallazgos.',
        curator: 'Como curador, usa esta vista para detectar canciones que merecen recomendación.',
        ambassador: 'Como embajador, revisa qué contexto territorial puede reforzar cada cápsula.',
        artist: 'Como artista, observa cómo se presenta una cápsula a la comunidad.',
        company: 'Como empresa, identifica señales iniciales de escena, afinidad y recepción.'
      }
    },
    player: {
      eyebrow: 'Escucha con contexto',
      title: 'Qué vas a encontrar en Player',
      body: 'El player no solo reproduce: muestra historia, escena, match cultural y acciones para guardar, repostear o compartir la cápsula.',
      roleNotes: {
        user: 'Como explorador, decide si la canción pasa a tu memoria musical.',
        curator: 'Como curador, identifica razones para recomendarla con criterio.',
        ambassador: 'Como embajador, revisa si la historia necesita más contexto local.',
        artist: 'Como artista, mira cómo se vería la lectura de una publicación propia.',
        company: 'Como empresa, observa señales antes de marcar un artista para radar.'
      }
    },
    interaction: {
      eyebrow: 'Comunidad visible',
      title: 'Qué vas a encontrar en Interacción',
      body: 'Aquí se reúnen comentarios, reposts, actividad de amigos, playlists colaborativas y señales humanas alrededor de canciones locales.',
      roleNotes: {
        user: 'Como explorador, puedes seguir lo que otras personas guardan o recomiendan.',
        curator: 'Como curador, este es tu espacio natural para dejar criterio visible.',
        ambassador: 'Como embajador, aquí conectas canciones con memoria cultural y comunidad.',
        artist: 'Como artista, revisa cómo responde la comunidad a las cápsulas.',
        company: 'Como empresa, usa esta vista como radar de señales autorizadas.'
      }
    },
    publish: {
      eyebrow: 'Publicación musical',
      title: 'Qué vas a encontrar en Publicar música',
      body: 'Esta vista permite a artistas subir cápsulas, portada, género, barrio, historia y autorizaciones de visibilidad.',
      roleNotes: {
        artist: 'Como artista, aquí conviertes una canción en cápsula contextualizada para la comunidad.',
        user: 'Esta función está reservada para artistas locales.',
        curator: 'Esta función está reservada para artistas locales.',
        ambassador: 'Esta función está reservada para artistas locales.',
        company: 'Esta función está reservada para artistas locales.'
      }
    },
    billing: {
      eyebrow: 'Planes y facturación',
      title: 'Qué vas a encontrar en Pagos',
      body: 'Aquí se muestran planes, beneficios, suscripción, factura simulada y acceso comercial según tipo de usuario.',
      roleNotes: {
        user: 'Como explorador, puedes revisar opciones para ampliar descubrimiento y playlists.',
        curator: 'Como curador, los planes refuerzan herramientas de descubrimiento frecuente.',
        ambassador: 'Como embajador, los planes conectan comunidad, escenas y acceso ampliado.',
        artist: 'Como artista, revisa el plan de publicación y métricas de lanzamiento.',
        company: 'Como empresa, revisa el plan de scouting y analítica autorizada.'
      }
    },
    profile: {
      eyebrow: 'Tu rol en KORA',
      title: 'Qué vas a encontrar en Perfil',
      body: 'El perfil resume tu rol, métricas personales, permisos, autorizaciones y workspace de participación dentro del ecosistema.',
      roleNotes: {
        user: 'Como explorador, verás hallazgos, playlists y actividad protegida.',
        curator: 'Como curador, verás recomendaciones, comentarios y tableros.',
        ambassador: 'Como embajador, verás escenas, barrios y aportes culturales.',
        artist: 'Como artista, verás publicaciones, permisos y señales de recepción.',
        company: 'Como empresa, verás radar, límites de datos y scouting responsable.'
      }
    }
  },
  memoryPrompts: [
    'Conectó con tu escena local.',
    'Tiene historia de barrio y contexto cultural.',
    'Puede servir para una playlist o tablero futuro.',
    'La comunidad está generando señales alrededor de esta cápsula.',
    'El fragmento merece una segunda escucha.'
  ],
  communityTypes: {
    save: 'Guardado',
    comment: 'Comentario',
    repost: 'Repost',
    share: 'Compartido',
    playlist: 'Playlist',
    publish: 'Lanzamiento',
    curator: 'Curaduría',
    context: 'Contexto',
    scout: 'Scouting'
  },
  communitySignals: [
    { title: 'Criterio humano', body: 'Las recomendaciones visibles vienen de comentarios, reposts y guardados de la comunidad.' },
    { title: 'Memoria local', body: 'Cada aporte suma barrio, escena o razón para que el hallazgo no se pierda.' },
    { title: 'Actividad sin chat privado', body: 'El usuario se entera por feed, notificaciones y actividad de amigos.' }
  ],
  phaseValidation: {
    title: 'Alcance de validación del prototipo',
    body: 'En esta primera fase se validó principalmente la experiencia del usuario oyente. Los flujos de artista y empresa quedan prototipados como segunda fase y requieren validación específica con agentes del sector musical y emprendimiento.',
    artist: {
      eyebrow: 'Fase 7 · Artista',
      title: 'Módulo artista prototipado para segunda validación',
      badge: 'Validación pendiente',
      body: 'El artista puede publicar cápsulas, revisar recepción simulada, confirmar estado de licencia y decidir si habilita métricas agregadas para empresas.',
      items: ['Dashboard de publicaciones', 'Métricas simuladas de recepción', 'Estado de licencia visible', 'Autorización para empresas CM', 'Checklist antes de publicar']
    },
    company: {
      eyebrow: 'Fase 7 · Empresa',
      title: 'Módulo empresa prototipado para scouting responsable',
      badge: 'Datos autorizados',
      body: 'La empresa puede revisar radar de artistas, escenas activas y métricas agregadas sin acceder a información privada no autorizada.',
      items: ['Radar de artistas emergentes', 'Escenas más activas', 'Métricas agregadas', 'Advertencia de datos autorizados', 'CTA de scouting responsable']
    }
  },
  artistPublishChecklist: [
    { title: 'Derechos del audio y portada', body: 'Confirmar que el artista cuenta con permisos suficientes sobre música, imagen y material visual.', state: 'Requerido' },
    { title: 'Historia y contexto cultural', body: 'Agregar barrio, escena, género y relato breve para que la cápsula no sea solo un archivo de audio.', state: 'Requerido' },
    { title: 'Licencia dentro de KORA', body: 'Aceptar licencia no exclusiva para reproducir y comunicar la cápsula dentro de la plataforma.', state: 'Requerido' },
    { title: 'Visibilidad para empresas', body: 'Definir si las empresas CM pueden ver métricas agregadas del lanzamiento.', state: 'Opcional' },
    { title: 'Validación sector musical', body: 'Contrastar este flujo con artistas, profesores de música o agentes del sector antes de producción.', state: 'Pendiente' }
  ],
  companyScoutingSignals: [
    { title: 'Match cultural', body: 'Afinidad simulada entre artista, escena y criterios de descubrimiento.' },
    { title: 'Recepción comunitaria', body: 'Guardados, reposts, comentarios y actividad visible dentro de KORA.' },
    { title: 'Visibilidad autorizada', body: 'La empresa solo interpreta métricas agregadas cuando el artista habilita ese acceso.' },
    { title: 'Escena y territorio', body: 'Lectura de barrio, género y contexto cultural para evitar decisiones basadas solo en reproducciones.' }
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

    },
    {
      id: 'aurora-ladera', name: 'Naya del Valle', track: 'Aurora de Ladera', genre: 'Neo soul caleño', city: 'Cali', neighborhood: 'Terrón Colorado', scene: 'Soul local', language: 'Español', match: 89, duration: 142, preview: 30, symbol: '✺', tone: 'teal', cover: 'assets/img/cover-aurora-ladera.svg', avatar: 'assets/img/laura-perez.svg', audio: 'assets/audio/aurora-de-ladera.wav',
      story: 'Voces suaves, bajo redondo y una historia sobre mirar la ciudad desde la ladera antes de empezar el día.',
      tags: ['Terrón Colorado', 'Neo soul', 'Ladera', 'Voz íntima'],
      insight: ['Entrada vocal directa y cálida.', 'Conecta con usuarios que guardan R&B y soul.', 'Aporta representación de ladera al feed digital.']
    },
    {
      id: 'medianoche-alameda', name: 'Cromo Pacífico', track: 'Medianoche Alameda', genre: 'House latino', city: 'Cali', neighborhood: 'Alameda', scene: 'Electro afro', language: 'Instrumental', match: 84, duration: 160, preview: 30, symbol: '◇', tone: 'indigo', cover: 'assets/img/cover-medianoche-alameda.svg', avatar: 'assets/img/angela-quitiaquez.svg', audio: 'assets/audio/medianoche-alameda.wav',
      story: 'Percusión filtrada, sintetizadores nocturnos y una lectura sonora del mercado, las luces y los recorridos por Alameda.',
      tags: ['Alameda', 'House', 'Nocturno', 'Percusión'],
      insight: ['Ideal para cápsulas visuales con movimiento.', 'Buena opción para playlists de noche.', 'Su contexto funciona antes del drop.']
    },
    {
      id: 'brisa-oriente', name: 'Lía Montoya', track: 'Brisa del Oriente', genre: 'Pop urbano', city: 'Cali', neighborhood: 'Ciudad Córdoba', scene: 'Pop de barrio', language: 'Español', match: 87, duration: 136, preview: 30, symbol: '✧', tone: 'rose', cover: 'assets/img/cover-brisa-oriente.svg', avatar: 'assets/img/luna-catalina-martinez.svg', audio: 'assets/audio/brisa-del-oriente.wav',
      story: 'Melodía pegajosa, percusión ligera y una cápsula sobre amistad, buses, colegio y tardes al oriente de Cali.',
      tags: ['Ciudad Córdoba', 'Pop urbano', 'Hook rápido', 'Oriente'],
      insight: ['Coro memorable antes del segundo 15.', 'Probabilidad alta de compartir con amigos.', 'Suma diversidad territorial al descubrimiento.']
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
    { id: 'notif-launch-san-antonio', title: 'Nueva cápsula en San Antonio', body: 'Valentina Cruz tiene una actualización de lanzamiento.', type: 'launch', artistId: 'valentina-cruz' },
    { id: 'notif-comment-repost', title: 'Luna comentó tu hallazgo', body: 'Su aporte agregó contexto de barrio a una cápsula que compartiste.', type: 'comment', artistId: 'santa-loma', postId: 'post-3' },
    { id: 'notif-friend-save', title: 'Johan guardó una cápsula que podría gustarte', body: 'La añadió a su tablero de rap, barrio y ladera.', type: 'save', artistId: 'maelo-solar' },
    { id: 'notif-curator-context', title: 'Karold destacó una canción por su contexto cultural', body: 'La recomendación aparece como señal curatorial en el feed.', type: 'curator', artistId: 'valentina-cruz', postId: 'post-1' },
    { id: 'notif-playlist-grow', title: 'Tu playlist local creció', body: 'La comunidad sumó nuevos aportes esta semana.', type: 'playlist' },
    { id: 'notif-data-ready', title: 'Autorizaciones al día', body: 'Tu configuración de datos está activa por rol.', type: 'system' }
  ],
  friends: [
    { name: 'Johan', affinity: 'Rap y contexto urbano' },
    { name: 'Karold', affinity: 'Lanzamientos y métricas' },
    { name: 'Luna', affinity: 'Playlists y tableros' },
    { name: 'Renzo', affinity: 'Scouting y radar' }
  ],

  playlists: [
    { id: 'cali-nocturna', name: 'Cali nocturna', curator: 'Luna Martinez', cover: 'assets/img/cover-medianoche-alameda.svg', tracks: ['valentina-cruz', 'duo-cables', 'medianoche-alameda'], mood: 'R&B, electrónica suave y ciudad de noche' },
    { id: 'barrio-y-ladera', name: 'Barrio y ladera', curator: 'Johan Guzman', cover: 'assets/img/cover-aurora-ladera.svg', tracks: ['maelo-solar', 'santa-loma', 'aurora-ladera'], mood: 'Rap, raíz y relatos territoriales' },
    { id: 'pop-local', name: 'Pop local emergente', curator: 'Laura Pérez', cover: 'assets/img/cover-brisa-oriente.svg', tracks: ['nina-santacruz', 'brisa-oriente'], mood: 'Hooks rápidos para compartir' }
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
    { id: 'free', name: 'KORA Base', price: 0, audience: 'Exploradores', badge: 'Inicio validado', features: ['Cápsulas de 30 segundos con historia', 'Guardados y tablero de memoria', 'Feed público de interacción', 'Playlist local colaborativa'], note: 'Plan enfocado en la experiencia oyente validada.' },
    { id: 'premium', name: 'KORA Premium Ligero', price: 12900, audience: 'Usuarios frecuentes', badge: 'Descubrimiento ampliado', features: ['Descubrimiento más personalizado', 'Playlists locales curadas', 'Acceso anticipado a lanzamientos', 'Pasaporte digital con insignias'], note: 'Extiende la experiencia de descubrimiento sin cambiar el alcance legal base.' },
    { id: 'artist', name: 'KORA Artista', price: 24900, audience: 'Artistas', badge: 'Segunda fase', features: ['Publicación de cápsulas con historia', 'Dashboard de recepción simulada', 'Estado de licencia y autorización CM', 'Checklist previo a publicación'], note: 'Flujo prototipado; requiere validación con agentes del sector musical.' },
    { id: 'company', name: 'KORA Empresas CM', price: 69900, audience: 'Empresas y scouts', badge: 'Segunda fase B2B', features: ['Radar de talento emergente', 'Escenas activas por contexto', 'Métricas agregadas autorizadas', 'Scouting responsable con límites legales'], note: 'Flujo prototipado; requiere validación con emprendimiento, empresas o scouts.' }
  ],
  legalDocs: {
    terms: {
      title: 'Términos y Condiciones de Uso',
      lead: 'Estos términos y condiciones regulan el acceso a KORA para usuarios, artistas y empresas que participan en el ecosistema de descubrimiento musical local.',
      sections: [
        ['Objeto de la plataforma', 'KORA permite descubrir artistas locales emergentes mediante cápsulas de audio, contexto cultural, tableros de hallazgos, interacción social y servicios asociados a suscripciones.'],
        ['Categorías de usuario', 'Los usuarios normales pueden crear, guardar y compartir contenido tipo tablero. Los artistas pueden publicar canciones, asociar contenido visual y promocionar material. Las empresas pueden contratar planes para scouting, community management y analítica autorizada.'],
        ['Permisos por rol', 'La plataforma aplica control de acceso por roles para que cada categoría vea únicamente las funciones y datos necesarios para su operación.'],
        ['Baja de cuenta', 'Cuando una cuenta se da de baja, el perfil deja de ser visible de inmediato. Los datos personales sensibles se eliminan según la política aplicable y puede conservarse información mínima anonimizada para estadísticas globales e integridad del sistema.'],
        ['Menores de edad', 'Los menores podrán acceder bajo restricciones y, cuando corresponda, con autorización de su tutor legal. KORA podrá limitar funciones de publicación, visibilidad o tratamiento de datos en estos casos.'],
        ['Alcance del prototipo', 'La primera fase validada se centra en usuarios oyentes. Los flujos de artista y empresa están implementados como prototipo de segunda fase y no deben presentarse como validados en producción.']
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
        ['Canal de datos', 'Las dudas, quejas o reclamos sobre tratamiento de datos podrán enviarse al correo privacidad@kora.local.'],
        ['Datos autorizados por rol', 'Exploradores, curadores y embajadores usan datos de actividad comunitaria; artistas autorizan métricas agregadas de sus cápsulas; empresas solo acceden a señales autorizadas y límites visibles.']
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
        ['Retiro de contenido', 'Los titulares de derechos podrán reportar material presuntamente infractor al correo derechos@kora.local indicando obra, titularidad y motivo de retiro.'],
        ['Estado de publicación', 'Cada cápsula publicada debe mostrar si la licencia está registrada y si las métricas agregadas están habilitadas para empresas CM.']
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
        ['SLA empresas', 'Los planes empresariales informarán disponibilidad esperada, alcance de datos autorizados, límites de exactitud y canales de soporte comercial.'],
        ['Planes en prototipo', 'Los planes de artista y empresa justifican el modelo de negocio, pero quedan como segunda fase de validación sectorial antes de una implementación real.']
      ]
    }
  }
};
