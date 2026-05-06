"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import type {
  InterviewEvaluationResponse,
  InterviewQuestion,
  InterviewQuestionsApiResponse,
} from "~/lib/interview-schema";
import LoadingScreen from "../LoadingScreen";
import { Alert } from "../ui";
import { Button } from "../ui";
import { LogoContainer } from "../ui";
import { PageShell } from "../ui";
import { PanelCard } from "../ui";
import { SectionLabel } from "../ui";
import { StatusPill } from "../ui";

type CompanyInterviewExperienceProps = {
  companyName: string;
  companySlug: string;
  description: string;
  location: string;
  logoUrl: string;
  roleTitle: string;
};

type InterviewPhase = "intro" | "interview" | "results";

async function readJsonResponse<T>(
  response: Response,
): Promise<T | { error?: string }> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T | { error?: string };
  } catch {
    return {
      error: text.trim() || "La respuesta del servidor no fue valida.",
    };
  }
}

export function CompanyInterviewExperience({
  companyName,
  companySlug,
  description,
  location,
  logoUrl,
  roleTitle,
}: CompanyInterviewExperienceProps) {
  const router = useRouter();
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] =
    useState<InterviewEvaluationResponse | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [phase, setPhase] = useState<InterviewPhase>("intro");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [startedAt]);

  const handleExitToWorld = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push("/game");
    }, 600);
  };

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const currentAnswer = currentQuestion
    ? (answers[currentQuestion.id] ?? "")
    : "";

  const completedAnswers = useMemo(() => {
    return questions.filter((question) => answers[question.id]?.trim()).length;
  }, [answers, questions]);

  const focusAreas = useMemo(() => {
    return Array.from(
      new Set(questions.map((question) => question.evaluationFocus)),
    );
  }, [questions]);

  const elapsedSeconds = startedAt
    ? Math.max(0, Math.floor((now - startedAt) / 1000))
    : 0;

  const progressPercent = questions.length
    ? Math.round((completedAnswers / questions.length) * 100)
    : 0;

  const interviewState = useMemo(() => {
    if (phase === "intro") {
      return "Pendiente";
    }

    if (phase === "results" && evaluation) {
      return evaluation.passed ? "Aprobada" : "Revisar";
    }

    if (completedAnswers === 0) {
      return "Iniciando";
    }

    if (completedAnswers >= Math.max(1, Math.ceil(questions.length / 2))) {
      return "Avanzada";
    }

    return "En progreso";
  }, [completedAnswers, evaluation, phase, questions.length]);

  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    setError(null);
    setEvaluation(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch(`/api/companies/${companySlug}/questions`, {
        method: "POST",
      });

      const payload = (await readJsonResponse<InterviewQuestionsApiResponse>(
        response,
      )) as { error?: string } | InterviewQuestionsApiResponse;

      if (!response.ok || !("questions" in payload)) {
        throw new Error(
          ("error" in payload ? payload.error : undefined) ??
            "No se pudieron generar preguntas.",
        );
      }

      setQuestions(payload.questions);
      setAnswers(
        Object.fromEntries(
          payload.questions.map((question) => [question.id, ""]),
        ),
      );
      setPhase("interview");
      setStartedAt(Date.now());
      setNow(Date.now());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron generar preguntas.",
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const submitInterview = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/companies/${companySlug}/evaluate`, {
        body: JSON.stringify({
          answers: questions.map((question) => ({
            ...question,
            answer: answers[question.id] ?? "",
          })),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await readJsonResponse<InterviewEvaluationResponse>(
        response,
      )) as { error?: string } | InterviewEvaluationResponse;

      if (!response.ok || !("overallScore" in payload)) {
        throw new Error(
          ("error" in payload ? payload.error : undefined) ??
            "No se pudo evaluar la entrevista.",
        );
      }

      setEvaluation(payload);
      setPhase("results");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo evaluar la entrevista.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvance = async () => {
    if (!currentQuestion) {
      return;
    }

    if (!currentAnswer.trim()) {
      setError("Escribe una respuesta antes de continuar.");
      return;
    }

    setError(null);

    if (currentQuestionIndex === questions.length - 1) {
      await submitInterview();
      return;
    }

    setCurrentQuestionIndex((current) => current + 1);
  };

  const restartInterview = async () => {
    setPhase("intro");
    setError(null);
    setEvaluation(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStartedAt(null);
  };

  return (
    <PageShell>
      {/* LOADER DE INICIO */}
      {isLoadingQuestions && <LoadingScreen subtitle={`Generando simulacion para ${companyName}...`} title="Preparando Entrevista" />}
      
      {/* LOADER DE SALIDA */}
      {isExiting && <LoadingScreen subtitle="Sincronizando progreso..." title="Volviendo al Mundo" />}

      <div>
        <header className="from-intervee-hero-from to-intervee-hero-to border-intervee-border sticky top-0 z-40 border-b-2 bg-linear-to-b text-white shadow-xl">
          <div className="max-w-intervee-page mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <LogoContainer alt={companyName} height={26} size="sm" src={logoUrl} width={26} />
              <div className="min-w-0">
                <SectionLabel size="xs">Intervee</SectionLabel>
                <h1 className="truncate text-sm font-bold sm:text-base">
                  {companyName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden text-right md:block">
                <SectionLabel size="xs" tracking="normal">Posicion</SectionLabel>
                <p className="text-sm font-bold">{roleTitle}</p>
                <p className="text-xs text-intervee-text-soft">{location}</p>
              </div>
              <button
                className="bg-intervee-action border-intervee-border flex h-10 w-10 items-center justify-center rounded border-b-4 text-white transition hover:brightness-110 cursor-pointer"
                onClick={handleExitToWorld}
                type="button"
              >
                <ArrowLeftIcon />
              </button>
            </div>
          </div>
        </header>

        <section className="max-w-intervee-page mx-auto px-4 py-6 sm:px-6 sm:py-8">
          {phase === "intro" ? (
            <InterviewIntro
              companyName={companyName}
              description={description}
              error={error}
              isLoadingQuestions={isLoadingQuestions}
              location={location}
              logoUrl={logoUrl}
              onStart={() => void loadQuestions()}
              onExit={handleExitToWorld}
              roleTitle={roleTitle}
            />
          ) : null}

          {phase !== "intro" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="order-2 xl:order-1">
                <div className="border-intervee-border overflow-hidden border-2 bg-intervee-card-strong shadow-md">
                  <div className="border-intervee-border bg-intervee-page-soft border-b-2 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-intervee-primary">
                          <SectionLabel size="xs" color="primary" tracking="normal">Simulacion activa</SectionLabel>
                        </div>
                        <h2 className="mt-1 text-xl font-bold text-intervee-ink sm:text-2xl">
                          {roleTitle}
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill label={interviewState} tone="neutral" />
                        {phase === "results" && evaluation ? (
                          <StatusPill
                            label={evaluation.passed ? "Apto" : "No apto"}
                            tone={evaluation.passed ? "success" : "danger"}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {phase === "interview" ? (
                    <InterviewConversation
                      companyName={companyName}
                      currentAnswer={currentAnswer}
                      currentQuestion={currentQuestion}
                      currentQuestionIndex={currentQuestionIndex}
                      description={description}
                      error={error}
                      isLoadingQuestions={isLoadingQuestions}
                      isSubmitting={isSubmitting}
                      onAnswerChange={(value) => {
                        if (!currentQuestion) {
                          return;
                        }

                        setAnswers((current) => ({
                          ...current,
                          [currentQuestion.id]: value,
                        }));
                      }}
                      onContinue={() => void handleAdvance()}
                      questionsCount={questions.length}
                    />
                  ) : null}

                  {phase === "results" && evaluation ? (
                    <InterviewResults
                      evaluation={evaluation}
                      onRestart={() => void restartInterview()}
                      onExit={handleExitToWorld}
                      questions={questions}
                    />
                  ) : null}
                </div>
              </div>

              <aside className="order-1 space-y-4 xl:order-2">
                <StatsPanel
                  completedAnswers={completedAnswers}
                  currentQuestion={currentQuestion}
                  elapsedSeconds={elapsedSeconds}
                  evaluation={evaluation}
                  focusAreas={focusAreas}
                  interviewState={interviewState}
                  phase={phase}
                  progressPercent={progressPercent}
                  questionsCount={questions.length}
                />
              </aside>
            </div>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}

function InterviewIntro({
  companyName,
  description,
  error,
  isLoadingQuestions,
  location,
  logoUrl,
  onStart,
  onExit,
  roleTitle,
}: {
  companyName: string;
  description: string;
  error: string | null;
  isLoadingQuestions: boolean;
  location: string;
  logoUrl: string;
  onStart: () => void;
  onExit: () => void;
  roleTitle: string;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="bg-intervee-surface border-intervee-border border-2 p-6 text-white shadow-md sm:p-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <SectionLabel tracking="wide">Preparacion de entrevista</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              {companyName}
            </h2>
            <p className="text-intervee-text-soft mt-3 max-w-2xl text-sm leading-7 sm:text-base">
              {description}
            </p>
          </div>

          <LogoContainer alt={companyName} height={44} size="lg" src={logoUrl} width={44} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <IntroMetric label="Rol" value={roleTitle} />
          <IntroMetric label="Modalidad" value={location} />
          <IntroMetric label="Formato" value="Simulacion guiada" />
        </div>

        <div className="mt-8 border border-intervee-card-border bg-intervee-news/20 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="bg-intervee-connect flex h-11 w-11 items-center justify-center rounded border-b-4 border-intervee-hero-to text-white">
              <SparkIcon />
            </div>
            <div>
              <h3 className="font-semibold">Antes de comenzar</h3>
              <p className="text-intervee-text-soft text-sm">
                La conversacion no empieza hasta que presiones iniciar.
              </p>
            </div>
          </div>

          <ul className="text-intervee-text-soft mt-5 space-y-3 text-sm leading-6">
            <li>
              Responderas una pregunta por vez para mantener foco y claridad.
            </li>
            <li>
              La evaluacion final considera profundidad, tradeoffs y
              comunicacion.
            </li>
            <li>Puedes volver al mundo 3D cuando termine la simulacion.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button disabled={isLoadingQuestions} onClick={onStart} size="lg" type="button">
            {isLoadingQuestions
              ? "Preparando entrevista..."
              : "Iniciar entrevista"}
          </Button>
          <Button onClick={onExit} type="button" variant="secondary" size="lg">
            Volver al mundo
          </Button>
        </div>

        {error ? (
          <Alert className="mt-5">{error}</Alert>
        ) : null}
      </section>
    </div>
  );
}

function InterviewConversation({
  companyName,
  currentAnswer,
  currentQuestion,
  currentQuestionIndex,
  description,
  error,
  isLoadingQuestions,
  isSubmitting,
  onAnswerChange,
  onContinue,
  questionsCount,
}: {
  companyName: string;
  currentAnswer: string;
  currentQuestion: InterviewQuestion | null;
  currentQuestionIndex: number;
  description: string;
  error: string | null;
  isLoadingQuestions: boolean;
  isSubmitting: boolean;
  onAnswerChange: (value: string) => void;
  onContinue: () => void;
  questionsCount: number;
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="space-y-5">
        <div className="flex justify-start">
          <div className="bg-intervee-surface border-intervee-border max-w-3xl border-2 px-5 py-4 text-white shadow-md">
            <div className="mb-2 flex items-center gap-2">
              <span className="bg-intervee-action h-2.5 w-2.5 rounded-full" />
              <SectionLabel size="xs" tracking="normal">Reclutador IA</SectionLabel>
            </div>

            <p className="text-base leading-7 sm:text-lg">
              {isLoadingQuestions
                ? `Estamos preparando la simulacion de ${companyName}...`
                : (currentQuestion?.prompt ??
                  "No hay preguntas disponibles para esta entrevista.")}
            </p>

            <p className="text-intervee-text-soft mt-3 text-sm">
              {currentQuestion
                ? `Pregunta ${currentQuestionIndex + 1} de ${questionsCount} · ${currentQuestion.evaluationFocus}`
                : description}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="border-intervee-border w-full max-w-3xl border-2 bg-intervee-card-strong p-4 shadow-md sm:p-5">
            <label className="text-intervee-primary mb-3 block">
              <SectionLabel size="xs" color="primary" tracking="normal">Tu respuesta</SectionLabel>
            </label>
            <textarea
              className="border-intervee-border bg-intervee-page focus:border-intervee-connect min-h-40 w-full resize-none border-2 px-4 py-4 text-sm leading-7 text-intervee-ink transition outline-none placeholder:text-intervee-text-muted sm:text-base"
              disabled={isLoadingQuestions || isSubmitting || !currentQuestion}
              onChange={(event) => {
                onAnswerChange(event.target.value);
              }}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  onContinue();
                }
              }}
              placeholder="Escribe una respuesta concreta, con decisiones, riesgos, tradeoffs y resultados medibles."
              value={currentAnswer}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase">
                <span className="text-intervee-text-muted">
                  Ctrl + Enter para continuar
                </span>
                <span className="h-1 w-1 rounded-full bg-intervee-muted" />
                <span className="text-intervee-primary">
                  Respuesta guiada paso a paso
                </span>
              </div>

              <Button
                disabled={
                  isLoadingQuestions || isSubmitting || !currentQuestion
                }
                onClick={onContinue}
                type="button"
              >
                {isSubmitting
                  ? "Evaluando..."
                  : currentQuestionIndex === questionsCount - 1
                    ? "Enviar entrevista"
                    : "Continuar"}
              </Button>
            </div>

            {error ? (
              <Alert className="mt-4">{error}</Alert>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function InterviewResults({
  evaluation,
  onRestart,
  onExit,
  questions,
}: {
  evaluation: InterviewEvaluationResponse;
  onRestart: () => void;
  onExit: () => void;
  questions: InterviewQuestion[];
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <SectionLabel color="ink" tracking="normal">Resultado final</SectionLabel>
            <h3 className="mt-2 text-3xl font-bold text-intervee-ink sm:text-4xl">
              {evaluation.overallScore}/100
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-intervee-muted-link sm:text-base">
              {evaluation.summary}
            </p>
          </div>

          <div className="rounded-2xl border border-intervee-soft-border bg-intervee-card-strong/70 px-5 py-4 text-sm text-intervee-muted-link">
            <div>Barra minima: {evaluation.passScore}</div>
            <div className="mt-1 font-semibold">
              Decision: {evaluation.recommendation.replace("_", " ")}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusPill
            label={evaluation.passed ? "Apto" : "No apto"}
            tone={evaluation.passed ? "success" : "danger"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ResultGroup
            items={evaluation.hiringSignals}
            title="Senales de contratacion"
            tone="positive"
          />
          <ResultGroup
            items={evaluation.risks}
            title="Riesgos detectados"
            tone="warning"
          />
        </div>

        <div className="space-y-3">
          {evaluation.questionReviews.map((review) => (
            <div
              className="rounded-2xl border border-intervee-soft-border bg-intervee-card-strong/65 px-5 py-4"
              key={review.questionId}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-medium text-intervee-ink">
                  {questions.find(
                    (question) => question.id === review.questionId,
                  )?.prompt ?? review.questionId}
                </div>
                <div className="rounded-full border border-intervee-soft-border bg-intervee-card-strong/80 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-intervee-muted-link uppercase">
                  {review.score}/100
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-intervee-muted-link">
                {review.feedback}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="text-center" onClick={onExit} type="button">
            Volver al mundo
          </Button>
          <Button onClick={onRestart} type="button" variant="secondary">
            Preparar otra entrevista
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatsPanel({
  completedAnswers,
  currentQuestion,
  elapsedSeconds,
  evaluation,
  focusAreas,
  interviewState,
  phase,
  progressPercent,
  questionsCount,
}: {
  completedAnswers: number;
  currentQuestion: InterviewQuestion | null;
  elapsedSeconds: number;
  evaluation: InterviewEvaluationResponse | null;
  focusAreas: string[];
  interviewState: string;
  phase: InterviewPhase;
  progressPercent: number;
  questionsCount: number;
}) {
  const visibleFocusAreas =
    focusAreas.length > 0
      ? focusAreas
      : ["Comunicacion", "Tradeoffs", "Criterio"];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <PanelCardLocal title="Estado de sesion">
        <div className="space-y-4">
          <StatRow label="Duracion" value={formatDuration(elapsedSeconds)} />
          <StatRow label="Estado" value={interviewState} />
          <StatRow
            label="Progreso"
            value={`${completedAnswers}/${questionsCount || 0}`}
          />
          <div>
            <div className="bg-intervee-ghost h-2 overflow-hidden rounded-full">
              <div
                className="bg-intervee-connect h-full rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </PanelCardLocal>

      <PanelCardLocal title="Foco actual">
        <div className="space-y-3">
          <p className="text-intervee-text-soft text-sm leading-6">
            {phase === "intro"
              ? "Todavia no comenzo la conversacion. Inicia cuando estes listo."
              : currentQuestion
                ? `La pregunta actual evalua ${currentQuestion.evaluationFocus.toLowerCase()}.`
                : "Esperando resultado final de la simulacion."}
          </p>
          <div className="flex flex-wrap gap-2">
            {visibleFocusAreas.slice(0, 4).map((focus) => (
              <span
                className="bg-intervee-card-strong/10 px-3 py-2 text-xs font-bold text-white uppercase"
                key={focus}
              >
                {focus}
              </span>
            ))}
          </div>
        </div>
      </PanelCardLocal>

      <PanelCardLocal title="Lectura rapida">
        <div className="text-intervee-text-soft space-y-3 text-sm">
          <p>
            {evaluation
              ? `La entrevista termino con ${evaluation.overallScore} puntos sobre 100.`
              : "La interfaz esta optimizada para responder una cosa por vez y reducir ruido visual."}
          </p>
          <p>
            {phase === "results"
              ? "Revisa primero resumen, riesgos y senales de contratacion."
              : "Es mejor responder con ejemplos concretos, decisiones y resultados medibles."}
          </p>
        </div>
      </PanelCardLocal>
    </div>
  );
}

function IntroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-intervee-card-border bg-intervee-news/20 p-4">
      <SectionLabel size="xs" tracking="normal">{label}</SectionLabel>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function PanelCardLocal({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <PanelCard>
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-4">{children}</div>
    </PanelCard>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-intervee-text-soft">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function ResultGroup({
  items,
  title,
  tone,
}: {
  items: string[];
  title: string;
  tone: "positive" | "warning";
}) {
  const toneClasses =
    tone === "positive"
      ? "border-intervee-border bg-intervee-page-soft"
      : "border-intervee-border bg-intervee-card-strong";

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses}`}>
      <SectionLabel color="primary" size="sm">{title}</SectionLabel>
      <ul className="mt-3 space-y-2 text-sm text-intervee-muted-link">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        fill="currentColor"
      />
    </svg>
  );
}
