"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Check, Edit2, Trash2, Download, CheckCircle2, Loader2, Lightbulb, Plus, Save, X, MapPin, Mail, Phone, Briefcase, GraduationCap, Code2, Award, Upload } from "lucide-react";
import { initialCV, type CVData, type Experience } from "@/components/cv/CVTypes";
import { ConfirmModal, ExperienceForm, SkillsEditor, EducationForm } from "@/components/cv/CVEditors";
import { OptimizePanel } from "@/components/cv/OptimizePanel";
import { ChatBot } from "@/components/cv/ChatBot";

type AISection = "profile" | "experience";

export default function CVPage() {
  const [cv, setCV] = useState<CVData>(initialCV);
  const [cvLoading, setCvLoading] = useState(true);
  const cvRef = useRef<HTMLDivElement>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Cargar datos reales del usuario autenticado al montar
  useEffect(() => {
    fetch("/api/curriculum")
      .then((r) => r.json())
      .then((data) => {
        if (data?.name !== undefined) {
          setCV({
            name: data.name || "",
            title: data.title || "",
            location: data.location || "San José, Costa Rica",
            email: data.email || "",
            phone: data.phone || "",
            summary: data.summary || "",
            experience: Array.isArray(data.experience) ? data.experience : [],
            skills: Array.isArray(data.skills) ? data.skills : [],
            education: Array.isArray(data.education) ? data.education : [],
            certifications: Array.isArray(data.certifications) ? data.certifications : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setCvLoading(false));
  }, []);

  const handleDownloadPDF = async () => {
    if (!cvRef.current) return;
    try {
      setDownloadingPDF(true);
      const canvas = await html2canvas(cvRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Mi_CV_${cv.name.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert("Hubo un error al generar el PDF.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Helper to apply a suggestion to the CV
  const applySuggestion = (currentCV: any, suggestion: any) => {
    const { section, changes } = suggestion;
    const newCV = { ...currentCV };
    if (section === "all" || section === "profile") {
      // shallow merge for top-level fields
      Object.assign(newCV, changes);
    }
    if (section === "experience" || section === "all") {
      if (changes.add) {
        newCV.experience = [...(newCV.experience || []), ...changes.add];
      }
      if (changes.update) {
        newCV.experience = (newCV.experience || []).map((exp: any) =>
          changes.update[exp.id] ? { ...exp, ...changes.update[exp.id] } : exp
        );
      }
      if (changes.remove) {
        newCV.experience = (newCV.experience || []).filter((exp: any) => !changes.remove.includes(exp.id));
      }
    }
    if (section === "skills" || section === "all") {
      if (changes.add) {
        newCV.skills = Array.from(new Set([...(newCV.skills || []), ...changes.add]));
      }
      if (changes.remove) {
        newCV.skills = (newCV.skills || []).filter((s: string) => !changes.remove.includes(s));
      }
    }
    // other sections (education, certifications) can be handled similarly if needed
    return newCV;
  };

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
  const [uploadingCV, setUploadingCV] = useState(false);

  const handleUploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCV(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/cv/extract", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error extrayendo texto");
      const data = await res.json();
      setCV(c => ({ ...c, summary: data.text }));
      alert("CV cargado y texto extraído al perfil.");
    } catch (error) {
      console.error(error);
      alert("Error procesando el archivo");
    } finally {
      setUploadingCV(false);
      e.target.value = ''; // reset input
    }
  };

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

  if (cvLoading) {
    return (
      <div className="min-h-full bg-[#f0f4f8] dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
          <p className="text-sm text-slate-500">Cargando tu curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f0f4f8] dark:bg-slate-950 flex flex-col transition-colors duration-300">

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
            <label className="relative cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              {uploadingCV ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingCV ? "Extrayendo..." : "Cargar CV (.pdf, .docx, .txt)"}
              <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleUploadCV} disabled={uploadingCV} />
            </label>
            <Badge className="bg-[#dcfce7] dark:bg-green-900/40 text-[#166534] dark:text-green-400 hover:bg-[#dcfce7] dark:hover:bg-green-900/60 border-0 px-3 py-1 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-1.5" /> Análisis AI Activo
            </Badge>
            <span className="text-slate-600 dark:text-slate-400 font-medium">Completa tu perfil para obtener un puntaje de IA</span>
          </div>
          <div className="flex gap-3 border-l border-slate-200 dark:border-slate-700 pl-6">
            <Button variant="outline" className="border-slate-300 dark:border-slate-700 dark:text-slate-300" onClick={handleDownloadPDF} disabled={downloadingPDF}>
              {downloadingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} 
              {downloadingPDF ? "Generando..." : "Descargar PDF"}
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

          <div ref={cvRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
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

            {/* Info: las sugerencias de IA se generan en base al perfil real cargado */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Sugerencias personalizadas</h3>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Las sugerencias de IA se generan a partir de tu perfil real. Completa tu experiencia laboral y habilidades en el editor de la izquierda para recibir recomendaciones más precisas.
              </p>
            </div>

            {/* ── OPTIMIZACIÓN IA CON GROK ───────────────────────────── */}
            <OptimizePanel cv={cv} />

            {/* ── ASISTENTE INTERACTIVO CAREERBOT ────────────────────── */}
            <ChatBot cv={cv} onUpdateCV={setCV} />

          </div>


        </div>

      </div>
    </div>
  );
}
