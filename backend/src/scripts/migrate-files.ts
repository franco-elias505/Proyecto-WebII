import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sequelize } from '../config/db.config';

async function migrate() {
  try {
    const sql = await readFile(
      resolve(
        __dirname,
        '../../../database/migrations/002_archivos_lecciones.sql',
      ),
      'utf8',
    );
    await sequelize.transaction(async (transaction) => {
      for (const statement of sql.split(';').map((s) => s.trim())) {
        if (statement && statement !== 'BEGIN' && statement !== 'COMMIT') {
          await sequelize.query(statement, { transaction });
        }
      }
    });
    console.log('Migración de archivos de lecciones aplicada.');
  } finally {
    await sequelize.close();
  }
}
void migrate().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Error de migración');
  process.exitCode = 1;
});
