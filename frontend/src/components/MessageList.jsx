import { SingleMessage } from "./SingleMessage"

// This code does several things
// 1: It creates the message wrapper called list-wrapper
// 2. It takes the messageList that was fetched in App.js and maps over that API
// 3. It takes the map and sends it into the SingleMessage component, where we decide what to show,
// It creates a "copy" of component SingleMessage for each time it is mapped over one item ('singleMessage')

export const MessageList = ({ messageList, fetchPosts }) => {
  // console.log(messageList)
  return (
    <div className="list-wrapper">
      {messageList.map((singleMessage) => (
        // eslint-disable-next-line no-underscore-dangle
        <SingleMessage
          key={singleMessage._id}
          singleMessage={singleMessage}
          fetchPosts={fetchPosts}
        />
      ))}
    </div>
  )
}
