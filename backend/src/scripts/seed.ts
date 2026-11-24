import { hash } from 'bcryptjs';
import type { Transaction } from 'sequelize';
import { sequelize } from '../config/db.config';
import { DatabaseRepository } from '../database/database.repository';

const db = new DatabaseRepository();
const testPassword = 'MiniAula123!';
const accounts = [
  {
    nombre: 'Valeria Ríos',
    email: 'instructor1@miniaula.test',
    rol: 'instructor',
  },
  {
    nombre: 'Mateo Torres',
    email: 'instructor2@miniaula.test',
    rol: 'instructor',
  },
  {
    nombre: 'Lucía Mendoza',
    email: 'estudiante1@miniaula.test',
    rol: 'estudiante',
  },
  {
    nombre: 'Diego Flores',
    email: 'estudiante2@miniaula.test',
    rol: 'estudiante',
  },
  {
    nombre: 'Sofía Arce',
    email: 'estudiante3@miniaula.test',
    rol: 'estudiante',
  },
];

const courses = [
  {
    titulo: 'JavaScript moderno, desde las bases',
    descripcion:
      'Aprende a representar información, tomar decisiones y organizar tu código con funciones. Construye una base práctica para tus proyectos web.',
    categoria: 'Programación',
    nivel: 'Básico',
    instructor: 0,
    lessons: [
      [
        'Tu primer programa',
        'JavaScript permite agregar comportamiento a una página web.\n\nAbre las herramientas de desarrollo del navegador y prueba esta instrucción en la consola:\n\nconsole.log("Hola, MiniAula");\n\nconsole.log muestra un valor y te ayuda a observar lo que hace tu código. Cambia el mensaje por tu nombre y vuelve a ejecutar la instrucción.',
      ],
      [
        'Variables y tipos de datos',
        'Una variable guarda información que tu programa puede utilizar después.\n\nconst nombre = "Lucía";\nlet leccionesCompletadas = 0;\nleccionesCompletadas = leccionesCompletadas + 1;\n\nUsa const cuando no necesitas reasignar el valor y let cuando sí necesitas cambiarlo.\n\nPractica creando una variable para un título, otra para un número y otra para indicar si un curso está publicado.',
      ],
      ['Comprueba tus fundamentos', null],
      [
        'Funciones con propósito',
        'Una función agrupa instrucciones para resolver una tarea concreta. Puede recibir parámetros y devolver un resultado.\n\nfunction calcularAvance(completadas, total) {\n  return Math.round((completadas / total) * 100);\n}\n\nconsole.log(calcularAvance(3, 5));\n\nEl resultado es 60. Prueba otros valores y piensa cómo manejarías un total de cero.',
      ],
      [
        'Construye un pequeño proyecto',
        'Crea una lista de tres cursos, cada uno con título, categoría y cantidad de lecciones.\n\nRecorre la lista y muestra cada título en la consola. Después, escribe una función que filtre los cursos por categoría.\n\nDivide el problema en pasos pequeños. Comprueba cada paso con un ejemplo antes de continuar.',
      ],
    ],
    questions: [
      {
        enunciado:
          '¿Qué palabra permite declarar una variable que se reasignará?',
        opciones: ['const', 'let', 'return'],
        correcta: 1,
      },
      {
        enunciado: '¿Qué instrucción devuelve el resultado de una función?',
        opciones: ['return', 'console', 'let'],
        correcta: 0,
      },
    ],
  },
  {
    titulo: 'Diseña interfaces que se sienten bien',
    descripcion:
      'Descubre cómo usar jerarquía visual, tipografía y color para diseñar interfaces claras y consistentes. Convierte una idea en una pantalla que se pueda usar.',
    categoria: 'Diseño',
    nivel: 'Básico',
    instructor: 0,
    lessons: [
      [
        'Diseña para una persona y una tarea',
        'Antes de dibujar una pantalla, escribe quién la usará y qué necesita hacer.\n\nPor ejemplo: un estudiante necesita encontrar el siguiente contenido de un curso. La acción principal debe ser fácil de identificar.\n\nElige una tarea cotidiana y describe sus tres pasos principales. Elimina de tu propuesta los elementos que no ayudan a completar esa tarea.',
      ],
      [
        'Jerarquía visual y tipografía',
        'El tamaño, el peso y el espacio ayudan a ordenar la información.\n\nDefine un título principal, encabezados de sección y texto de lectura. Usa tamaños consistentes para elementos que cumplen la misma función.\n\nPractica diseñando una tarjeta de curso. Comprueba que el título se distinga de la categoría y del nombre del instructor.',
      ],
      ['Reconoce una interfaz clara', null],
      [
        'Color, contraste y estados',
        'El color puede comunicar una acción o un estado, pero debe acompañarse de texto o iconos.\n\nUn estado completado puede combinar una marca de verificación y la palabra Completada. Una lección bloqueada puede mostrar un candado y una explicación.\n\nDiseña los estados normal, activo, deshabilitado y error de un botón. Revisa que el texto mantenga un contraste legible.',
      ],
      [
        'De la idea al prototipo',
        'Construye una pantalla con navegación, título, información principal y una acción clara.\n\nOrganiza los componentes en una cuadrícula. Prueba cómo se adaptan a un ancho de 375 píxeles.\n\nPide a otra persona que complete la tarea sin explicaciones. Observa dónde duda y mejora ese punto.',
      ],
    ],
    questions: [
      {
        enunciado: '¿Qué ayuda a identificar la información más importante?',
        opciones: [
          'Una jerarquía visual consistente',
          'Usar todos los textos del mismo tamaño',
          'Agregar más colores',
        ],
        correcta: 0,
      },
      {
        enunciado: '¿Cómo debe comunicarse un estado de error?',
        opciones: [
          'Solo con el color rojo',
          'Con texto claro y una señal visual',
          'Ocultando el formulario',
        ],
        correcta: 1,
      },
    ],
  },
  {
    titulo: 'Inglés para conectar con el mundo',
    descripcion:
      'Practica presentaciones y conversaciones cotidianas. Aprende expresiones sencillas para comunicar tus ideas con más confianza.',
    categoria: 'Idiomas',
    nivel: 'Básico',
    instructor: 1,
    lessons: [
      [
        'Hello, nice to meet you',
        'Para presentarte puedes decir:\n\nHello, my name is Lucía.\nNice to meet you.\nI am a student.\n\nMy name is significa Mi nombre es. Nice to meet you expresa gusto por conocer a alguien.\n\nPractica una presentación de tres frases con tu nombre y lo que estudias.',
      ],
      [
        'Tu día a día en inglés',
        'Usa el presente simple para hablar de rutinas.\n\nI study in the morning.\nI work on my projects in the afternoon.\nShe studies English every day.\n\nObserva que con she el verbo study cambia a studies. Escribe tres frases sobre tu rutina.',
      ],
      ['Time to practice', null],
      [
        'Conversaciones que conectan',
        'Una pregunta sencilla puede iniciar una conversación.\n\nWhat do you study?\nWhere are you from?\nWhat do you like to do?\n\nEscucha la respuesta y haz una pregunta relacionada. No necesitas hablar de forma perfecta para comunicar una idea.',
      ],
      [
        'Tu siguiente conversación',
        'Prepara un diálogo breve con una presentación, dos preguntas y una despedida.\n\nPuedes cerrar una conversación con: It was nice talking to you. See you later!\n\nPractica el diálogo en voz alta. Repite las frases que te cuesten y busca una pronunciación clara.',
      ],
    ],
    questions: [
      {
        enunciado: '¿Qué expresión sirve para presentarte?',
        opciones: ['My name is Lucía', 'See you later', 'Thank you'],
        correcta: 0,
      },
      {
        enunciado: '¿Cuál frase expresa una rutina correctamente?',
        opciones: [
          'She study English',
          'She studies English',
          'She studying English',
        ],
        correcta: 1,
      },
    ],
  },
];

