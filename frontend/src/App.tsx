import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ConsoleLayout from "./pages/console/ConsoleLayout";
import Keys from "./pages/console/Keys";
import Overview from "./pages/console/Overview";
import Playground from "./pages/console/Playground";
import Quickstart from "./pages/console/Quickstart";

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/console"
        element={
          <RequireAuth>
            <ConsoleLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="playground" element={<Playground />} />
        <Route path="keys" element={<Keys />} />
        <Route path="quickstart" element={<Quickstart />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
