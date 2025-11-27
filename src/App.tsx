import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PatientView from "./pages/PatientView";
import DonorView from "./pages/DonorView";
import PatientDetail from "./pages/PatientDetail";
import DonorDetail from "./pages/DonorDetail";
import Notifications from "./pages/Notifications";
import ConferenceCallsSimple from "./pages/ConferenceCallsSimple";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<PatientView />} />
          <Route path="/donors" element={<DonorView />} />
          <Route path="/patient/:id" element={<PatientDetail />} />
          <Route path="/donor/:id" element={<DonorDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/conference-calls" element={<ConferenceCallsSimple />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
