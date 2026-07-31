import React, { useState, useEffect } from "react";
import { Terminal, Play, Folder, FileCode, CheckCircle2, AlertTriangle } from "lucide-react";

export const PythonExplorer: React.FC = () => {
  const [files, setFiles] = useState<{ path: string; name: string; content: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("run_tests.py");
  const [testOutput, setTestOutput] = useState<string>("");
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/python/files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files && data.files.length > 0) {
          setFiles(data.files);
        }
      })
      .catch((err) => console.error("Failed to load python files", err));
  }, []);

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTestOutput("Exécution de python3 run_tests.py...");
    fetch("/api/python/run-tests")
      .then((res) => res.json())
      .then((data) => {
        setIsRunningTests(false);
        setTestOutput(data.output || "Terminé avec succès.");
        setTestSuccess(data.success);
      })
      .catch((err) => {
        setIsRunningTests(false);
        setTestOutput("Erreur lors de l'exécution des tests: " + err.message);
        setTestSuccess(false);
      });
  };

  const activeFileObj = files.find((f) => f.path === selectedFile) || files[0];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded uppercase font-mono">
              Architecture Python
            </span>
            <span className="text-[10px] text-slate-500 font-mono">14 MOTEURS MODULAIRES & PYTEST</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-mono">
            Explorez le code source Python (`prudence_engine/`) et lancez les tests d'intégration.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunningTests}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all active:scale-95 font-mono uppercase tracking-wider"
        >
          <Play className={`w-3.5 h-3.5 ${isRunningTests ? "animate-spin" : ""}`} />
          {isRunningTests ? "Exécution Pytest..." : "Exécuter run_tests.py"}
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* File List Tree */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 max-h-96 overflow-y-auto font-mono text-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5 border-b border-slate-800">
            <Folder className="w-3.5 h-3.5 text-cyan-400" />
            Arborescence du Projet
          </div>
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file.path)}
              className={`p-2 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer ${
                selectedFile === file.path
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <span className="truncate pr-2">{file.path}</span>
              <FileCode className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Code Viewer Panel */}
        <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-96">
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
            <span>{activeFileObj?.path || "fichier sélectionné"}</span>
            <span className="text-slate-500 text-[10px]">Python 3.12+</span>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-all leading-relaxed max-h-80 overflow-y-auto">
            <code>{activeFileObj?.content || "# Chargement..."}</code>
          </pre>
        </div>
      </div>

      {/* Terminal Output Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs flex flex-col">
        <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Console d'Exécution Pytest
          </span>
          {testSuccess !== null && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                testSuccess ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {testSuccess ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {testSuccess ? "TOUS LES TESTS VALIDÉS" : "ÉCHEC DE TEST"}
            </span>
          )}
        </div>
        <pre className="p-4 text-xs font-mono text-cyan-300 bg-slate-950/90 max-h-48 overflow-y-auto whitespace-pre-wrap">
          <code>{testOutput || 'Cliquez sur "Exécuter run_tests.py" pour démarrer la suite de tests.'}</code>
        </pre>
      </div>
    </div>
  );
};

