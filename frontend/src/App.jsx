import { useState, useEffect } from "react"
import { PostMessage } from "./components/PostMessage"
import { MessageList } from "./components/MessageList"

export const App = () => {
  // When a component's state changes, React automatically triggers a re-render of the component to reflect the updated state in the UI.
  // Here we set our states for App.js:
  const [loading, setLoading] = useState(false) // Initial state is false, no loading
  const [messageList, setMessageList] = useState([]) // Initial state is an empty array

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
  const addNewPost = (newMessage) => {
    setMessageList([newMessage, ...messageList])
  }
  return (
    <>
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
