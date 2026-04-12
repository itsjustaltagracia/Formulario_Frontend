import { jsPDF } from "jspdf";
import logoIzq from "../../../assets/logo-salesianos.png";
import logoDer from "../../../assets/logo-salesiano.png";

// ─── Utilidades ────────────────────────────────────────────────────────────────
const hasValue = (v) => v !== undefined && v !== null && String(v).trim() !== '';
const pick = (data, keys) => {
  for (const key of keys) { if (hasValue(data[key])) return String(data[key]); }
  return '';
};

function buildObraFlags(data) {
  const v = pick(data, ['vinculacion']).toLowerCase();
  return {
    Exalumno:         v === 'exalumno',
    Oratorio:         v === 'oratorio',
    'Centro Juvenil': v === 'centro',
    Cooperador:       v === 'cooperador',
    Traslado:         v === 'traslado',
  };
}

function buildNivelLabel(nivel, duracion, tipo) {
  if (!nivel) return '';
  const map = {
    primaria: 'Educación primaria', bachillerato: 'Bachillerato', 'Técnico': 'Técnico',
    universitario: 'Universitario', licenciatura: 'Licenciatura', maestria: 'Maestría',
    ingenieria: 'Ingeniería', doctorado: 'Doctorado', otros: 'Otros', ninguno: 'Ninguno/No aplica',
  };
  let l = map[nivel] || nivel;
  if (tipo)     l += ` en ${tipo}`;
  if (duracion) l += ` (${duracion} años)`;
  return l;
}

// ─── Formatear teléfonos para impresión ───────────────────────────────────────
function buildTelefonosLabel(data) {
  // Nuevo formato: array de {dueno, numero}
  if (Array.isArray(data.telefonos) && data.telefonos.length > 0) {
    return data.telefonos
      .filter(t => t.numero && String(t.numero).trim() !== '')
      .map(t => t.dueno ? `${t.dueno}: ${t.numero}` : t.numero)
      .join('   |   ');
  }
  // Compatibilidad hacia atrás: campo único
  const num = pick(data, ['telefono']);
  const due = pick(data, ['telefono_dueno']);
  if (!num) return '';
  return due ? `${due}: ${num}` : num;
}

function getInfo(data = {}) {
  const items = Array.isArray(data.entrevistados) ? data.entrevistados : [];
  const mapaP = { madre: 'Madre', padre: 'Padre', madrastra: 'Madrastra', padrastro: 'Padrastro', tutor: 'Tutor Legal' };

  const entrevistado = items.length > 0
    ? items.map(function(e) { return e.nombre || ''; }).filter(Boolean).join(' / ')
    : pick(data, ['entrevistado']);

  const parentesco = items.length > 0
    ? items.map(function(e) {
        const pRaw = e.parentesco || '';
        return pRaw === 'otro' ? (e.parentesco_otro || 'Otro') : (mapaP[pRaw] || pRaw);
      }).filter(Boolean).join(' / ')
    : (function() {
        const pRaw = pick(data, ['parentesco']);
        return pRaw === 'otro' ? pick(data, ['parentesco_otro']) : (mapaP[pRaw] || pRaw);
      })();

  const ayudaPsic = pick(data, ['ayuda_psic']);
  const agresion  = pick(data, ['agresion_ocurrida']);
  const alfab     = pick(data, ['alfabetizacion']);

  const yesDetail = (flag, detailKey) =>
    flag === 'Si'
      ? 'Sí' + (pick(data, [detailKey]) ? ' – ' + pick(data, [detailKey]) : '')
      : flag === 'No' ? 'No' : '';

  return {
    fecha:         pick(data, ['fecha']),
    formulario:    pick(data, ['formulario']),
    seccion:       pick(data, ['seccion']),
    nombre:        pick(data, ['nombres', 'nombre']),
    apellido:      pick(data, ['apellidos', 'apellido']),
    sexo:          pick(data, ['sexo']),
    edad:          pick(data, ['edad']),
    entrevistado,
    parentesco,
    nivelMadre:    buildNivelLabel(pick(data, ['nivel_madre']), pick(data, ['duracion_madre']), pick(data, ['tipo_madre'])),
    nivelPadre:    buildNivelLabel(pick(data, ['nivel_padre']), pick(data, ['duracion_padre']), pick(data, ['tipo_padre'])),
    nivelTutor:    buildNivelLabel(pick(data, ['nivel_tutor']), pick(data, ['duracion_tutor']), pick(data, ['tipo_tutor'])),
    estadoCivil:   pick(data, ['estado_civil']),
    obraFlags:     buildObraFlags(data),
    entrevistador: pick(data, ['entrevistador']),
    observaciones: pick(data, ['observaciones']),
    telefonos:     buildTelefonosLabel(data),
    q1:  pick(data, ['conducta']),
    q2:  pick(data, ['inconvenientes']),
    q3:  yesDetail(ayudaPsic, 'ayuda_psic_detalle'),
    q4:  pick(data, ['zona_vivienda']),
    q5:  pick(data, ['habitos']),
    q6:  pick(data, ['actividades_familia']),
    q7:  pick(data, ['tiempo_juntos']),
    q8:  pick(data, ['expectativas_centro']),
    q9:  yesDetail(agresion, 'agresiones'),
    q10: pick(data, ['convivencia']),
    q11: pick(data, ['motivos']),
    q12: pick(data, ['dificultades']),
    q13: pick(data, ['estudiante_descr']),
    q14: pick(data, ['repetido']),
    q15: yesDetail(alfab, 'alfabetizacion_detalle'),
    q16: pick(data, ['motivacion']),
    q17: pick(data, ['ingreso_real']),
    q18: pick(data, ['aporte_mensual']),
  };
}

// ─── Constantes de layout (mm) ────────────────────────────────────────────────
const PW = 215.9;
const PH = 279.4;
const ML = 14, MR = 14, MT = 12, MB = 10;
const CW = PW - ML - MR;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncate(doc, text, maxW) {
  if (!text) return '';
  const s = String(text);
  if (doc.getTextWidth(s) <= maxW) return s;
  let t = s;
  while (t.length > 0 && doc.getTextWidth(t + '…') > maxW) t = t.slice(0, -1);
  return t + '…';
}

function cellText(doc, text, x, y, w, h, opts = {}) {
  const pad   = opts.pad   ?? 2;
  const align = opts.align ?? 'left';
  const cy    = y + h / 2;
  const maxW  = w - pad * 2;
  const tx    = align === 'center' ? x + w / 2 : x + pad;
  doc.text(truncate(doc, String(text ?? ''), maxW), tx, cy, { baseline: 'middle', align });
}

function drawRect(doc, x, y, w, h, fillGray) {
  if (fillGray) { doc.setFillColor(235, 235, 235); doc.rect(x, y, w, h, 'FD'); }
  else           doc.rect(x, y, w, h, 'S');
}

async function loadImageAsDataUrl(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => {
      console.warn('[PDF] No se pudo cargar el logo:', src);
      resolve(null);
    };
    img.src = src;
  });
}

// ─── Bloque de preguntas ──────────────────────────────────────────────────────
function drawQuestions(doc, preguntas, x, startY, w, blockH) {
  let y = startY;
  preguntas.forEach(([num, pregunta, respuesta]) => {
    const prefix = num ? `${num}. ` : '';

    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text(truncate(doc, prefix + pregunta, w), x, y + blockH * 0.38, { baseline: 'middle' });

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    if (respuesta) doc.text(truncate(doc, String(respuesta), w - 1), x + 1, y + blockH * 0.78, { baseline: 'middle' });

    doc.setLineWidth(0.25);
    doc.line(x, y + blockH - 0.5, x + w, y + blockH - 0.5);
    doc.setLineWidth(0.3);

    y += blockH;
  });
}

