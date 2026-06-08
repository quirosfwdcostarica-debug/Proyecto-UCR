import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
import Resend from "next-auth/providers/resend"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      // Requiere la variable RESEND_API_KEY en .env
      from: "no-reply@alumni.ucr.ac.cr",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) return false;
      
      // Lógica inicial para validar el correo:
      // Los estudiantes deben usar un correo @ucr.ac.cr.
      // Esta validación más profunda la extenderemos al registrar los perfiles.
      return true;
    },
    async session({ session, user }) {
      // Agregar el rol del usuario a la sesión
      if (session.user && user) {
        // En un caso real extendemos los tipos de NextAuth para incluir 'role'
        // session.user.role = user.role;
      }
      return session;
    }
  }
})
