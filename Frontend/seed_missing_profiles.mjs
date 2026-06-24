import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
for (const line of readFileSync(new URL("./.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (!(m[1] in process.env)) process.env[m[1]] = v;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ALUMNI_BIOS = [
  "Profesional con más de 10 años de experiencia en el sector financiero. Actualmente busco conectar con nuevos talentos de la UCR para mentorías y oportunidades de desarrollo en banca y finanzas.",
  "Especialista en desarrollo de software y arquitecturas cloud. Mi pasión es ayudar a los estudiantes a dar sus primeros pasos en la industria tecnológica brindando asesoría y apoyo en proyectos open-source.",
  "Investigadora en biotecnología aplicada. Me dedico a la gestión de proyectos de innovación agrícola. Siempre dispuesta a compartir mi trayectoria y guiar a futuros científicos de la UCR.",
  "Gestor de proyectos de impacto social. Tras graduarme, fundé una ONG dedicada al desarrollo sostenible en zonas rurales. Busco alumnos interesados en realizar voluntariado o prácticas con propósito.",
  "Consultor estratégico para PYMES en Centroamérica. Mi objetivo es fortalecer el ecosistema emprendedor aportando conocimientos, networking profesional y oportunidades laborales a los graduados recientes."
];

const ESTUDIANTE_BIOS = [
  "Estudiante de último año apasionado por la inteligencia artificial. Busco oportunidades para aplicar mis conocimientos en proyectos reales y conectar con mentores de la industria.",
  "Actualmente cursando mi bachillerato con alto interés en sostenibilidad y energías renovables. Busco pasantías donde pueda contribuir al desarrollo de soluciones ecológicas.",
  "Desarrolladora en formación, me encanta el diseño de interfaces y la experiencia de usuario (UX/UI). Estoy buscando proyectos donde pueda poner en práctica mis habilidades y construir un portafolio sólido.",
  "Estudiante activo en asociaciones estudiantiles, enfocado en el liderazgo y la gestión de equipos. Me interesa conectar con exalumnos para recibir consejos de carrera y explorar oportunidades de voluntariado.",
  "Apasionado por las finanzas corporativas y el análisis de datos. Busco mentoría de profesionales del sector para guiar mi desarrollo académico y futuras decisiones laborales."
];

function getRandomItems(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log("Fetching exalumnos...");
  const { data: exalumnos } = await supabaseAdmin.from("EXALUMNOS").select("user_id, biografia");
  
  if (exalumnos) {
    let count = 0;
    for (const ex of exalumnos) {
      if (!ex.biografia || ex.biografia.length < 10) {
        const bio = ALUMNI_BIOS[count % ALUMNI_BIOS.length];
        await supabaseAdmin.from("EXALUMNOS").update({
          biografia: bio,
          ofrece_mentoria: Math.random() > 0.3,
          ofrece_empleo: Math.random() > 0.7,
          ofrece_pasantia: Math.random() > 0.5,
          ofrece_proyecto: Math.random() > 0.4,
          ofrece_donacion_dinero: Math.random() > 0.8,
          ofrece_guest_speaking: Math.random() > 0.6,
          ofrece_volunteering: Math.random() > 0.5,
          ofrece_career_advice: Math.random() > 0.2,
          ofrece_networking: Math.random() > 0.3,
        }).eq("user_id", ex.user_id);
        count++;
      }
    }
    console.log(`Updated ${count} exalumnos.`);
  }

  console.log("Fetching estudiantes...");
  const { data: estudiantes } = await supabaseAdmin.from("ESTUDIANTES").select("user_id, proyecto_descripcion");
  
  if (estudiantes) {
    let count = 0;
    for (const est of estudiantes) {
      if (!est.proyecto_descripcion || est.proyecto_descripcion.length < 10) {
        const desc = ESTUDIANTE_BIOS[count % ESTUDIANTE_BIOS.length];
        await supabaseAdmin.from("ESTUDIANTES").update({
          proyecto_descripcion: desc,
          busca_empleo: Math.random() > 0.4,
          busca_pasantia: Math.random() > 0.3,
          busca_mentoria: Math.random() > 0.2,
          busca_financiamiento: Math.random() > 0.8,
        }).eq("user_id", est.user_id);
        count++;
      }
    }
    console.log(`Updated ${count} estudiantes.`);
  }

  console.log("Done.");
}

main().catch(console.error);
