import { SingleMessage } from "./SingleMessage"

export const MessageList = ({ messageList, fetchPosts, user, onUnauthorized, loading }) => {

  return (
    <div className="list-wrapper">
      {messageList.map((singleMessage) => (
        <SingleMessage
          key={singleMessage._id}
          singleMessage={singleMessage}
          fetchPosts={fetchPosts}
          user={user}
          onUnauthorized={onUnauthorized}
        />
      ))}
    </div>
  )
}
