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

const SEDES_UCR = [
  "Sede Rodrigo Facio",
  "Sede de Occidente",
  "Sede del Atlántico",
  "Sede de Guanacaste",
  "Sede del Pacífico",
  "Sede del Caribe",
  "Sede Interuniversitaria de Alajuela",
  "Sede del Sur",
  "Recinto de Paraíso",
  "Recinto de Guápiles",
  "Recinto de Santa Cruz"
];

const NIVELES_ACADEMICOS = [
  "Bachillerato",
  "Licenciatura",
  "Maestría",
  "Doctorado",
  "Especialidad"
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Fetching estudiantes...");
  const { data: estudiantes, error } = await supabaseAdmin.from("ESTUDIANTES").select("user_id, sede, nivel_academico");
  
  if (error) {
    console.error(error);
    return;
  }

  if (estudiantes) {
    let count = 0;
    for (const est of estudiantes) {
      // Reassign to official values to make them unique and realistic
      const sede = getRandomItem(SEDES_UCR);
      const nivel = getRandomItem(NIVELES_ACADEMICOS);
      
      await supabaseAdmin.from("ESTUDIANTES").update({
        sede: sede,
        nivel_academico: nivel
      }).eq("user_id", est.user_id);
      count++;
    }
    console.log(`Updated ${count} estudiantes with official Sede and Nivel Academico.`);
  }

  console.log("Done.");
}

main().catch(console.error);
