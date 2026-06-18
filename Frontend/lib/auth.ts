import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// En NextAuth v5 beta, los errores dentro de authorize() que NO sean
// instancias de CredentialsSignin se convierten en "Configuration".
// Por eso extendemos CredentialsSignin para errores conocidos.
class InvalidCredentials extends CredentialsSignin {
  code = "Credenciales inválidas";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "ucr-alumni-nextauth-secret-2026-change-in-prod",
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Usar API_URL (server-side) con fallback a NEXT_PUBLIC_API_URL
        const apiUrl =
          process.env.API_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:3001/api";

        try {
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (res.ok && data.user) {
            // Verificar que el usuario no esté suspendido
            if (data.user.status === "SUSPENDIDO") {
               throw new Error("Tu cuenta ha sido suspendida. Contacta al administrador.");
            }
            return {
              id: data.user.id,
              name: data.user.nombre,
              email: data.user.email,
              tipo: data.user.tipo,
              foto_url: data.user.foto_url,
              accessToken: data.accessToken,
            } as any;
          }

          // Lanzar CredentialsSignin para que NextAuth v5 lo propague correctamente
          throw new InvalidCredentials(data.message || "Credenciales inválidas");
        } catch (error: any) {
          // Re-lanzar si ya es CredentialsSignin (error de credenciales del backend)
          if (error instanceof CredentialsSignin) throw error;

          // Propagar errores conocidos del backend como errores de credenciales
          if (error && typeof error === "object" && "message" in error) {
            throw new InvalidCredentials(error.message || "Credenciales inválidas");
          }

          // Error de red o excepción inesperada.
          console.error("[auth] Error de conexión con el backend:", error?.message || error);
          throw new InvalidCredentials("Error de conexión con el servidor. Intenta de nuevo más tarde.");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Solo guardar los campos estrictamente necesarios en el JWT
        // para mantener la cookie pequeña y evitar el error 431
        token.id = user.id;
        token.tipo = (user as any).tipo || (user as any).role;
        token.role = (user as any).role || (user as any).tipo;
        token.foto_url = (user as any).foto_url;
        token.accessToken = (user as any).accessToken;

        // Limpiar campos innecesarios que NextAuth puede haber copiado
        // del objeto user retornado por authorize()
        delete (token as any).refreshToken;
      }

      // Actualización local de la sesión (ej. cambiar foto de perfil)
      if (trigger === "update" && session?.user?.image) {
        token.foto_url = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.foto_url as string;
        (session.user as any).tipo = token.tipo || token.role;
        (session.user as any).role = token.role || token.tipo;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).foto_url = token.foto_url;
      }
      return session;
    },
  },
});
