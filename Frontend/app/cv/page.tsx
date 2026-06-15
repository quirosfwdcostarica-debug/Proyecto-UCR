"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Check, Edit2, Trash2, Download, CheckCircle2, Loader2, Lightbulb, Plus, Save, X, MapPin, Mail, Phone, Briefcase, GraduationCap, Code2, Award } from "lucide-react";
import { initialCV, type CVData, type Experience } from "@/components/cv/CVTypes";
import { ConfirmModal, ExperienceForm, SkillsEditor, EducationForm } from "@/components/cv/CVEditors";

type AISection = "profile" | "experience";

export default function CVPage() {
  const [cv, setCV] = useState<CVData>(initialCV);

  // Edit states
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState(cv.summary);
  const [addingExp, setAddingExp] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [deleteExpId, setDeleteExpId] = useState<string | null>(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [addingCert, setAddingCert] = useState(false);
  const [certInput, setCertInput] = useState("");
  const [editingHeader, setEditingHeader] = useState(false);
  const [headerDraft, setHeaderDraft] = useState({ name: cv.name, title: cv.title, location: cv.location, email: cv.email, phone: cv.phone });

  // AI states
  const [acceptedAI, setAcceptedAI] = useState<Set<AISection>>(new Set());
  const [discardedAI, setDiscardedAI] = useState<Set<AISection>>(new Set());

  const acceptAI = (section: AISection, newSummary?: string) => {
    if (section === "profile" && newSummary) setCV((c) => ({ ...c, summary: newSummary }));
    setAcceptedAI((s) => new Set(s).add(section));
  };
  const discardAI = (section: AISection) => setDiscardedAI((s) => new Set(s).add(section));

  // Experience handlers
  const saveExp = (exp: Experience) => {
    setCV((c) => ({
      ...c,
      experience: editingExpId
        ? c.experience.map((e) => (e.id === editingExpId ? exp : e))
        : [...c.experience, exp],
    }));
    setEditingExpId(null);
    setAddingExp(false);
  };
  const deleteExp = (id: string) => { setCV((c) => ({ ...c, experience: c.experience.filter((e) => e.id !== id) })); setDeleteExpId(null); };

  const inp = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <div className="min-h-full bg-[#f0f4f8] dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <TopBar title="My CV" />

      {deleteExpId && (
        <ConfirmModal
          message="¿Deseas eliminar esta experiencia? Esta acción no se puede deshacer."
          onConfirm={() => deleteExp(deleteExpId)}
          onCancel={() => setDeleteExpId(null)}
        />
      )}

      {/* Sub-header */}
      <div className="bg-white dark:bg-slate-900 border-b border-border dark:border-slate-800 px-8 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-1">AI Career Assistant</p>
          <h1 className="text-2xl font-bold text-foreground">Optimización de CV</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Badge className="bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400 hover:bg-[#dcfce7] dark:hover:bg-green-900/60 border-0 px-3 py-1 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-1.5" /> Análisis AI Activo
            </Badge>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Puntaje: <span className="text-green-600 dark:text-green-500 font-bold text-lg">88%</span></span>
          </div>
          <div className="flex gap-3 border-l border-slate-200 dark:border-slate-700 pl-6">
            <Button variant="outline" className="border-slate-300 dark:border-slate-700 dark:text-slate-300" onClick={() => alert("Generando PDF...")}>
              <Download className="w-4 h-4 mr-2" /> Descargar PDF
            </Button>
            <Button className="bg-[#0f4c81] dark:bg-sky-600 hover:bg-[#0b3a63] dark:hover:bg-sky-500 text-white" onClick={() => alert("Aplicación enviada correctamente.")}>
              Finalizar y Aplicar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: CV editable ───────────────────────────────────────────── */}
        <div className="w-1/2 p-8 overflow-y-auto border-r border-border dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="flex justify-between items-center mb-5">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" /> Tu versión actual
            </span>
            <Badge variant="outline" className="text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 uppercase tracking-widest text-[10px]">EDITABLE</Badge>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Header limpio sin superposición */}
            <div className="relative bg-gradient-to-r from-[#0f4c81] via-[#1a6db5] to-[#2196f3] px-8 pt-8 pb-6">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 30%, white 1px, transparent 1px)", backgroundSize: "25px 25px" }} />

              {/* Botón editar header */}
              <button
                onClick={() => { setHeaderDraft({ name: cv.name, title: cv.title, location: cv.location, email: cv.email, phone: cv.phone }); setEditingHeader(true); }}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors backdrop-blur-sm border border-white/30"
              >
                <Edit2 className="w-3 h-3" /> Editar
              </button>

              {!editingHeader ? (
                <div className="relative z-10 flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold border-2 border-white/40 shrink-0">
                    {cv.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">{cv.name}</h2>
                    <p className="text-blue-100 font-medium text-sm">{cv.title}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-blue-100">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cv.location}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{cv.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{cv.phone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/30 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/70 text-xs font-semibold block mb-1">Nombre completo</label>
                      <input className="w-full text-sm bg-white text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" value={headerDraft.name} onChange={e => setHeaderDraft(d => ({ ...d, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-white/70 text-xs font-semibold block mb-1">Título / Cargo</label>
                      <input className="w-full text-sm bg-white text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" value={headerDraft.title} onChange={e => setHeaderDraft(d => ({ ...d, title: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-white/70 text-xs font-semibold block mb-1">Ubicación</label>
                      <input className="w-full text-sm bg-white text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" value={headerDraft.location} onChange={e => setHeaderDraft(d => ({ ...d, location: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-white/70 text-xs font-semibold block mb-1">Email</label>
                      <input className="w-full text-sm bg-white text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" value={headerDraft.email} onChange={e => setHeaderDraft(d => ({ ...d, email: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-white/70 text-xs font-semibold block mb-1">Teléfono</label>
                      <input className="w-full text-sm bg-white text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" value={headerDraft.phone} onChange={e => setHeaderDraft(d => ({ ...d, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button onClick={() => setEditingHeader(false)} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors">
                      <X className="w-3 h-3" /> Cancelar
                    </button>
                    <button onClick={() => { setCV(c => ({ ...c, ...headerDraft })); setEditingHeader(false); }} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#0f4c81] rounded-lg text-xs font-bold transition-colors hover:bg-blue-50">
                      <Save className="w-3 h-3" /> Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-8" />

            <div className="px-8 py-6 space-y-8">

              {/* Perfil */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-sky-400"><Briefcase className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Perfil Profesional</h3>
                  <button onClick={() => { setSummaryDraft(cv.summary); setEditingSummary(true); }} className="ml-auto p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                  </button>
                </div>
                {editingSummary ? (
                  <div className="space-y-2">
                    <textarea className="w-full text-sm text-slate-700 p-3 border border-blue-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" rows={4} value={summaryDraft} onChange={(e) => setSummaryDraft(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditingSummary(false)}><X className="w-3.5 h-3.5 mr-1" />Cancelar</Button>
                      <Button size="sm" className="bg-[#0f4c81] text-white hover:bg-[#0b3a63]" onClick={() => { setCV(c => ({ ...c, summary: summaryDraft })); setEditingSummary(false); }}><Save className="w-3.5 h-3.5 mr-1" />Guardar</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">{cv.summary}</p>
                )}
              </div>

              {/* Experiencia */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600"><Briefcase className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Experiencia</h3>
                  <button onClick={() => { setAddingExp(true); setEditingExpId(null); }} className="ml-auto p-1.5 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                  </button>
                </div>

                {addingExp && !editingExpId && (
                  <div className="mb-4">
                    <ExperienceForm onSave={saveExp} onCancel={() => setAddingExp(false)} />
                  </div>
                )}

                <div className="space-y-5">
                  {cv.experience.map((exp) => (
                    <div key={exp.id}>
                      {editingExpId === exp.id ? (
                        <ExperienceForm initial={exp} onSave={saveExp} onCancel={() => setEditingExpId(null)} />
                      ) : (
                        <div className="relative pl-4 border-l-2 border-slate-200 hover:border-[#1a6db5] transition-colors group/exp">
                          <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-300 group-hover/exp:bg-[#1a6db5] transition-colors" />
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{exp.role}</h4>
                              <p className="text-xs text-[#1a6db5] font-medium">{exp.company} · {exp.period}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover/exp:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingExpId(exp.id); setAddingExp(false); }} className="p-1 hover:bg-blue-50 rounded-md"><Edit2 className="w-3 h-3 text-slate-400 hover:text-blue-600" /></button>
                              <button onClick={() => setDeleteExpId(exp.id)} className="p-1 hover:bg-red-50 rounded-md"><Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                            </div>
                          </div>
                          {exp.bullets.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {exp.bullets.map((b, i) => (
                                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />{b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {cv.experience.length === 0 && <p className="text-xs text-slate-400 italic">Sin experiencias. Agrega una con el botón +</p>}
                </div>
              </div>

              {/* Habilidades */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-violet-100 text-violet-600"><Code2 className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Habilidades</h3>
                </div>
                <SkillsEditor
                  skills={cv.skills}
                  onAdd={(s) => setCV((c) => ({ ...c, skills: [...c.skills, s] }))}
                  onRemove={(s) => setCV((c) => ({ ...c, skills: c.skills.filter((x) => x !== s) }))}
                />
              </div>

              {/* Educación */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600"><GraduationCap className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Educación</h3>
                  <button onClick={() => setAddingEdu(true)} className="ml-auto p-1.5 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600" />
                  </button>
                </div>
                {cv.education.map((e, i) => (
                  <div key={i} className="flex items-start justify-between pl-4 border-l-2 border-slate-200 group/edu mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{e.institution}</h4>
                      <p className="text-xs text-emerald-600 font-medium">{e.degree} · {e.period}</p>
                    </div>
                    <button onClick={() => setCV((c) => ({ ...c, education: c.education.filter((_, j) => j !== i) }))} className="opacity-0 group-hover/edu:opacity-100 p-1 hover:bg-red-50 rounded-md transition-opacity">
                      <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
                {addingEdu && <EducationForm onSave={(e) => { setCV((c) => ({ ...c, education: [...c.education, e] })); setAddingEdu(false); }} onCancel={() => setAddingEdu(false)} />}
              </div>

              {/* Certificaciones */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600"><Award className="w-4 h-4" /></div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Certificaciones</h3>
                  <button onClick={() => setAddingCert(true)} className="ml-auto p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5 text-slate-400 hover:text-amber-600" />
                  </button>
                </div>
                <div className="space-y-2 mb-3">
                  {cv.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-slate-700 bg-amber-50 px-3 py-2 rounded-lg group/cert">
                      <span>🏅 {cert}</span>
                      <button onClick={() => setCV((c) => ({ ...c, certifications: c.certifications.filter((_, j) => j !== i) }))} className="opacity-0 group-hover/cert:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {cv.certifications.length === 0 && !addingCert && <p className="text-xs text-slate-400 italic">Sin certificaciones aún.</p>}
                </div>
                {addingCert && (
                  <div className="flex gap-2">
                    <input autoFocus className={inp + " flex-1"} placeholder="Ej. AWS Certified Developer" value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && certInput.trim()) { setCV((c) => ({ ...c, certifications: [...c.certifications, certInput.trim()] })); setCertInput(""); setAddingCert(false); } }} />
                    <Button size="sm" className="bg-[#0f4c81] text-white" onClick={() => { if (certInput.trim()) { setCV((c) => ({ ...c, certifications: [...c.certifications, certInput.trim()] })); setCertInput(""); setAddingCert(false); } }}><Save className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="outline" onClick={() => { setAddingCert(false); setCertInput(""); }}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT: AI Suggestions ───────────────────────────────────────── */}
        <div className="w-1/2 p-8 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 relative">
          <div className="flex justify-between items-center mb-6 max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-[#0f4c81] dark:text-sky-400 flex items-center gap-2"><Sparkles className="w-5 h-5" />Sugerencia de IA</h2>
            <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/60 border-0 uppercase tracking-widest text-[10px]">SUGERENCIA AI</Badge>
          </div>

          <div className="max-w-xl mx-auto space-y-5 pb-24">

            {/* Info card */}
            <div className="bg-[#0f4c81]/5 dark:bg-sky-900/10 border border-[#0f4c81]/20 dark:border-sky-800/30 rounded-xl p-4">
              <h3 className="font-bold text-[#0f4c81] dark:text-sky-400 text-sm mb-1">Personaliza tu CV para esta oportunidad</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">La IA analizará tu perfil y la posición para sugerir mejoras alineadas con lo que busca el reclutador.</p>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {["No inventa experiencias","No modifica tu CV original","Tú decides qué cambios aceptar","Optimiza palabras clave para ATS"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />{t}</li>
                ))}
              </ul>
            </div>

            {/* ATS */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 flex gap-3 items-start">
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed"><strong>Tu CV está optimizado para ATS.</strong> Completar más información mejora tus oportunidades de aparecer en búsquedas relevantes.</p>
            </div>

            {/* AI: Perfil */}
            {!discardedAI.has("profile") && (
              <div className="bg-white dark:bg-slate-900 border border-[#bfdbfe] dark:border-blue-900/40 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-[#eff6ff] dark:bg-blue-900/20 px-4 py-2 border-b border-[#bfdbfe] dark:border-blue-900/40 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0f4c81] dark:text-sky-400" />
                  <span className="text-xs font-bold text-[#0f4c81] dark:text-sky-400 tracking-wider">PERFIL PROFESIONAL OPTIMIZADO</span>
                  {acceptedAI.has("profile") && <Badge className="ml-auto bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-0 text-[10px]">✓ Aceptado</Badge>}
                </div>
                <div className="p-5">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm mb-5">
                    Ingeniera de Software Full-Stack especializada en ecosistemas escalables con{" "}
                    <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 px-1 rounded font-medium">4+ años de trayectoria</span>{" "}
                    transformando requisitos complejos en soluciones técnicas de alto rendimiento. Experta en el stack MERN y metodologías ágiles, con enfoque probado en optimización de latencia y liderazgo de equipos técnicos.
                  </p>
                  {!acceptedAI.has("profile") ? (
                    <div className="flex gap-3">
                      <Button className="bg-[#0f4c81] dark:bg-sky-600 hover:bg-[#0b3a63] dark:hover:bg-sky-500 text-white flex-1 text-sm" onClick={() => acceptAI("profile", "Ingeniera de Software Full-Stack especializada en ecosistemas escalables con 4+ años de trayectoria transformando requisitos complejos en soluciones técnicas de alto rendimiento.")}>
                        <Check className="w-4 h-4 mr-2" />Aceptar
                      </Button>
                      <Button variant="outline" className="flex-1 text-sm dark:border-slate-700" onClick={() => discardAI("profile")}><X className="w-4 h-4 mr-2" />Descartar</Button>
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 dark:text-green-500 font-medium">✓ Cambio aplicado a tu CV</p>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Razonamiento AI:</span> Se incluyeron palabras clave de la vacante y se cuantificó el impacto profesional.
                </div>
              </div>
            )}

            {/* AI: Experiencia */}
            {!discardedAI.has("experience") && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center">
                  <span className="text-xs font-bold text-[#0f4c81] dark:text-sky-400 tracking-wider">EXPERIENCIA REESTRUCTURADA</span>
                  {acceptedAI.has("experience") && <Badge className="ml-auto bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-0 text-[10px]">✓ Aceptado</Badge>}
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">TechSoluciones | Desarrollador Senior</h4>
                  <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Logros Clave</p>
                  <div className="space-y-3 mb-5">
                    {[
                      <span key="1">Liderazgo técnico de equipo de 5 ingenieros, <span className="text-[#0f4c81] dark:text-sky-400 font-semibold">+25% velocidad de entrega</span>.</span>,
                      <span key="2">Optimización React Front-end: <span className="text-[#0f4c81] dark:text-sky-400 font-semibold">-40% tiempos de carga para 1M+ usuarios</span>.</span>,
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-slate-700 dark:text-slate-300 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                  {!acceptedAI.has("experience") ? (
                    <div className="flex gap-3">
                      <Button className="bg-[#0f4c81] dark:bg-sky-600 hover:bg-[#0b3a63] dark:hover:bg-sky-500 text-white px-6 text-sm" onClick={() => acceptAI("experience")}>Aceptar</Button>
                      <Button variant="outline" className="px-6 text-sm dark:border-slate-700" onClick={() => discardAI("experience")}>Descartar</Button>
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 dark:text-green-500 font-medium">✓ Cambio aplicado</p>
                  )}
                </div>
              </div>
            )}

            {/* Habilidades sugeridas */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-800 dark:text-green-400 text-sm">Habilidades Sugeridas</h3>
              </div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {["GraphQL", "AWS S3", "Microservices"].map((s) => (
                  <button
                    key={s}
                    disabled={cv.skills.includes(s)}
                    onClick={() => setCV((c) => ({ ...c, skills: [...c.skills, s] }))}
                    className="px-3 py-1.5 bg-white dark:bg-green-900/40 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-300 rounded-full text-xs font-medium shadow-sm hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors disabled:opacity-40 disabled:cursor-default"
                  >
                    {cv.skills.includes(s) ? `✓ ${s}` : `+ ${s}`}
                  </button>
                ))}
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 italic">Estas habilidades aparecen frecuentemente en el perfil del cargo solicitado.</p>
            </div>

          </div>


        </div>

      </div>
    </div>
  );
}
