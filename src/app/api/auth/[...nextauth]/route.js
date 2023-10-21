import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
    session: {
        strategy: "jwt",
        maxAge: 4 * 60 * 60 // 4 hours,
        //maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers:[
        CredentialsProvider({
            name: 'my-project',
            credentials: {
                email: {
                    label: 'email',
                    type: 'email',
                    placeholder: 'jsmith@example.com',
                },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                const res = await fetch('https://dummyjson.com/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: credentials.email,
                        password: credentials.password,
                    }),
                    headers: {'Content-Type': 'application/json',},
                });
                const user = await res.json();
                if (!res.ok) {
                    throw new Error(user.message);
                }
                if (res.ok && user) {
                    return user;
                }
                return null;
                //const user = {id: "1"};
                //return user;
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

    // callbacks: {
    //     async jwt({ token, user, account }) {
    //       if (account && user) {
    //         return {
    //           ...token,
    //           accessToken: user.token,
    //           refreshToken: user.refreshToken,
    //         }
    //       }
    
    //       return token
    //     },
    
    //     async session({ session, token }) {
    //       session.user.accessToken = token.accessToken
    //       session.user.refreshToken = token.refreshToken
    //       session.user.accessTokenExpires = token.accessTokenExpires
    
    //       return session
    //     },
    //   }
   
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }