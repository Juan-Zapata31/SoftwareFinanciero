export function PanelCursos() {
  return (
    <div className="max-w-4xl mx-auto px-4 my-8">
      <h3 className="text-2xl font-bold text-white mb-6">
        Catálogo de Especialidades
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:border-indigo-500 transition-all">
          <div className="text-indigo-400 font-bold text-lg mb-2">
            React Básico
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Aprende componentes, props y hooks esenciales.
          </p>
          <span className="inline-block bg-indigo-500/10 text-indigo-400 text-xs px-3 py-1 rounded-full font-semibold border border-indigo-500/20">
            Disponible
          </span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:border-emerald-500 transition-all">
          <div className="text-emerald-400 font-bold text-lg mb-2">
            Tailwind CSS
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Diseña interfaces modernas sin salir de tu JSX.
          </p>
          <span className="inline-block bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/20">
            En curso
          </span>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl hover:border-amber-500 transition-all">
          <div className="text-amber-400 font-bold text-lg mb-2">
            Node.js &amp; APIs
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Crea servidores y conecta bases de datos reales.
          </p>
          <span className="inline-block bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full font-semibold border border-amber-500/20">
            Próximamente
          </span>
        </div>
      </div>
    </div>
  )
}