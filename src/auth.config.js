export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true;
      //   const isLoggedIn = !!auth.user;
      //   // return isLoggedIn;
      //   const isOnDashboard = nextUrl.pathname.startsWith("/login");
      //   if (isOnDashboard) {
      //     return isLoggedIn;
      //     // Redirect unauthenticated users to login page
      //   } else if (isLoggedIn) {
      //     return Response.redirect(new URL("/login", nextUrl));
      //   }
      //   return true;
    },
  },
  providers: [],
};