type SeedCourse = {
  id: number;
  estado: string;
  lessons: { id: number; tipo: string }[];
};

async function seedCourse(
  definition: (typeof courses)[number],
  instructorId: number,
  transaction: Transaction,
): Promise<SeedCourse> {
  const [existing] = await db.select<{ id: number; estado: string }>(
    'SELECT id, estado FROM cursos WHERE instructor_id = $instructorId AND titulo = $titulo ORDER BY id LIMIT 1',
    { instructorId, titulo: definition.titulo },
    transaction,
  );
  if (existing) {
    const lessons = await db.select<{ id: number; tipo: string }>(
      'SELECT id, tipo FROM lecciones WHERE curso_id = $id ORDER BY orden, id',
      { id: existing.id },
      transaction,
    );
    return { ...existing, lessons };
  }
  const [course] = await db.select<{ id: number }>(
    `WITH creado AS (
      INSERT INTO cursos(titulo, descripcion, categoria, nivel, instructor_id)
      VALUES($titulo, $descripcion, $categoria, $nivel, $instructorId) RETURNING id
    ) SELECT id FROM creado`,
    {
      titulo: definition.titulo,
      descripcion: definition.descripcion,
      categoria: definition.categoria,
      nivel: definition.nivel,
      instructorId,
    },
    transaction,
  );
  const lessons: SeedCourse['lessons'] = [];
  for (const [index, [titulo, contenido]] of definition.lessons.entries()) {
    const tipo = contenido === null ? 'cuestionario' : 'contenido';
    const [lesson] = await db.select<{ id: number; tipo: string }>(
      `WITH creada AS (
        INSERT INTO lecciones(curso_id,titulo,tipo,contenido,orden,nota_minima)
        VALUES($courseId,$titulo,$tipo,$contenido,$orden,$notaMinima) RETURNING id,tipo
      ) SELECT * FROM creada`,
      {
        courseId: course.id,
        titulo,
        tipo,
        contenido,
        orden: index + 1,
        notaMinima: tipo === 'cuestionario' ? 70 : null,
      },
      transaction,
    );
    lessons.push(lesson);
    if (tipo === 'cuestionario') {
      for (const question of definition.questions) {
        await db.execute(
          'INSERT INTO preguntas(leccion_id,enunciado,opciones,indice_correcto) VALUES($lessonId,$enunciado,$opciones,$correcta)',
          { lessonId: lesson.id, ...question },
          transaction,
        );
      }
    }
  }
  await db.execute(
    "UPDATE cursos SET estado='publicado' WHERE id=$id",
    { id: course.id },
    transaction,
  );
  return { id: course.id, estado: 'publicado', lessons };
}

