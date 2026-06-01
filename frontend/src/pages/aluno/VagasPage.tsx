import { JobList } from "./components/JobList";

export function VagasPage() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Vagas Disponíveis</h1>
        <p className="text-muted-foreground">Confira as melhores oportunidades selecionadas para você.</p>
      </header>

      <JobList />
    </div>
  );
}
