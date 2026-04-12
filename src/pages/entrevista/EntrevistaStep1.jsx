// src/pages/entrevista/EntrevistaStep1.jsx
//
// Este archivo es el punto de entrada del Paso 1.
// Toda la lógica compleja y el JSX del formulario vienen del
// componente original Numero1, pero ahora:
//   - Usa componentes compartidos (FormWrapper, FormHeader, FormFooter, BannerLectura)
//   - Usa entrevistaStorage en lugar de localStorage directo
//   - Usa la nueva paleta de colores (#d1323b, #51626f, #2d3547)
//
// NOTA: Se mantiene la misma lógica de negocio. Solo se actualizan:
//   1. Imports → shared components
//   2. Colores hardcodeados (#4682B4 → #d1323b)
//   3. Buscador → componente BuscadorEntrevista

export { default } from "../../features/entrevistaForm/ui/Step1Form";
