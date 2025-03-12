import "./App.css";
import { useEffect, useState } from "react";
import { supabase } from "./index";
import sound from "./assets/ding-101492.mp3";
import leoProfanity from "leo-profanity";

const badWords = [
  "bhosdike", "bhosdi", "bhosdike", "bkl", "bc", "mc", "lund", "gand", "chutiya",
  "chut", "gaand", "maderchod", "maderchod", "madarchod", "betichod", "bhenchod",
  "bhosdike", "randi", "gandu", "chodu", "chinal", "lavde", "bhadwa", "bhadwe",
  "raand", "gaandfat", "lund", "jhant", "jhat", "gandmasti", "gandfat", "teri maa ki",
  "teri behen ki", "teri maa ka", "teri behan ka", "bhosdike", "chinal", "chodu", "raand",
  "chut ke dhakkan", "chutmarika", "tatte", "lawda", "suar ke lund", "kutta kamina", "marderchod"
];

leoProfanity.loadDictionary ();

leoProfanity.add (badWords);

function App() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [msg, setMsg] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);

  const audioplay = () => {
    new Audio(sound).play();
  };

  const Updateheight = () => {
    const el = document.getElementById ("chat");

    if (!el) {
      return;
    }

    else {
      el.scrollTop = el.scrollHeight;
    }
  };

  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Login Error:", error);
      return;
    }

    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        console.error("User session not found!");
        return;
      }

      const loggedInUser = session.user;
      setUser(loggedInUser);

      await supabase.from("activeUsers").upsert([
        {
          user_id: loggedInUser.id,
          name: loggedInUser.user_metadata.full_name,
          email: loggedInUser.email,
        },
      ]);

      await supabase.from("chats").insert([
        {
          user: JSON.stringify({
            name: loggedInUser.user_metadata.full_name,
            email: loggedInUser.email,
          }),
          message: `${loggedInUser.user_metadata.full_name} joined the chat`,
          timestamp: convertToIST(new Date()),
        },
      ]);

      console.log("User logged in successfully:", loggedInUser);
    }, 3000);
  };

  const convertToIST = (date) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + istOffset).toISOString();
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        const parsedData = data.map(chat => ({
          ...chat,
          user: typeof chat.user === "string" ? JSON.parse(chat.user) : chat.user,
        }));
        setChats(parsedData);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const chatSubscription = supabase
      .channel("chats-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chats" }, (payload) => {
        const newMessage = {
          ...payload.new,
          user: typeof payload.new.user === "string" ? JSON.parse(payload.new.user) : payload.new.user,
        };
        setChats((prevChats) => [...prevChats, newMessage]);
        audioplay();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatSubscription);
    };
  }, []);

  useEffect(() => {
    const userSubscription = supabase
      .channel("active-users-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activeUsers" }, async () => {
        const { data } = await supabase.from("activeUsers").select("*");
        setActiveUsers(data.length);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "activeUsers" }, async () => {
        const { data } = await supabase.from("activeUsers").select("*");
        setActiveUsers(data.length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userSubscription);
    };
  }, []);

  useEffect(() => {
    if (user) {
      const handleLeave = async () => {
        await supabase.from("activeUsers").delete().eq("user_id", user.id.toString());

        await supabase.from("chats").insert([
          {
            user: JSON.stringify({ name: "System" }),
            message: `${user.user_metadata.full_name} has left the chat`,
            timestamp: convertToIST(new Date()),
          },
        ]);
      };

      window.addEventListener("beforeunload", handleLeave);
      return () => {
        window.removeEventListener("beforeunload", handleLeave);
        handleLeave();
      };
    }
  }, [user]);

  const sendChat = async () => {
    if (!msg.trim()) {
      alert("Enter a message to send.");
      return;
    }

    const cleanMessage = leoProfanity.clean (msg);

    await supabase.from("chats").insert([
      { 
        user: JSON.stringify({ name: user.user_metadata.full_name, email: user.email }),
        message: cleanMessage, 
        timestamp: convertToIST(new Date()) 
      },
    ]);

    Updateheight ();

    setMsg("");
  };

  return (
    <>
      {!user ? (
        <div className="box1">
          <div className="cont1">
            <div className="container2">
              <div className="box9">
                <img src="https://i.postimg.cc/HxQdp47P/social.png" alt="logo" />
                <h4>Connect Secure</h4>
                <button className="btn" onClick={googleLogin}>
                  Google Login
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2>
            Name: <span id="username">{user.user_metadata?.full_name}</span>
            <br />
            Email: <span id="username1">{user.email}</span>
          </h2>
          {/* <p id="users">Number of active users: <span>{activeUsers}</span></p> */}
          <div id="chat" className="chat-container">
            {chats.map((c, i) => (
              <div key={i} className={`container ${c.user?.email === user.email ? "me" : ""}`}>
                <p className="chatbox">
                  <strong>{c.user?.email === user.email ? "You" : c.user?.name || "Unknown"}:</strong>
                  <span>{c.message}</span>
                  <br />
                  <small style={{ color: "#f9ff00" }}>
                    {c.timestamp ? new Date(c.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "No timestamp"}
                  </small>
                </p>
              </div>
            ))}
          </div>

          <div className="btm">
            <input className="form-control" type="text" placeholder="Enter your message" onChange={(e) => setMsg(e.target.value)} value={msg} />
            <button onClick={sendChat}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
