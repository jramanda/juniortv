import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";
import TelegramConfig from "@/pages/TelegramConfig";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="App min-h-screen bg-[#020617] scanlines">
      <BrowserRouter>
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          {/* Mobile Navigation */}
          <MobileNav isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          
          {/* Main Content */}
          <main className="flex-1 md:ml-64 pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/telegram" element={<TelegramConfig />} />
            </Routes>
          </main>
        </div>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#0f172a',
              border: '1px solid #334155',
              color: '#f8fafc',
            },
          }}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