// ─── Página 1 ─────────────────────────────────────────────────────────────────
function drawPage1(doc, info, logoSal, logoIpi) {
  let y = MT;
  doc.setLineWidth(0.3);

  const logoH = 16, logoW = 16;
  if (logoSal) doc.addImage(logoSal, 'PNG', ML, y, logoW, logoH);
  if (logoIpi) doc.addImage(logoIpi, 'PNG', PW - MR - logoW, y, logoW, logoH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PLANTILLA PARA ENTREVISTA FAMILIAR', PW / 2, y + logoH / 2, { align: 'center', baseline: 'middle' });
  y += logoH + 5;

  doc.setFontSize(9);
  const metaW = CW / 3;
  [['Fecha de entrevista:', info.fecha], ['Formulario:', info.formulario], ['Sección:', info.seccion]]
    .forEach(([label, val], i) => {
      const mx = ML + i * metaW;
      doc.setFont('helvetica', 'bold');
      doc.text(label, mx, y + 3);
      const labelW = doc.getTextWidth(label);
      doc.setFont('helvetica', 'normal');
      doc.text(String(val ?? ''), mx + labelW + 2, y + 3);
      doc.line(mx + labelW + 1, y + 3.6, mx + metaW - 1, y + 3.6);
    });
  y += 8;

  const rH = 6;

  // Datos personales header
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  drawRect(doc, ML, y, CW, rH, true);
  doc.text('DATOS PERSONALES DEL ESTUDIANTE', PW / 2, y + rH / 2, { align: 'center', baseline: 'middle' });
  y += rH;

  // Encabezados columnas
  const cNombre = CW * 0.33, cApellido = CW * 0.33, cSexo = CW * 0.17, cEdad = CW * 0.17;
  doc.setFontSize(8);
  let xi = ML;
  for (const [lbl, w] of [['NOMBRE (S)', cNombre], ['APELLIDO (S)', cApellido], ['SEXO', cSexo], ['EDAD', cEdad]]) {
    drawRect(doc, xi, y, w, rH); cellText(doc, lbl, xi, y, w, rH, { align: 'center' }); xi += w;
  }
  y += rH;

  // Valores
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  xi = ML;
  for (const [val, w] of [[info.nombre, cNombre], [info.apellido, cApellido], [info.sexo, cSexo], [info.edad, cEdad]]) {
    drawRect(doc, xi, y, w, rH); cellText(doc, val, xi, y, w, rH, { align: w < 30 ? 'center' : 'left' }); xi += w;
  }
  y += rH;

  // Entrevistado / Parentesco
  const cEnt = CW * 0.65, cPar = CW * 0.35;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  drawRect(doc, ML, y, cEnt, rH); cellText(doc, 'ENTREVISTADO (S)', ML, y, cEnt, rH, { align: 'center' });
  drawRect(doc, ML + cEnt, y, cPar, rH); cellText(doc, 'PARENTESCO', ML + cEnt, y, cPar, rH, { align: 'center' });
  y += rH;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  drawRect(doc, ML, y, cEnt, rH); cellText(doc, info.entrevistado, ML, y, cEnt, rH);
  drawRect(doc, ML + cEnt, y, cPar, rH); cellText(doc, info.parentesco, ML + cEnt, y, cPar, rH);
  y += rH;

  // Obra salesiana
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  drawRect(doc, ML, y, CW, rH, true);
  doc.text('Indicar si proviene de alguna obra salesiana', PW / 2, y + rH / 2, { align: 'center', baseline: 'middle' });
  y += rH;
  const obras = ['Exalumno', 'Oratorio', 'Centro Juvenil', 'Cooperador', 'Traslado'];
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
  drawRect(doc, ML, y, CW, rH);
  const obraW = CW / obras.length;
  obras.forEach((nombre, i) => {
    const bx = ML + i * obraW + 2, by = y + rH / 2 - 1.75;
    doc.rect(bx, by, 3.5, 3.5);
    if (info.obraFlags[nombre]) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', bx + 1.75, by + 1.75, { align: 'center', baseline: 'middle' });
      doc.setFont('helvetica', 'normal');
    }
    doc.text(nombre, bx + 5, y + rH / 2, { baseline: 'middle' });
  });
  y += rH;

  // Nivel académico
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  drawRect(doc, ML, y, CW, rH, true);
  doc.text('NIVEL DE PREPARACIÓN PADRE, MADRE O TUTOR', PW / 2, y + rH / 2, { align: 'center', baseline: 'middle' });
  y += rH;
  const lw = CW * 0.13, vw = CW * 0.34, lw2 = CW * 0.16, vw2 = CW * 0.37;
  doc.setFontSize(8);
  for (const [l1, v1, l2, v2] of [
    ['MADRE:', info.nivelMadre, 'TUTOR:',          info.nivelTutor],
    ['PADRE:', info.nivelPadre, 'LOS PADRES SON:', info.estadoCivil],
  ]) {
    doc.setFont('helvetica', 'bold');
    drawRect(doc, ML, y, lw, rH);             cellText(doc, l1, ML, y, lw, rH, { align: 'center', pad: 1 });
    drawRect(doc, ML + lw, y, vw, rH);
    doc.setFont('helvetica', 'normal');        cellText(doc, v1, ML + lw, y, vw, rH);
    doc.setFont('helvetica', 'bold');
    drawRect(doc, ML + lw + vw, y, lw2, rH);  cellText(doc, l2, ML + lw + vw, y, lw2, rH, { align: 'center', pad: 1 });
    drawRect(doc, ML + lw + vw + lw2, y, vw2, rH);
    doc.setFont('helvetica', 'normal');        cellText(doc, v2, ML + lw + vw + lw2, y, vw2, rH);
    y += rH;
  }
  y += 2;

  // Preguntas 1–9
  const preguntas1 = [
    ['1', '¿Cómo describe la conducta escolar del estudiante?', info.q1],
    ['2', '¿Ha tenido el estudiante algún inconveniente en el colegio? ¿Cómo usted lo ayudó?', info.q2],
    ['3', '¿Ha recibido el estudiante algún tipo de ayuda psicológica?', info.q3],
    ['4', '¿En qué zona viven de la ciudad? ¿Desde cuándo?', info.q4],
    ['5', '¿Cuáles hábitos de estudios tiene el niño?', info.q5],
    ['6', '¿Cuáles actividades realizan como familia?', info.q6],
    ['7', '¿Cuánto tiempo están juntos en la casa?', info.q7],
    ['8', '¿Qué espera usted de este Centro?', info.q8],
    ['9', '¿Ha agredido el estudiante a algún compañero? ¿Lo han agredido?', info.q9],
  ];
  const qSpace = PH - MB - 6 - y;
  drawQuestions(doc, preguntas1, ML, y, CW, qSpace / preguntas1.length);

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
  doc.text('Código: P-AD-01-F-04 | Rev. 03', PW / 2, PH - MB, { align: 'center', baseline: 'bottom' });
}