async function seed() {
  try {
    const passwordHash = await hash(testPassword, 12);
    await db.transaction(async (transaction) => {
      // Serialize retries without adding constraints to normal course titles.
      await db.execute(
        'SELECT pg_advisory_xact_lock(72411024)',
        {},
        transaction,
      );
      const users: number[] = [];
      for (const account of accounts) {
        await db.execute(
          `INSERT INTO usuarios(nombre,email,password_hash,rol)
           VALUES($nombre,$email,$passwordHash,$rol)
           ON CONFLICT (lower(email)) DO NOTHING`,
          { ...account, passwordHash },
          transaction,
        );
        const [user] = await db.select<{ id: number; rol: string }>(
          'SELECT id,rol FROM usuarios WHERE lower(email)=lower($email)',
          { email: account.email },
          transaction,
        );
        if (user.rol !== account.rol)
          throw new Error(
            'Una cuenta de prueba ya existe con otro rol: ' + account.email,
          );
        users.push(user.id);
      }
      const createdCourses: SeedCourse[] = [];
      for (const definition of courses) {
        createdCourses.push(
          await seedCourse(
            definition,
            users[definition.instructor],
            transaction,
          ),
        );
      }
      const completedPrefixes = [
        [3, 0, 5],
        [1, 2, 0],
        [0, 0, 1],
      ];
      for (const [studentIndex, studentId] of users.slice(2).entries()) {
        for (const [courseIndex, course] of createdCourses.entries()) {
          if (course.estado !== 'publicado') continue;
          const [enrollment] = await db.select<{ id: number }>(
            `WITH creada AS (
              INSERT INTO inscripciones(estudiante_id,curso_id) VALUES($studentId,$courseId)
              ON CONFLICT(estudiante_id,curso_id) DO NOTHING RETURNING id
            ) SELECT id FROM creada`,
            { studentId, courseId: course.id },
            transaction,
          );
          // Existing enrollments and progress belong to the user and are preserved.
          if (!enrollment) continue;
          const completedCount = completedPrefixes[studentIndex][courseIndex];
          for (const [index, lesson] of course.lessons.entries()) {
            const completed = index < completedCount;
            const attempted = lesson.tipo === 'cuestionario' && completed;
            await db.execute(
              `INSERT INTO progreso(curso_id,inscripcion_id,leccion_id,completada,intentos,mejor_nota)
               VALUES($courseId,$enrollmentId,$lessonId,$completed,$attempts,$grade)`,
              {
                courseId: course.id,
                enrollmentId: enrollment.id,
                lessonId: lesson.id,
                completed,
                attempts: attempted ? 1 : 0,
                grade: attempted ? 100 : null,
              },
              transaction,
            );
          }
          await db.execute(
            'UPDATE inscripciones SET completado=$completed WHERE id=$id',
            {
              id: enrollment.id,
              completed:
                course.lessons.length > 0 &&
                completedCount >= course.lessons.length,
            },
            transaction,
          );
        }
      }
    });
    console.log(
      'Seed aplicado: 2 instructores, 3 estudiantes y 3 cursos publicados de 5 lecciones.',
    );
    console.log(
      'Las cuentas, cursos e inscripciones existentes se conservaron.',
    );
  } finally {
    await sequelize.close();
  }
}

void seed().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'No se pudo cargar el seed.',
  );
  process.exitCode = 1;
});
