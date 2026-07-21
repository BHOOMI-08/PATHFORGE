import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f1f5f9",
            border: "1px solid #334155",
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
