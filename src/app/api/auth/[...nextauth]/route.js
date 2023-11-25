import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
    session: {
        strategy: "jwt",
        maxAge: 14 * 60
        //maxAge: 1 * 60
        //maxAge: 4 * 60 * 60 // 4 hours,
        //maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers:[
        CredentialsProvider({
            name: 'my-project',
            credentials: {
                userDetails: { label: 'UserDetails'}
            },
            async authorize(credentials) {
                return JSON.parse(credentials.userDetails);
            }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/login",
    },

    callbacks: {
        async jwt({ token, user }) {
         return { ...token, ...user }
        },
        async session({ session, user, token }) {
            return token
        },
    }

}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }