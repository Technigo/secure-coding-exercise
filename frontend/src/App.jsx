import { useState, useEffect } from "react"
import { PostMessage } from "./components/PostMessage"
import { MessageList } from "./components/MessageList"
import AuthModal from "./components/AuthModal"

export const App = () => {
  // When a component's state changes, React automatically triggers a re-render of the component to reflect the updated state in the UI.
  // Here we set our states for App.js:
  const [loading, setLoading] = useState(false) // Initial state is false, no loading
  const [messageList, setMessageList] = useState([]) // Initial state is an empty array
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  })
  const [modal, setModal] = useState(null)
  const [error, setError] = useState(null)

  // When fetchPosts sets the loading or messageList state, it triggers a re-render of the App component.
  // We call the messages in the API, by GET method:
  const fetchPosts = () => {
    // console.log(loading)
    // console.log(messageList)
    setLoading(true)
    fetch("http://localhost:3000/messages")
      .then((res) => res.json())
      .then((data) => setMessageList(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false))
  }
  // useEffect for fetchPosts is triggered only on mount because of the empty array argument
  // The useEffect hook is used to call the fetchPosts function and update the messageList state with the data retrieved from the API.
  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // This updates the message list, adding the new submitted message
  // const addNewPost = async (newMessage) => {
  //   setError(null)

  //   if (!user) {
  //     setError("Please log in to post a thought.");
  //     return { ok: false };
  //   }

  //   const message = await postMessage(newMessage);

  //   if (message.message && !message.error && !message.errors) {
  //     setMessageList((prev) => [message, ...prev]);
  //     return { ok: true };
  //   } else {
  //     setError("Your message must be 5–140 characters.");
  //     return { ok: false }
  //   }
  // }

    const addNewPost = (newMessage) => {
    setMessageList([newMessage, ...messageList])}
  return (
    <>
        {user ? (
          <>
            <span className="text-sm text-gray-600">Hi, {user.response.email}</span>
            <button
              onClick={() => { localStorage.removeItem("user"); setUser(null); }}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setModal("login")}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold hover:bg-gray-100"
            >
              Login
            </button>
            <button
              onClick={() => setModal("register")}
              className="rounded-full bg-gradient-to-b from-red-300 to-red-500 px-3 py-1 text-xs font-semibold text-white hover:brightness-110"
            >
              Register
            </button>
          </>
        )}
      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSuccess={(data) => { setUser(data); setModal(null); }}
        />
      )}
      <PostMessage newMessage={addNewPost} fetchPosts={fetchPosts} />
      <MessageList
        loading={loading}
        messageList={messageList}
        setMessageList={setMessageList}
        fetchPosts={fetchPosts}
      />
    </>
  )
}
