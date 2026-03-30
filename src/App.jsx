import React, { useState, useEffect } from "react";
import "./App.css";

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

function App() {
  const [banList, setBanList] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(false);  
  const [loading, setLoading] = useState(false);

  const handleSetApiKey = (key) => {
    setApiKey(key);
  };

  const randomDate = () => {
    const start = new Date(1995, 5, 16);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split("T")[0];
  };

  const toggleBan = (value) => {
    if (!value) return;
    setBanList((prev) =>
      prev.includes(value) ? prev.filter((b) => b !== value) : [...prev, value]
    );
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const date = randomDate();
      const response = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${ACCESS_KEY}&date=${date}`
      );

      const data = await response.json();

      setCurrent(data);
      setHistory((prev) => [data, ...prev]);
    } catch (error) {
      setError("Failed");
    } finally {
      setLoading(false);
    }
  };


  const tags = current
    ? [
        current.date,
        current.copyright?.trim(),
        current.media_type === "video" ? "Video" : "Image",
      ].filter(Boolean)
    : [];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <p>MISSION LOG</p>
        {history.length === 0 && <p>No discoveries yet</p>}
        {history.map((item) => (
          <div
            key={item.date}
            className={`historyItem ${current?.date === item.date ? "historyItemActive" : ""}`}
            onClick={() => setCurrent(item)}
          >
            <div className="historyThumb">
              {item.media_type === "image" ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="thumbImg"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="videoThumb">▶</div>
              )}
            </div>
            <div className="historyText">
              <p className="historyTitle">{item.title}</p>
              <p className="historyDate">{item.date}</p>
            </div>
          </div>
        ))}
      </aside>

      <main className="main">
        <header className="header">
          <p className="headerSub">NASA PICTURE OF THE DAY </p>
          <h1 className="headerTitle">COSMOS EXPLORER</h1>
        </header>
        
        <button
          className={`discoverBtn ${loading ? "discoverBtnDisabled" : ""}`}
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? "Scanning…" : "DISCOVER"}
        </button>

        {error && <div className="errorBox">{error}</div>}

        {current && !loading && (
          <div className="card">
            <h2 className="cardTitle">{current.title}</h2>

            <div className="tagsRow">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`tag ${banList.includes(tag) ? "tagBanned" : ""}`}
                  onClick={() => toggleBan(tag)}
                  title={banList.includes(tag) ? "Click to unban" : "Click to ban"}
                >
                  {banList.includes(tag) ? "🚫 " : ""}
                  {tag}
                </button>
              ))}
            </div>

            <div className="mediaWrapper">
              {current.media_type === "video" ? (
                <iframe
                  src={current.url}
                  className="mediaVideo"
                  title={current.title}
                  allowFullScreen
                />
              ) : (
                <img
                  src={current.hdurl || current.url}
                  alt={current.title}
                  className="mediaImg"
                  onError={(e) => e.target.src = current.url}
                />
              )}
            </div>

            <p className="explanation">
              {current.explanation?.slice(0, 400)}
              {current.explanation?.length > 400 ? "…" : ""}
            </p>
          </div>
        )}
      </main>

      <aside className="sidebar">
        <p>BAN LIST</p>
        <p>Click any tag on a card to ban it</p>
        {banList.length === 0 && <p>Nothing banned yet</p>}
        {banList.map((item) => (
          <button
            key={item}
            className="banChip"
            onClick={() => toggleBan(item)}
            title="Click to unban"
          >
            🚫 {item}
          </button>
        ))}
      </aside>
    </div>
  );
}

export default App;