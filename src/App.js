import "./App.css";
import { useEffect, useState } from "react";
import { supabase } from "./index";
import sound from './assets/ding-101492.mp3';

function App() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [msg, setMsg] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);

  const audioplay = () => {
    new Audio(sound).play();
  };

  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Login Error:", error);
      return;
    }

    // Wait for session update
    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        console.error("User session not found!");
        return;
      }

      const loggedInUser = session.user;
      setUser(loggedInUser); // ✅ Update state to trigger re-render

      // ✅ Add user to activeUsers table
      await supabase.from("activeUsers").upsert([
        {
          user_id: loggedInUser.id,
          name: loggedInUser.user_metadata.full_name,
          email: loggedInUser.email,
        },
      ]);

      // ✅ Notify chat room that a user has joined
      await supabase.from("chats").insert([
        {
          user: { name: "System" },
          message: `${loggedInUser.user_metadata.full_name} has joined the chat`,
          timestamp: convertToIST(new Date()),
        },
      ]);

      console.log("User logged in successfully:", loggedInUser);
    }, 3000); // ✅ Add a delay to ensure session updates
  };

  // 🔹 Function to convert UTC to IST before storing in Supabase
  const convertToIST = (date) => {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
    return new Date(date.getTime() + istOffset).toISOString();
  };

  // 🔹 Check session and restore user on page load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
      }
    };

    checkSession();
  }, []);

  // 🔹 Fetch messages once when component loads
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setChats(data); // ✅ Set only old messages once
      }
    };

    fetchMessages();
  }, []);

  // 🔹 Listen for new chat messages in real-time
  useEffect(() => {
    const chatSubscription = supabase
      .channel("chats-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chats" }, (payload) => {
        setChats((prevChats) => [...prevChats, payload.new]); // ✅ Only add new messages
        audioplay();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatSubscription);
    };
  }, []);

  // 🔹 Track active users in real-time (Handles INSERT & DELETE)
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

  // 🔹 Handle user leaving (Remove from active users & Send Exit Message)
  useEffect(() => {
    if (user) {
      const handleLeave = async () => {
        // ✅ Remove user from activeUsers table
        await supabase.from("activeUsers").delete().eq("user_id", user.id.toString ());

        // ✅ Send system message when user exits
        await supabase.from("chats").insert([
          {
            user: { name: "System" },
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

  // 🔹 Send a chat message
  const sendChat = async () => {
    if (!msg.trim()) {
      alert("Enter a message to send.");
      return;
    }

    await supabase.from("chats").insert([
      { user, message: msg, timestamp: convertToIST(new Date()) },
    ]);

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
          <p id="users">Number of active users: <span>{activeUsers}</span></p>
          <div id="chat" className="chat-container">
            {chats.map((c, i) => (
              <div key={i} className={`container ${c.user.email === user.email ? "me" : ""}`}>
                <p className="chatbox">
                  <strong>{user.user_metadata?.full_name}:</strong> <span>{c.message}</span>
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
