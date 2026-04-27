import { useState } from "react"
import { formatDistance } from "date-fns"

export const SingleMessage = ({ singleMessage, fetchPosts }) => {
  const [numLikes, setNumLikes] = useState(singleMessage.hearts) // Setting the initial state to the current number of hearts
  const [liked, setLiked] = useState(false) // Initial state false

  // We calculate the time since the message was posted (date-fns)
  const timeSincePosted = formatDistance(
    new Date(singleMessage.createdAt),
    new Date(),
    { addSuffix: true }
  )

  // This function posts a like to the API, set the like status and updates the message list through fetchPosts
  const onLikeIncrease = () => {
    const options = {
      method: "POST",
    }

    // eslint-disable-next-line no-underscore-dangle
    fetch(
      `http://localhost:3000/messages/${singleMessage._id}/like`,
      options
    )
      .then((response) => response.json())
      .then(() => {
        setNumLikes(numLikes + 1) // We post to the API the current number of likes + 1
        setLiked(true) // We set the state liked to true
        fetchPosts() // We call the fetchPost function in the grandparent, fetching from the API, rendering an update in messageList.
      })
      .catch((error) => console.log(error))
  }
  return (
    <div className="message">
      <p key={singleMessage._id}>{singleMessage.message}</p>
      <div className="info-wrapper">
        <div className="info-like">
          <button
            type="button"
            id="likeBtn"
            onClick={onLikeIncrease}
            className={liked ? "like-button liked" : "like-button"}
          >
            <span className="emoji" aria-label="like button">
              &#x2665;
            </span>
          </button>
          <span className="num-likes">x{singleMessage.hearts}</span>
        </div>
        <div className="info-time">{timeSincePosted}</div>
      </div>
    </div>
  )
}