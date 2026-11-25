// El informe de equilibrio (EQUILIBRIO.md): lo escribe `npm run equilibrio` con el simulador.
// Una fila por jefe y por inicial, como pide la skill `rpg`: niveles, dinero y probabilidad de ganar.

import { ISLAS } from '../../src/data/islas';
import { INICIALES, PERFILES, golpesContra, probabilidadDeGanar, probabilidadPrimerCombate, progresion, type Hito } from './simulador';

const pct = (x: number) => `${Math.round(x * 100)} %`;
const NOMBRE_JEFE: Record<string, string> = {
  'entrenador-barrera': 'Primer entrenador (El Golfo)',
  'lider-gimnasio': 'Líder de Roca (Lanzarote)',
  'lider-aire': 'Líder de Aire (Fuerteventura)',
  'aprendiz-electrico-3': '3.er aprendiz Eléctrico (llegada a Gran Canaria)',
  'comandante-nublo': 'Comandante (Roque Nublo)',
  'lider-lucha': 'Los dos líderes, 2 contra 2 (Agaete)',
};

export function informe(fecha: string): string {
  const l: string[] = [];
  l.push('# Equilibrio de Six-seven islands', '');
  l.push(`Generado el ${fecha} con \`npm run equilibrio\` (\`herramientas/simular/\`). No se edita a mano.`, '');
  l.push('**Cómo se calcula** (supuestos, para leer los números con cuidado):', '');
  l.push('- **Experiencia y dinero:** los de cada salvaje y entrenador del recorrido (`herramientas/simular/ruta.ts`), con las fórmulas del núcleo.');
  l.push('- **Salvajes:** las casillas de encuentros del camino más corto por la probabilidad por paso, más las buscadas: 0 en «directo» y 3 por zona con hierba en «normal» y «completo».');
  l.push('- **Perfiles:** «directo» solo lucha lo forzoso; «normal» vence a todos los entrenadores del camino; «completo» hace también las zonas opcionales.');
  l.push('- **Equipo:** la inicial y dos compañeras capturables en Lanzarote. La inicial se lleva la mitad de la experiencia y cada compañera una cuarta parte. Todas, en la forma de su nivel.');
  l.push('- **Combates:** el simulador ataca siempre con lo que más daño hace y usa 3 pociones (superpociones en Gran Canaria) por debajo del 30 % de vida. Nunca cambia de criatura, así que **la probabilidad es algo pesimista**. 100 combates por casilla.', '');

  l.push('## El primer combate', '');
  l.push('La inicial sola a nivel 5, que aún desobedece (hasta el anciano), con 2 pociones; 300 combates.', '');
  l.push('| Inicial | Gana |', '| --- | --- |');
  for (const ini of INICIALES) l.push(`| ${ini} | ${pct(probabilidadPrimerCombate(ini))} |`);
  l.push('');

  l.push('## Con qué nivel llegas a cada jefe (perfil «normal»)', '');
  l.push('Niveles: la inicial / cada compañera; entre paréntesis, si toda la experiencia fuera a una sola criatura. «Con la inicial por delante»: la inicial a ese nivel entre paréntesis y las compañeras igual.', '');
  for (const ini of INICIALES) {
    l.push(`### Inicial de ${ini}`, '');
    l.push('| Jefe | Su nivel | Tus niveles | Salvajes | Entrenadores | Dinero | Ganas a la primera | Con la inicial por delante |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const h of progresion('normal', ini)) {
      // El primer combate es la inicial sola (aún no hay más criaturas); los demás, el equipo de tres.
      if (h.jefe === 'entrenador-barrera') {
        l.push(`| ${NOMBRE_JEFE[h.jefe]} | ${h.nivelesRival.join('/')} | 5, sola | 0 | 0 | 0 | ${pct(probabilidadPrimerCombate(ini))} | — |`);
        continue;
      }
      const normal = probabilidadDeGanar(h.isla, h.jefe, ini, h.nivelInicial, h.nivelCompanera);
      const delante = probabilidadDeGanar(h.isla, h.jefe, ini, h.nivelSola, h.nivelCompanera);
      l.push(`| ${NOMBRE_JEFE[h.jefe] ?? h.jefe} | ${h.nivelesRival.join('/')} | ${h.nivelInicial} / ${h.nivelCompanera} (${h.nivelSola}) | ${h.salvajes} | ${h.entrenadores} | ${h.dinero} | ${pct(normal)} | ${pct(delante)} |`);
    }
    l.push('');
  }

  l.push('## Golpes contra cada jefe (skill `rpg`)', '');
  l.push('Tu inicial al nivel con que llegas (perfil «normal») contra cada criatura del jefe: cuántos golpes de tu mejor ataque la tumban y cuántos suyos te tumban a ti. Entre paréntesis, la suma de sus estadísticas base (lo fuerte que es la especie). Objetivo orientativo de la skill: el rival cae en 2 a 4 golpes y tú aguantas de 5 a 8; un jefe, algo más.', '');
  for (const ini of INICIALES) {
    l.push(`### Inicial de ${ini}`, '');
    l.push('| Jefe | Tu inicial | Sus criaturas: tus golpes · los suyos |', '| --- | --- | --- |');
    for (const h of progresion('normal', ini)) {
      if (h.jefe === 'entrenador-barrera') continue;
      const g = golpesContra(h.isla, h.jefe, ini, h.nivelInicial);
      l.push(`| ${NOMBRE_JEFE[h.jefe] ?? h.jefe} | ${g.tuya.nombre} ${h.nivelInicial} (${g.tuya.sumaBase}) | ${g.filas.map((f) => `${f.rival} ${f.nivel} (${f.sumaBase}): ${f.tuyos} · ${f.suyos}`).join('; ')} |`);
    }
    l.push('');
  }

  l.push('## Los tres perfiles (inicial de agua)', '');
  l.push('Nivel de la inicial al llegar a cada jefe; entre paréntesis, si toda la experiencia fuera a ella.', '');
  const porPerfil = PERFILES.map((p) => progresion(p, 'agua'));
  l.push(`| Jefe | ${PERFILES.join(' | ')} |`, `| --- | ${PERFILES.map(() => '---').join(' | ')} |`);
  porPerfil[0]!.forEach((h: Hito, i: number) => {
    l.push(`| ${NOMBRE_JEFE[h.jefe] ?? h.jefe} | ${porPerfil.map((x) => `${x[i]!.nivelInicial} (${x[i]!.nivelSola})`).join(' | ')} |`);
  });
  l.push('');
  l.push('## El dinero que hay en cada isla', '');
  l.push('| Isla | Lo que pagan todos sus entrenadores |', '| --- | --- |');
  for (const n of [1, 2, 3]) {
    const total = Object.values(ISLAS[n]!.entrenadores).reduce((s, e) => s + e.premio, 0);
    l.push(`| ${ISLAS[n]!.nombre} | ${total} |`);
  }
  l.push('');
  return l.join('\n');
}
