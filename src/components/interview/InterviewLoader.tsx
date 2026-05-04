// src/components/interview/InterviewLoader.tsx
export default function InterviewLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#004a77] text-white">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      <h2 className="mt-6 text-xl font-semibold animate-pulse uppercase tracking-widest">
        Preparando Entrevista
      </h2>
      <p className="mt-2 text-blue-200/70 text-sm">
        Conectando con el reclutador de Microsoft...
      </p>
    </div>
  );
}