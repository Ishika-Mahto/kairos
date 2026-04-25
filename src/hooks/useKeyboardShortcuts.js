import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger on Ctrl/Cmd + key combinations or single keys
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + K: Toggle command palette (can be expanded later)
      if (isCtrlOrCmd && e.key === "k") {
        e.preventDefault();
        // Could trigger a command palette modal
      }

      // D: Go to Dashboard
      if (e.key === "d" && !isCtrlOrCmd && !e.shiftKey) {
        if (!["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
          navigate("/dashboard");
        }
      }

      // T: Go to Tracker
      if (e.key === "t" && !isCtrlOrCmd && !e.shiftKey) {
        if (!["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
          navigate("/tracker");
        }
      }

      // I: Go to Insights
      if (e.key === "i" && !isCtrlOrCmd && !e.shiftKey) {
        if (!["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
          navigate("/insights");
        }
      }

      // Ctrl/Cmd + S: Save/Submit (can be customized per page)
      if (isCtrlOrCmd && e.key === "s") {
        e.preventDefault();
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.click();
        }
      }

      // Ctrl/Cmd + E: Export
      if (isCtrlOrCmd && e.key === "e") {
        e.preventDefault();
        const exportBtn = document.querySelector(".export-btn");
        if (exportBtn) {
          exportBtn.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
