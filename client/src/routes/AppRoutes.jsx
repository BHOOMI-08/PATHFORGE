import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import { api } from "../utils/api";

const Home = () => {
  useEffect(() => {
    // Client-Server end-to-end handshake verification call
    api.get("/")
      .then((data) => {
        console.log("==========================================");
        console.log("Client-Server Handshake Connection: SUCCESS");
        console.log("Backend Response:", data);
        console.log("==========================================");
      })
      .catch((err) => {
        console.error("==========================================");
        console.error("Client-Server Handshake Connection: FAILED");
        console.error("Error Description:", err.message);
        console.error("==========================================");
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <h1 className="text-6xl font-display font-extrabold tracking-tight bg-gradient-to-r from-primary-light to-accent-light bg-clip-text text-transparent animate-fade-in">
        PathForge AI
      </h1>
      <p className="mt-4 text-slate-400 max-w-md text-center text-lg animate-slide-up">
        Your AI-powered resume auditing and career guidance platform.
      </p>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
