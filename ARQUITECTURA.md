# Arquitectura — Feature-Sliced Design (FSD)

## Por qué FSD
El proyecto es un formulario multi-paso con features bien definidas, lógica compartida y utilidades separadas.
FSD organiza el código por **responsabilidad de negocio**, no por tipo de archivo.

---

## Estructura de carpetas

```
src/
├── main.jsx                          ← Punto de entrada único
│
├── app/
│   ├── App.jsx                       ← Router principal (incluye /login)
│   └── index.css                     ← Variables CSS + paleta de colores
│
├── pages/                            ← Composición de features → rutas
│   ├── login/
│   │   └── LoginPage.jsx
│   └── entrevista/
│       ├── EntrevistaStep1.jsx       ← Re-exporta Step1Form
│       ├── EntrevistaStep2.jsx       ← Re-exporta Step2Form
│       ├── EntrevistaStep3.jsx       ← Re-exporta Step3Form
│       └── EntrevistaStep4.jsx       ← Re-exporta Step4Form
│
├── features/                         ← Lógica de negocio por dominio
│   ├── entrevistaForm/
│   │   └── ui/
│   │       ├── Step1Form.jsx         ← Datos Básicos (antes Numero1)
│   │       ├── Step2Form.jsx         ← Entorno Familiar (antes Numero2)
│   │       ├── Step3Form.jsx         ← Expectativas (antes Numero3)
│   │       └── Step4Form.jsx         ← Preguntas Extras (antes Numero4)
│   ├── buscarEntrevista/
│   │   ├── model/
│   │   │   └── useBuscarEntrevista.js   ← Hook: lógica de búsqueda
│   │   └── ui/
│   │       └── BuscadorEntrevista.jsx   ← Componente de búsqueda
│   └── pdfExport/
│       └── lib/
│           ├── pdfGenerador.js          ← (tu archivo original)
│           └── index.js                 ← Re-exporta funciones PDF
│
└── shared/                           ← Código reutilizable sin lógica de negocio
    ├── ui/
    │   ├── FormWrapper.jsx            ← Tarjeta blanca contenedora
    │   ├── FormHeader.jsx             ← Título + StepBar
    │   ├── StepBar.jsx               ← Barra de pasos
    │   ├── BannerLectura.jsx         ← Banner modo solo-lectura
    │   └── FormFooter.jsx            ← Botones Volver / Siguiente
    └── lib/
        └── entrevistaStorage.js      ← Encapsula localStorage
```

---

## Paleta de colores aplicada

| Token            | Hex       | Uso                                      |
|------------------|-----------|------------------------------------------|
| `--color-primary`      | `#d1323b` | Botones, accents activos, iconos         |
| `--color-secondary`    | `#51626f` | Botón "Ver", textos secundarios          |
| `--color-dark`         | `#2d3547` | Header buscador, fondo login, títulos    |
| `--color-accent`       | `#f3bf99` | "¿Olvidé contraseña?" en login           |
| `--color-muted`        | `#c1c6c8` | Subtítulos, placeholders en login        |

---

## Login (ruta `/login`)
- Diseño **glassmorphism** sobre fondo degradado `#2d3547 → #51626f`
- Blobs decorativos con colores de la paleta
- Panel translúcido con `backdrop-filter: blur`
- Ícono de usuario flotante sobre la card
- Campos: Correo/usuario, Contraseña
- Checkbox "Recordarme" + link "¿Olvidé mi contraseña?"
- Botón rojo `#d1323b` con spinner de carga

---

## Convenciones de naming
| Antes       | Ahora (FSD)        |
|-------------|-------------------|
| `Numero1`   | `Step1Form`       |
| `Numero2`   | `Step2Form`       |
| `Numero3`   | `Step3Form`       |
| `Numero4`   | `Step4Form`       |
| `pdfGenerador.js` | `features/pdfExport/lib/pdfGenerador.js` |
