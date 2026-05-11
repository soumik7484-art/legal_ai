import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Legal Guardian Angel",
  description: "Your AI-powered legal assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#030014] text-white min-h-screen antialiased selection:bg-purple-500/30`}>
        <AuthProvider>
          <div className="relative min-h-screen overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px] -z-10" />
            
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
