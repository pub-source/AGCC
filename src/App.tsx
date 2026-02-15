import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChurchSelection from "./pages/ChurchSelection";
import VerifyEmail from "./pages/VerifyEmail";
import PendingApproval from "./pages/PendingApproval";
import Events from "./pages/Events";
import Sermons from "./pages/Sermons";
import Giving from "./pages/Giving";
import Missions from "./pages/Missions";
import Dashboard from "./pages/Dashboard";
import UserApproval from "./pages/admin/UserApproval";
import SermonManager from "./pages/admin/SermonManager";
import SongManager from "./pages/admin/SongManager";
import EventManager from "./pages/admin/EventManager";
import FinancialManager from "./pages/admin/FinancialManager";
import Songs from "./pages/Songs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<ChurchSelection />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/events" element={<Events />} />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/giving" element={<Giving />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/users" element={<UserApproval />} />
          <Route path="/dashboard/sermons" element={<SermonManager />} />
          <Route path="/dashboard/songs" element={<SongManager />} />
          <Route path="/dashboard/events" element={<EventManager />} />
          <Route path="/dashboard/finances" element={<FinancialManager />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