// ─── Página 2 ─────────────────────────────────────────────────────────────────
function drawPage2(doc, info) {
  doc.setLineWidth(0.3);

  const preguntas2 = [
    ['10', '¿Con quién vive el estudiante? En caso de no ser con su/s padre/s, ¿Por qué?', info.q10],
    ['11', '¿Por qué su familia quiere pertenecer a esta institución?', info.q11],
    ['12', 'En caso de que el estudiante venga de otra institución, ¿se presentó alguna dificultad? ¿Cómo entiende que podemos ayudar?', info.q12],
    ['13', 'Al estudiante: Háblanos un poco de tu familia, ¿Qué tiempo le dedicas al estudio?, ¿En cuál/es asignatura/s consideras que te destacas?', info.q13],
    ['14', 'Si el estudiante está sobreedad, ¿ha repetido algún curso? Si la respuesta es afirmativa ¿Por qué?', info.q14],
    ['15', '¿El niño o niña, ha presentado problemas para alfabetizarse?', info.q15],
    ['16', '¿Deseas estudiar en esta escuela? ¿Qué ha escuchado de este centro? ¿Qué te motiva a estar acá?', info.q16],
    ['17', '¿Cuál es el ingreso real de la familia?', info.q17],
    ['18', '¿Cuál es el aporte mensual con el que ustedes como familia podrían colaborar con la institución?', info.q18],
    ['',   'Teléfono padre, madre o tutor:', info.telefonos],
    ['',   'OBSERVACIONES:', info.observaciones],
  ];

  const sigsH  = 22;
  const footerH = 6;
  const qSpace  = PH - MT - MB - sigsH - footerH;
  drawQuestions(doc, preguntas2, ML, MT, CW, qSpace / preguntas2.length);

  let y = MT + qSpace + 2;
  doc.setFontSize(9);
  for (const [label, val] of [['Entrevista realizada por:', info.entrevistador], ['Firma padres:', '']]) {
    doc.setFont('helvetica', 'bold');
    doc.text(label, ML, y + 4);
    const labelW = doc.getTextWidth(label);
    doc.setFont('helvetica', 'normal');
    const lx = ML + labelW + 3;
    if (val) doc.text(truncate(doc, String(val), ML + CW - lx - 1), lx, y + 4);
    doc.line(lx - 1, y + 4.5, ML + CW, y + 4.5);
    y += 10;
  }

  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
  doc.text('Código: P-AD-01-F-04 | Rev. 03', PW / 2, PH - MB, { align: 'center', baseline: 'bottom' });
}

