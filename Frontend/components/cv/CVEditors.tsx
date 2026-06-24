"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Save, Plus, Trash2 } from "lucide-react";
import type { Experience } from "./CVTypes";

// ── Modal de confirmación ────────────────────────────────────────────────────
export function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-red-100">
        <p className="text-slate-700 mb-5 text-sm">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancelar</Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>Eliminar</Button>
        </div>
      </div>
    </div>
  );
}

// ── Formulario inline para experiencia ───────────────────────────────────────
export function ExperienceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Experience;
  onSave: (exp: Experience) => void;
  onCancel: () => void;
}) {
  const [role, setRole] = useState(initial?.role ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [period, setPeriod] = useState(initial?.period ?? "");
  const [bullets, setBullets] = useState<string[]>(initial?.bullets ?? [""]);

  const updateBullet = (i: number, v: string) => setBullets((b) => b.map((x, j) => (j === i ? v : x)));
  const addBullet = () => setBullets((b) => [...b, ""]);
  const removeBullet = (i: number) => setBullets((b) => b.filter((_, j) => j !== i));

  const handleSave = () => {
    if (!role.trim() || !company.trim()) return;
    onSave({
      id: initial?.id ?? `exp-${Date.now()}`,
      role: role.trim(),
      company: company.trim(),
      period: period.trim(),
      bullets: bullets.filter((b) => b.trim()),
    });
  };

  const input = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400";

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Cargo *</label>
          <input className={input} placeholder="Ej. Desarrollador Frontend" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Empresa *</label>
          <input className={input} placeholder="Ej. TechCorp" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Período</label>
        <input className={input} placeholder="Ej. 2022 – Presente" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Logros / Responsabilidades</label>
        {bullets.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className={input + " flex-1"} placeholder={`Logro ${i + 1}`} value={b} onChange={(e) => updateBullet(i, e.target.value)} />
            {bullets.length > 1 && (
              <button aria-label={`Eliminar logro ${i + 1}`} onClick={() => removeBullet(i)} className="p-2 text-red-400 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addBullet} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
          <Plus className="w-3 h-3" /> Agregar logro
        </button>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3.5 h-3.5 mr-1" />Cancelar</Button>
        <Button size="sm" className="bg-[#0f4c81] text-white hover:bg-[#0b3a63]" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1" />Guardar</Button>
      </div>
    </div>
  );
}

// ── Formulario de habilidades ────────────────────────────────────────────────
export function SkillsEditor({
  skills,
  onAdd,
  onRemove,
}: {
  skills: string[];
  onAdd: (s: string) => void;
  onRemove: (s: string) => void;
}) {
  const [input, setInput] = useState("");
  const submit = () => {
    const v = input.trim();
    if (v && !skills.includes(v)) { onAdd(v); setInput(""); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-red-50 text-slate-700 rounded-full text-xs font-medium border border-transparent hover:border-red-200 transition-all group/sk cursor-default">
            {s}
            <button aria-label={`Eliminar habilidad ${s}`} onClick={() => onRemove(s)} className="opacity-0 group-hover/sk:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="text-xs border border-dashed border-slate-300 rounded-full px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 w-40"
          placeholder="Nueva habilidad..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button onClick={submit} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Agregar
        </button>
      </div>
    </div>
  );
}

// ── Formulario de educación ──────────────────────────────────────────────────
export function EducationForm({ onSave, onCancel }: { onSave: (e: { institution: string; degree: string; period: string }) => void; onCancel: () => void }) {
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [period, setPeriod] = useState("");
  const inp = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200";
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 mt-3">
      <input className={inp} placeholder="Institución *" value={institution} onChange={(e) => setInstitution(e.target.value)} />
      <input className={inp} placeholder="Grado / Carrera *" value={degree} onChange={(e) => setDegree(e.target.value)} />
      <input className={inp} placeholder="Período (ej. 2018 – 2022)" value={period} onChange={(e) => setPeriod(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3.5 h-3.5 mr-1" />Cancelar</Button>
        <Button size="sm" className="bg-[#0f4c81] text-white hover:bg-[#0b3a63]" onClick={() => { if (institution && degree) onSave({ institution, degree, period }); }}>
          <Save className="w-3.5 h-3.5 mr-1" />Guardar
        </Button>
      </div>
    </div>
  );
}
