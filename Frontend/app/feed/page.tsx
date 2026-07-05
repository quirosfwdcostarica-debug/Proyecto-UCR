"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart, MessageCircle, Trash2, ImageIcon, Loader2, Send, X, User as UserIcon, Globe2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import {
  getFeed, crearPublicacion, eliminarPublicacion,
  toggleReaccion, getComentarios, agregarComentario, eliminarComentario,
} from "@/actions/feed.actions";

interface Publicacion {
  id: string;
  contenido: string;
  imagen_url: string | null;
  created_at: string;
  autor_id: string;
  autor_nombre: string;
  autor_foto: string | null;
  autor_tipo: string | null;
  total_reacciones: number;
  total_comentarios: number;
  ya_reaccione: boolean;
  es_mio: boolean;
  puede_eliminar: boolean;
}

interface Comentario {
  id: string;
  contenido: string;
  created_at: string;
  autor_id: string;
  autor_nombre: string;
  autor_foto: string | null;
  autor_tipo: string | null;
  puede_eliminar: boolean;
}

function tiempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-CR");
}

function tipoLabel(tipo: string | null) {
  if (tipo === "EXALUMNO") return "Exalumno";
  if (tipo === "ESTUDIANTE") return "Estudiante";
  if (tipo === "ADMIN") return "Admin";
  return "";
}

