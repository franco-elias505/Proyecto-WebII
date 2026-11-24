const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { mkdtemp, rm, readdir } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');

async function main() {
  const directory = await mkdtemp(path.join(tmpdir(), 'miniaula-uploads-'));
  process.env.UPLOAD_DIR = directory;
  const { sequelize } = require('../dist/config/db.config');
  const { AppModule } = require('../dist/app.module');
  const { NestFactory } = require('@nestjs/core');
  const { JwtService } = require('@nestjs/jwt');
  const { hash } = require('bcryptjs');
  const users = [];
  const courses = [];
  let app;
  try {
    await sequelize.authenticate();
    app = await NestFactory.create(AppModule, {
      logger: false,
      abortOnError: false,
    });
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const jwt = app.get(JwtService);
    const marker = randomUUID();
    const passwordHash = await hash(randomUUID(), 12);
    async function user(rol) {
      const [rows] = await sequelize.query(
        "INSERT INTO usuarios(nombre,email,password_hash,rol) VALUES ('Test',$email,$passwordHash,$rol) RETURNING id",
        {
          bind: {
            email: marker + users.length + '@example.test',
            passwordHash,
            rol,
          },
        },
      );
      const id = rows[0].id;
      users.push(id);
      return { id, token: await jwt.signAsync({ sub: id, rol }) };
    }
    async function raw(method, path, actor, body) {
      const headers = {};
      if (actor) headers.authorization = 'Bearer ' + actor.token;
      const multipart = body instanceof FormData;
      if (body !== undefined && !multipart)
        headers['content-type'] = 'application/json';
      return fetch(base + '/api' + path, {
        method,
        headers,
        body: multipart
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body),
      });
    }
    async function call(method, path, actor, body, status = 200) {
      const response = await raw(method, path, actor, body);
      const text = await response.text();
      assert.equal(response.status, status, method + ' ' + path + ' ' + text);
      return text ? JSON.parse(text) : null;
    }
    const owner = await user('instructor');
    const other = await user('instructor');
    const student = await user('estudiante');
    const outsider = await user('estudiante');
    const body = {
      titulo: marker,
      descripcion: 'Curso de prueba',
      categoria: marker,
      nivel: 'Inicial',
    };
    const course = await call('POST', '/cursos', owner, body, 201);
    courses.push(course.id);
    const coursePath = '/cursos/' + course.id;
    assert.equal(course.estado, 'borrador');
    await call('POST', '/cursos', student, body, 403);
    await call('POST', '/cursos', null, body, 401);
    await call('PUT', coursePath, other, body, 403);
    await call('PUT', coursePath, owner, body);
    await call(
      'PATCH',
      coursePath + '/estado',
      owner,
      { estado: 'publicado' },
      409,
    );
    await call('GET', coursePath, null, undefined, 404);
    await call('GET', '/cursos?page=-1', null, undefined, 400);
    const first = await call(
      'POST',
      coursePath + '/lecciones',
      owner,
      {
        titulo: 'Contenido',
        tipo: 'contenido',
        contenido: 'Texto privado',
      },
      201,
    );
    const quiz = await call(
      'POST',
      coursePath + '/lecciones',
      owner,
      {
        titulo: 'Cuestionario',
        tipo: 'cuestionario',
        notaMinima: 60,
      },
      201,
    );
    const last = await call(
      'POST',
      coursePath + '/lecciones',
      owner,
      {
        titulo: 'Final',
        tipo: 'contenido',
        videoUrl: 'https://example.com/video',
      },
      201,
    );
    const lessonPath = '/lecciones/' + last.id;
    await call(
      'PUT',
      lessonPath,
      other,
      { titulo: 'Final', tipo: 'contenido', contenido: 'Otro' },
      403,
    );
    await call(
      'POST',
      coursePath + '/lecciones',
      owner,
      { titulo: 'Invalida', tipo: 'contenido' },
      400,
    );
    await call(
      'PATCH',
      coursePath + '/lecciones/orden',
      owner,
      { lecciones: [first.id, first.id, last.id] },
      400,
    );
    await call('PATCH', coursePath + '/lecciones/orden', owner, {
      lecciones: [last.id, first.id, quiz.id],
    });
    await call('PATCH', coursePath + '/lecciones/orden', owner, {
      lecciones: [first.id, quiz.id, last.id],
    });

    function upload(data, type = 'application/pdf', filename = 'apoyo.pdf') {
      const form = new FormData();
      form.set('archivo', new Blob([data], { type }), filename);
      return form;
    }
    const pdf = '%PDF-1.4\nmaterial de prueba\n%%EOF';
    await call('POST', lessonPath + '/archivos', other, upload(pdf), 403);
    await call(
      'POST',
      lessonPath + '/archivos',
      owner,
      upload('<script>alert(1)</script>'),
      400,
    );
    await call(
      'POST',
      lessonPath + '/archivos',
      owner,
      upload(Buffer.alloc(0)),
      400,
    );
    await call(
      'POST',
      lessonPath + '/archivos',
      owner,
      upload(Buffer.alloc(25 * 1024 * 1024 + 1)),
      413,
    );
    const files = await call(
      'POST',
      lessonPath + '/archivos',
      owner,
      upload(pdf),
      201,
    );
    const filePath = lessonPath + '/archivos/' + files[0].id;
    assert.equal(await (await raw('GET', filePath, owner)).text(), pdf);
    await call('GET', filePath, null, undefined, 401);
    await call('GET', filePath, other, undefined, 403);
    await call('PATCH', coursePath + '/estado', owner, { estado: 'publicado' });
    const catalog = await call(
      'GET',
      '/cursos?categoria=' + marker + '&q=' + marker + '&limit=1',
      null,
    );
    assert.equal(catalog.total, 1);
    assert.equal(catalog.data[0].id, course.id);
    assert.equal(catalog.data[0].instructor_nombre, 'Test');
    assert.equal(catalog.data[0].total_lecciones, 3);
    assert.equal(catalog.data[0].total_inscritos, 0);
    const categories = await call('GET', '/cursos/categorias', null);
    assert.ok(categories.includes(marker));
    const detail = await call('GET', coursePath, null);
    assert.ok(
      detail.lecciones.every((l) => !('contenido' in l) && !('archivos' in l)),
    );
    await call('GET', lessonPath, student, undefined, 403);
    await sequelize.query(
      'INSERT INTO inscripciones(estudiante_id,curso_id) VALUES($studentId,$courseId)',
      { bind: { studentId: student.id, courseId: course.id } },
    );
    await call('GET', '/lecciones/' + first.id, student);
    await call('GET', lessonPath, student, undefined, 403);
    await call('GET', filePath, student, undefined, 403);
    await call('GET', '/lecciones/' + first.id, outsider, undefined, 403);
    let status = await call('GET', coursePath + '/lecciones', student);
    assert.equal(status[0].bloqueada, false);
    assert.equal(status[1].bloqueada, true);
    assert.ok(status.every((l) => !('contenido' in l)));
    await sequelize.query(
      `INSERT INTO progreso(curso_id,inscripcion_id,leccion_id,completada)
       SELECT $courseId,id,$lessonId,true FROM inscripciones WHERE estudiante_id=$studentId AND curso_id=$courseId`,
      {
        bind: {
          courseId: course.id,
          lessonId: first.id,
          studentId: student.id,
        },
      },
    );
    await call('GET', '/lecciones/' + quiz.id, student);
    await sequelize.query(
      `INSERT INTO progreso(curso_id,inscripcion_id,leccion_id,completada,intentos,mejor_nota)
       SELECT $courseId,id,$lessonId,true,1,20 FROM inscripciones WHERE estudiante_id=$studentId AND curso_id=$courseId`,
      {
        bind: { courseId: course.id, lessonId: quiz.id, studentId: student.id },
      },
    );
    // A completion flag alone must not bypass a failed quiz.
    await call('GET', lessonPath, student, undefined, 403);
    await call('GET', filePath, student, undefined, 403);
    await sequelize.query(
      'UPDATE progreso SET mejor_nota=100 WHERE leccion_id=$id',
      { bind: { id: quiz.id } },
    );
    assert.equal((await call('GET', lessonPath, student)).contenido, null);
    const download = await raw('GET', filePath, student);
    assert.equal(download.status, 200);
    assert.equal(download.headers.get('cache-control'), 'private, no-store');
    assert.equal(await download.text(), pdf);
    await call('DELETE', coursePath, owner, undefined, 409);
    await call('GET', '/instructor/cursos/' + course.id, other, undefined, 403);
    await call('GET', '/instructor/cursos', student, undefined, 403);
    const editor = await call('GET', '/instructor/cursos/' + course.id, owner);
    assert.equal(editor.lecciones.length, 3);
    await call('DELETE', filePath, other, undefined, 403);
    await call('DELETE', filePath, owner, undefined, 204);
    await call('GET', filePath, owner, undefined, 404);
    assert.equal(
      (await readdir(path.join(directory, String(last.id)))).length,
      0,
    );
    await call('POST', lessonPath + '/archivos', owner, upload(pdf), 201);
    await call('DELETE', lessonPath, owner, undefined, 204);
    await assert.rejects(readdir(path.join(directory, String(last.id))));
    await call('PATCH', coursePath + '/estado', owner, { estado: 'archivado' });
    await call('GET', coursePath, null, undefined, 404);
    await call('GET', '/lecciones/' + first.id, student);
    for (const path of [
      '/users/me',
      '/inscripciones/mias',
      '/instructor/cursos/' + course.id + '/resumen',
    ]) {
      await call('GET', path, owner, undefined, 404);
    }
    console.log(
      'RF-04 a RF-10 y RN-01/02/05/06/07/08 verificadas, incluidos uploads y descargas protegidas.',
    );
  } finally {
    try {
      if (app) await app.close();
    } finally {
      try {
        if (users.length || courses.length)
          await sequelize.transaction(async (transaction) => {
            if (courses.length) {
              await sequelize.query(
                'DELETE FROM inscripciones WHERE curso_id=ANY($ids::integer[])',
                { bind: { ids: courses }, transaction },
              );
              await sequelize.query(
                'DELETE FROM cursos WHERE id=ANY($ids::integer[])',
                { bind: { ids: courses }, transaction },
              );
            }
            if (users.length)
              await sequelize.query(
                'DELETE FROM usuarios WHERE id=ANY($ids::integer[])',
                { bind: { ids: users }, transaction },
              );
          });
      } finally {
        await sequelize.close();
        await rm(directory, { recursive: true, force: true });
      }
    }
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
