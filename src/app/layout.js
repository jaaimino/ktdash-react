import localFont from "next/font/local";
import { MantineProvider } from "@mantine/core";
import { theme } from "@/theme";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import AppContextProvider from "@/hooks/app-context";
import App from "@/components/app-shell";
import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { auth } from "@/auth";

const oswald = localFont({
  src: "../assets/Oswald-VariableFont_wght.ttf",
  variable: "--font-oswald",
  weight: "100 900",
});

export const metadata = {
  title: "KTDash",
  description: "A web-based application for running your KillTeam games",
};

export default async function RootLayout({ children }) {
  const session = await auth();
  console.log("session", session);
  return (
    <html lang="en">
      <body
        className={`${oswald.className}`}
        style={{ backgroundColor: "#242424" }}
      >
        <MantineProvider defaultColorScheme="dark" theme={theme}>
          <AppContextProvider>
            <Notifications />
            <ModalsProvider>
              <SessionProvider session={session}>
                <App>{children}</App>
              </SessionProvider>
            </ModalsProvider>
          </AppContextProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
