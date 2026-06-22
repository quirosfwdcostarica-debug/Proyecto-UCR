export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface CVData {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
  experience: Experience[];
  skills: string[];
  education: { institution: string; degree: string; period: string }[];
  certifications: string[];
}

// Template vacío — la página mi-curriculum carga los datos reales del usuario autenticado
export const initialCV: CVData = {
  name: "",
  title: "",
  location: "San José, Costa Rica",
<<<<<<< HEAD
  email: "Yosimarvv@gmail.com",
  phone: "+506 8888-8888",
  summary:
    "Ingeniera graduada de la UCR con 4 años de experiencia en desarrollo web. Me gusta trabajar en equipo para resolver problemas complejos. Busco seguir creciendo profesionalmente.",
  experience: [
    {
      id: "exp-1",
      role: "Desarrollador Senior",
      company: "TechSoluciones",
      period: "2021 – Presente",
      bullets: [
        "Lidero un equipo de 5 personas para hacer aplicaciones.",
        "Uso React y Node.js todos los días.",
        "Mejoré el tiempo de carga de la página principal.",
      ],
    },
    {
      id: "exp-2",
      role: "Junior Dev",
      company: "Startup Inc.",
      period: "2019 – 2021",
      bullets: [],
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "SQL"],
  education: [
    {
      institution: "Universidad de Costa Rica",
      degree: "Ingeniería en Computación e Informática",
      period: "2018 – 2022",
    },
  ],
=======
  email: "",
  phone: "",
  summary: "",
  experience: [],
  skills: [],
  education: [],
>>>>>>> 907fc53ecfd76e3a1553856ec28ef26b58240508
  certifications: [],
};
