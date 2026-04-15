import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch("http://localhost:3000/api/health")
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          setStatus("Backend OK");
        } else {
          setStatus("Error");
        }
      })
      .catch(() => setStatus("Cannot connect"));
  }, []);

  return <div>{status}</div>;
}

export default App;