import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { FaBolt } from "react-icons/fa";

const languages = [
  { code: "python", name: "Python" },
  { code: "javascript", name: "JavaScript" },
  { code: "java", name: "Java" },
  { code: "cpp", name: "C++" },
  { code: "rust", name: "Rust" },
  { code: "php", name: "PHP" },
  { code: "html", name: "HTML" }, // HTML is usually static code, so this can be handled separately
];

const App = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [ws, setWs] = useState(null);
  const [status, setStatus] = useState('#991b1b')
  const [error, setError] = useState(null);

  const wsRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("wss://compiler.skillshikshya.com/ws/compiler/");
    setWs(socket);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connection established.");
      setStatus(true);
    };

    socket.onmessage = (event) => {
      console.log("Message received");
      try {
        const message = JSON.parse(event.data);
        if (message.type === "stdout") {
          setOutput((prevOutput) => prevOutput + message.data);
        } else if (message.type === "error") {
          setError(message.data);
        }
      } catch (err) {
        setError("Error parsing the response from server.");
        console.error("Error parsing WebSocket message", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("WebSocket error occurred");
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
      setStatus(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleRunCode = () => {
    if (ws && code.trim() !== "") {
      const payload = {
        command: "run",
        code,
        language,
        input,
      };

      ws.send(JSON.stringify(payload));
      setIsRunning(true);
      setOutput("");
      setError(null);
    }
  };

  const handleStopCode = () => {
    if (ws) {
      const stopPayload = {
        command: "stop",
      };
      ws.send(JSON.stringify(stopPayload));
      setIsRunning(false);
    }
  };


  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleClearOutput = () => {
    setOutput(""); // Clear the output
    setError(null); // Clear any previous errors
  };

  return (
    <div className="App">
      <div className="flex justify-between bg-slate-700 text-gray-200 p-5">
        <div className="flex items-center justify-center">
          <div className="border-2 border-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
            <FaBolt className="" />
          </div>
          <div>
            <h1 className="m-0 ml-3 text-xl font-semibold">Code Runner</h1>
          </div>
        </div>
        <div className="flex">
          <div className="flex items-center">
            Status
            <span className={`status ${status ? 'online' : 'offline'}`}></span>
          </div>
          <select value={language} onChange={handleLanguageChange} className="text-slate-700">
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <div className="buttons ml-4">
            <button onClick={handleRunCode} disabled={isRunning}>
              Run
            </button>
            <button onClick={handleStopCode} disabled={!isRunning}>
              Stop
            </button>
          </div>
        </div>
      </div>

      <div className="editor-container flex flex-wrap justify-between mt-2 gap-2 mx-5">
        <div className="editor flex-1">
          <div className="h-12 flex items-center">
            <h2>Input</h2>
          </div>
          <textarea
            value={code}
            onChange={handleCodeChange}
            placeholder="Enter your code here"
            rows="10"
            cols="50"
          />

          <label>Input (optional)</label>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Enter input here"
            rows="4"
            cols="50"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center h-12">
            <h2>Output</h2>
            <button onClick={handleClearOutput}>Clear</button>
          </div>
          <div className="output flex w-full min-w-full h-[410px]">
            <pre className="w-full overflow-auto whitespace-pre-wrap break-words p-3">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;