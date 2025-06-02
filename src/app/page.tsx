import Image from "next/image";

export default function HomePage() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            ¡Bienvenido a Financy!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Tu rastreador de gastos personal está listo para ayudarte a controlar tus finanzas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card/50 p-6 rounded-2xl border border-border/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg warm-gradient flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
              Análisis Detallado
            </h3>
            <p className="text-muted-foreground text-center">
              Visualiza tus gastos con gráficos y estadísticas detalladas
            </p>
          </div>

          <div className="bg-card/50 p-6 rounded-2xl border border-border/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg warm-gradient flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
              Metas Financieras
            </h3>
            <p className="text-muted-foreground text-center">
              Establece y alcanza tus objetivos financieros paso a paso
            </p>
          </div>

          <div className="bg-card/50 p-6 rounded-2xl border border-border/50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg warm-gradient flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
              Control Total
            </h3>
            <p className="text-muted-foreground text-center">
              Mantén el control completo de tus ingresos y gastos
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-2xl">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-muted-foreground mb-6">
              Comienza registrando tus primeros gastos y descubre el poder del control financiero
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Agregar Gasto
              </button>
              <button className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors">
                Ver Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
