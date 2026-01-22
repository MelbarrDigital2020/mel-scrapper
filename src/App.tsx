import { BrowserRouter } from "react-router-dom";
import AppRouter from "./app/router";
import { ToastProvider } from "./pages/shared/toast/ToastContext.tsx";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