function Avatar({ foto, nombre, size = 40 }: { foto: string | null; nombre: string; size?: number }) {
  return (
    <div
      className="rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {foto ? (
        <img src={foto} alt={nombre} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-slate-400">{nombre.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

// ─── Composer ──────────────────────────────────────────────────────────────────

function Composer({ onPublished }: { onPublished: () => void }) {
  const [contenido, setContenido] = useState("");
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSubiendo(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "imagenes");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dd69q4ba3";
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      setImagenUrl(data.secure_url);
    } catch {
      toast({ title: "Error", description: "No se pudo subir la imagen.", variant: "destructive" });
    } finally {
      setSubiendo(false);
    }
  };

  const handlePublicar = async () => {
    if (!contenido.trim() && !imagenUrl) return;
    setPublicando(true);
    try {
      await crearPublicacion(contenido, imagenUrl);
      setContenido("");
      setImagenUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      onPublished();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo publicar.", variant: "destructive" });
    } finally {
      setPublicando(false);
    }
  };

  return (
    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Comparte algo con la comunidad UCR: un logro, una oportunidad, un consejo..."
        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#005da4] focus:ring-2 focus:ring-[#005da4]/20 resize-none"
      />

      {imagenUrl && (
        <div className="relative mt-3 inline-block">
          <img src={imagenUrl} alt="Adjunto" className="max-h-52 rounded-xl border border-slate-200 dark:border-slate-700" />
          <button
            onClick={() => { setImagenUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
            className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md hover:bg-slate-900"
            aria-label="Quitar imagen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <label className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#005da4] cursor-pointer font-medium">
          {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {subiendo ? "Subiendo..." : "Imagen"}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} disabled={subiendo} className="hidden" />
        </label>
        <Button
          onClick={handlePublicar}
          disabled={publicando || subiendo || (!contenido.trim() && !imagenUrl)}
          className="bg-[#005da4] hover:bg-[#004a83] text-white"
        >
          {publicando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {publicando ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </Card>
  );
}

// ─── Sección de comentarios ──────────────────────────────────────────────────

function Comentarios({ publicacionId, onCountChange }: { publicacionId: string; onCountChange: (n: number) => void }) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevo, setNuevo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { toast } = useToast();
  const { showConfirm } = useDialog();

  const load = () => {
    getComentarios(publicacionId)
      .then((d) => {
        const list = d as Comentario[];
        setComentarios(list);
        onCountChange(list.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [publicacionId]);

  const handleEnviar = async () => {
    if (!nuevo.trim()) return;
    setEnviando(true);
    try {
      await agregarComentario(publicacionId, nuevo);
      setNuevo("");
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    const ok = await showConfirm("¿Eliminar este comentario?", { title: "Eliminar comentario", confirmLabel: "Eliminar", variant: "error" });
    if (!ok) return;
    try {
      await eliminarComentario(id);
      load();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
      <div className="flex gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
          placeholder="Escribe un comentario..."
          maxLength={1000}
          className="flex-1 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#005da4]"
        />
        <Button size="sm" onClick={handleEnviar} disabled={enviando || !nuevo.trim()} className="bg-[#005da4] hover:bg-[#004a83] text-white rounded-full px-4">
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-2">Cargando comentarios...</p>
      ) : comentarios.length === 0 ? (
        <p className="text-xs text-slate-400 py-1">Sé el primero en comentar.</p>
      ) : (
        comentarios.map((c) => (
          <div key={c.id} className="flex gap-2.5 group">
            <Avatar foto={c.autor_foto} nombre={c.autor_nombre} size={32} />
            <div className="flex-1 min-w-0">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{c.autor_nombre}</span>
                  {c.autor_tipo && <span className="text-[10px] text-slate-400">{tipoLabel(c.autor_tipo)}</span>}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 break-words">{c.contenido}</p>
              </div>
              <span className="text-[10px] text-slate-400 ml-3">{tiempoRelativo(c.created_at)}</span>
            </div>
            {c.puede_eliminar && (
              <button
                onClick={() => handleEliminar(c.id)}
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1"
                aria-label="Eliminar comentario"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Tarjeta de publicación ──────────────────────────────────────────────────

function PublicacionCard({ pub, onChange }: { pub: Publicacion; onChange: () => void }) {
  const [reaccionado, setReaccionado] = useState(pub.ya_reaccione);
  const [totalReacciones, setTotalReacciones] = useState(pub.total_reacciones);
  const [totalComentarios, setTotalComentarios] = useState(pub.total_comentarios);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const { toast } = useToast();
  const { showConfirm } = useDialog();

  const handleLike = async () => {
    // Optimista
    const prev = reaccionado;
    setReaccionado(!prev);
    setTotalReacciones((n) => n + (prev ? -1 : 1));
    try {
      await toggleReaccion(pub.id);
    } catch (err: any) {
      setReaccionado(prev);
      setTotalReacciones((n) => n + (prev ? 1 : -1));
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEliminar = async () => {
    const ok = await showConfirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.", {
      title: "Eliminar publicación", confirmLabel: "Eliminar", variant: "error",
    });
    if (!ok) return;
    try {
      await eliminarPublicacion(pub.id);
      onChange();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-start gap-3">
        <Link href={`/perfil/${pub.autor_id}`}>
          <Avatar foto={pub.autor_foto} nombre={pub.autor_nombre} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/perfil/${pub.autor_id}`} className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:underline truncate">
              {pub.autor_nombre}
            </Link>
            {pub.autor_tipo && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {tipoLabel(pub.autor_tipo)}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">{tiempoRelativo(pub.created_at)}</span>
        </div>
        {pub.puede_eliminar && (
          <button onClick={handleEliminar} className="text-slate-300 hover:text-red-500 transition-colors" aria-label="Eliminar publicación">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {pub.contenido && (
        <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 whitespace-pre-wrap break-words">{pub.contenido}</p>
      )}
      {pub.imagen_url && (
        <img src={pub.imagen_url} alt="Publicación" className="mt-3 rounded-xl border border-slate-100 dark:border-slate-800 max-h-[500px] w-auto" />
      )}

      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLike}
          className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
            reaccionado ? "text-red-500" : "text-slate-500 hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${reaccionado ? "fill-red-500" : ""}`} />
          {totalReacciones > 0 && totalReacciones}
          <span className="hidden sm:inline">Me gusta</span>
        </button>
        <button
          onClick={() => setMostrarComentarios((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#005da4] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {totalComentarios > 0 && totalComentarios}
          <span className="hidden sm:inline">Comentar</span>
        </button>
      </div>

      {mostrarComentarios && (
        <Comentarios
          publicacionId={pub.id}
          onCountChange={(n) => setTotalComentarios(n)}
        />
      )}
    </Card>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);

  const tipo = (session?.user as any)?.tipo;
  const puedePublicar = tipo === "ESTUDIANTE" || tipo === "EXALUMNO";
  const esAdmin = tipo === "ADMIN";

  const load = () => {
    getFeed()
      .then((d) => setPublicaciones(d as Publicacion[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    // Estudiantes y exalumnos participan; el admin entra a moderar (sin publicar).
    if (tipo !== "ESTUDIANTE" && tipo !== "EXALUMNO" && tipo !== "ADMIN") { router.replace("/"); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-full flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#005da4]" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-bold text-[#005da4] tracking-wider uppercase mb-1 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5" /> Comunidad UCR
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feed de la Comunidad</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Conecta con estudiantes y exalumnos de la UCR: comparte logros, oportunidades y consejos.
          </p>
        </div>

        {puedePublicar && <Composer onPublished={load} />}
        {esAdmin && (
          <div className="text-xs text-slate-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            Estás viendo el feed como <span className="font-semibold">administrador</span>. Puedes eliminar cualquier publicación o comentario para moderar la comunidad.
          </div>
        )}

        {publicaciones.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center text-slate-400">
            <UserIcon className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">Todavía no hay publicaciones.</p>
            <p className="text-sm mt-1">¡Sé el primero en compartir algo con la comunidad!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publicaciones.map((pub) => (
              <PublicacionCard key={pub.id} pub={pub} onChange={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
