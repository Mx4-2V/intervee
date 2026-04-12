"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import Image from "next/image";

import type {
  InterviewEvaluationResponse,
  InterviewQuestion,
  InterviewQuestionsApiResponse,
} from "~/lib/interview-schema";

function ResultTone({ passed }: { passed: boolean }) {
  return passed ? (
    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-emerald-200 uppercase">
      Apto
    </span>
  ) : (
    <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-rose-200 uppercase">
      No apto
    </span>
  );
}

export function CompanyInterviewExperience({
  companyName,
  companySlug,
  description,
  location,
  logoUrl,
  roleTitle,
  themeColor,
}: {
  companyName: string;
  companySlug: string;
  description: string;
  location: string;
  logoUrl: string;
  roleTitle: string;
  themeColor: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] =
    useState<InterviewEvaluationResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/companies/${companySlug}/questions`,
          {
            method: "POST",
          },
        );

        const payload = (await response.json()) as
          | { error?: string }
          | InterviewQuestionsApiResponse;

        if (!response.ok || !("questions" in payload)) {
          throw new Error(
            ("error" in payload ? payload.error : undefined) ??
              "No se pudieron generar preguntas.",
          );
        }

        if (!cancelled) {
          setQuestions(payload.questions);
          setAnswers(
            Object.fromEntries(
              payload.questions.map((question) => [question.id, ""]),
            ),
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron generar preguntas.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingQuestions(false);
        }
      }
    };

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [companySlug]);

  const completedAnswers = useMemo(() => {
    return questions.filter((question) => answers[question.id]?.trim()).length;
  }, [answers, questions]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (questions.some((question) => !answers[question.id]?.trim())) {
      setError("Responde todas las preguntas antes de enviar la entrevista.");
      return;
    }

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

      const payload = (await response.json()) as
        | { error?: string }
        | InterviewEvaluationResponse;

      if (!response.ok || !("overallScore" in payload)) {
        throw new Error(
          ("error" in payload ? payload.error : undefined) ??
            "No se pudo evaluar la entrevista.",
        );
      }

      setEvaluation(payload);
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

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5"
              style={{ boxShadow: `0 0 40px ${themeColor}33` }}
            >
              <Image alt={companyName} height={52} src={logoUrl} width={52} />
            </div>

            <div className="space-y-2">
              <p className="text-xs tracking-[0.3em] text-cyan-200 uppercase">
                Entrevista activa
              </p>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                {companyName}
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                {description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2 lg:min-w-80">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
              <div className="text-[11px] tracking-[0.22em] text-slate-400 uppercase">
                Rol
              </div>
              <div className="mt-1 font-medium">{roleTitle}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
              <div className="text-[11px] tracking-[0.22em] text-slate-400 uppercase">
                Modalidad
              </div>
              <div className="mt-1 font-medium">{location}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/20">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs tracking-[0.24em] text-slate-400 uppercase">
                  Evaluacion en vivo
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Screening tecnico y de criterio
                </h2>
              </div>

              {evaluation ? <ResultTone passed={evaluation.passed} /> : null}
            </div>

            {isLoadingQuestions ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-14 text-center text-slate-300">
                Generando preguntas desde el documento de {companyName}...
              </div>
            ) : null}

            {!isLoadingQuestions && questions.length > 0 ? (
              <form
                className="space-y-5"
                onSubmit={(event) => void handleSubmit(event)}
              >
                {questions.map((question, index) => (
                  <label
                    className="block rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                    key={question.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs tracking-[0.22em] text-cyan-200 uppercase">
                          Pregunta {index + 1}
                        </div>
                        <div className="mt-2 text-lg font-medium text-white">
                          {question.prompt}
                        </div>
                      </div>
                      <div className="max-w-56 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300">
                        {question.evaluationFocus}
                      </div>
                    </div>

                    <textarea
                      className="mt-4 min-h-36 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white transition outline-none focus:border-cyan-300/50"
                      onChange={(event) => {
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: event.target.value,
                        }));
                      }}
                      placeholder="Escribe una respuesta concreta, con decisiones tecnicas, tradeoffs y como medirias el resultado."
                      value={answers[question.id] ?? ""}
                    />
                  </label>
                ))}

                <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-300">
                    {completedAnswers}/{questions.length} respuestas completas.
                  </div>

                  <button
                    className="rounded-full px-6 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting || isLoadingQuestions}
                    style={{ backgroundColor: themeColor }}
                    type="submit"
                  >
                    {isSubmitting
                      ? "Evaluando entrevista..."
                      : "Enviar entrevista"}
                  </button>
                </div>
              </form>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {evaluation ? (
              <div className="mt-8 space-y-5 rounded-[28px] border border-white/10 bg-[#09172a] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs tracking-[0.24em] text-cyan-200 uppercase">
                      Veredicto final
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-white">
                      {evaluation.overallScore}/100
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300">
                      {evaluation.summary}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-sm text-slate-200">
                    <div>Barra minima: {evaluation.passScore}</div>
                    <div className="mt-1 font-semibold">
                      Decision: {evaluation.recommendation.replace("_", " ")}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-5">
                    <div className="text-xs tracking-[0.22em] text-emerald-200 uppercase">
                      Senales de contratacion
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-100">
                      {evaluation.hiringSignals.map((signal) => (
                        <li key={signal}>{signal}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-amber-400/15 bg-amber-400/5 p-5">
                    <div className="text-xs tracking-[0.22em] text-amber-200 uppercase">
                      Riesgos detectados
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-100">
                      {evaluation.risks.map((risk) => (
                        <li key={risk}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  {evaluation.questionReviews.map((review) => (
                    <div
                      className="rounded-3xl border border-white/10 bg-slate-950/75 px-5 py-4"
                      key={review.questionId}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-medium text-white">
                          {questions.find(
                            (question) => question.id === review.questionId,
                          )?.prompt ?? review.questionId}
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-cyan-100 uppercase">
                          {review.score}/100
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        {review.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-xs tracking-[0.24em] text-slate-400 uppercase">
                Reglas
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-200">
                <li>Responde con detalle tecnico y decisiones concretas.</li>
                <li>
                  Menciona testing, monitoreo, riesgos y tradeoffs cuando
                  aplique.
                </li>
                <li>
                  El veredicto final se calcula contra una barra minima fija.
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-xs tracking-[0.24em] text-slate-400 uppercase">
                Navegacion
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10"
                  href="/game"
                >
                  Volver al mundo
                </Link>
                <button
                  className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                  onClick={() => window.location.reload()}
                  type="button"
                >
                  Regenerar preguntas
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