// ─── Constructor interno ──────────────────────────────────────────────────────
async function buildPdf(data) {
  const info = getInfo(data);
  const doc  = new jsPDF({ unit: 'mm', format: 'letter', orientation: 'portrait' });

  const [imgIzq, imgDer] = await Promise.all([
    loadImageAsDataUrl(logoIzq),
    loadImageAsDataUrl(logoDer),
  ]);

  drawPage1(doc, info, imgIzq, imgDer);
  doc.addPage();
  drawPage2(doc, info);
  return doc;
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Guarda la entrevista como PDF.
 * @param {object} data - Datos de localStorage (entrevistaStorage.get())
 */
export async function saveInterviewAsPdf(data = {}) {
  const info     = getInfo(data);
  const fileName = `Entrevista_${info.nombre}_${info.apellido}.pdf`.replace(/\s+/g, '_');
  const doc      = await buildPdf(data);

  if ('showSaveFilePicker' in window) {
    try {
      const handle   = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(doc.output('blob'));
      await writable.close();
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  doc.save(fileName);
}

/**
 * Imprime la entrevista renderizando el PDF generado con jsPDF (NO window.print del navegador).
 * @param {object} data - Datos de localStorage (entrevistaStorage.get())
 */
export async function printInterviewPdfFormat(data = {}) {
  const doc      = await buildPdf(data);
  const pdfBytes = doc.output('arraybuffer');

  if (!window.pdfjsLib) {
    await new Promise(function(resolve, reject) {
      const s    = document.createElement('script');
      s.src      = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.onload   = resolve;
      s.onerror  = reject;
      document.head.appendChild(s);
    });
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const pdfDoc     = await window.pdfjsLib.getDocument({ data: pdfBytes }).promise;
  const totalPages = pdfDoc.numPages;

  const printDiv       = document.createElement('div');
  printDiv.id          = '__pdf-print-root__';
  printDiv.style.display = 'none';

  for (let p = 1; p <= totalPages; p++) {
    const page     = await pdfDoc.getPage(p);
    const viewport = page.getViewport({ scale: 2 });
    const canvas   = document.createElement('canvas');
    canvas.width   = viewport.width;
    canvas.height  = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    const img       = document.createElement('img');
    img.src         = canvas.toDataURL('image/jpeg', 0.95);
    img.style.cssText = 'width:100%;display:block;' + (p > 1 ? 'page-break-before:always;' : '');
    printDiv.appendChild(img);
  }

  const styleId = '__pdf-print-style__';
  let styleEl   = document.getElementById(styleId);
  if (!styleEl) {
    styleEl    = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = [
    '@media print {',
    '  body > *:not(#__pdf-print-root__) { display: none !important; }',
    '  #__pdf-print-root__ { display: block !important; }',
    '  #__pdf-print-root__ img { width: 100%; display: block; }',
    '  @page { margin: 0; size: letter portrait; }',
    '}',
  ].join('\n');

  document.body.appendChild(printDiv);

  setTimeout(function() {
    window.print();
    setTimeout(function() {
      document.body.removeChild(printDiv);
      styleEl.textContent = '';
    }, 2000);
  }, 400);
}