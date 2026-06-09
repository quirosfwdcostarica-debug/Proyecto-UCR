import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Llamar a nuestro backend Express
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" }
          });
          
          const data = await res.json();
          
          if (res.ok && data.user) {
            // Devolver el usuario junto con el token
            return {
              id: data.user.id,
              name: data.user.nombre,
              email: data.user.email,
              tipo: data.user.tipo,
              accessToken: data.accessToken,
              foto_url: data.user.foto_url
            } as any;
          }
          // Lanza un error para ser capturado en el frontend
          throw new Error(data.message || "Credenciales inválidas");
        } catch (error: any) {
          throw new Error(error.message || "Error de conexión con el servidor");
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Redirige a login con error
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
<<<<<<< HEAD
    async jwt({ token, user, trigger, session }) {
      // Guardar info del usuario y token en el JWT
      if (user) {
        token.id = user.id;
        token.tipo = (user as any).tipo;
        token.accessToken = (user as any).accessToken;
        token.foto_url = (user as any).foto_url;
      }
      
      // Permitir la actualización local de la sesión (ej. cambiar foto de perfil)
      if (trigger === "update" && session?.user?.image) {
        token.foto_url = session.user.image;
      }
      
=======
    async jwt({ token, user }) {
      // Guardar info del usuario y token en el JWT
      if (user) {
        token.id = user.id;
        token.tipo = (user as any).tipo || (user as any).role;
        token.role = (user as any).role || (user as any).tipo;
        token.accessToken = (user as any).accessToken;
        token.foto_url = (user as any).foto_url;
      }
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
      return token;
    },
    async session({ session, token }) {
      // Pasar del JWT a la sesión para que esté disponible en el cliente
      if (session.user) {
        session.user.id = token.id as string;
<<<<<<< HEAD
        session.user.image = token.foto_url as string; // Usar 'image' estándar de Next-Auth
        (session.user as any).tipo = token.tipo;
=======
        (session.user as any).tipo = token.tipo || token.role;
        (session.user as any).role = token.role || token.tipo;
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).foto_url = token.foto_url;
      }
      return session;
    }
  }
});
