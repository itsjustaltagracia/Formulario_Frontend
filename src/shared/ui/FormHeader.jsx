import StepBar from "./StepBar";

/**
 * @param {{ pasoActual: number }} props
 */
export default function FormHeader({ pasoActual }) {
  return (
    <div className="p-8 pb-4 text-center">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "#2d3547" }}>
        Entrevista Familiar
      </h1>
      <StepBar pasoActual={pasoActual} />
    </div>
  );
}
