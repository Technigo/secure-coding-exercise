import { useState } from "react"
import { formatDistance } from "date-fns"

export const SingleMessage = ({ singleMessage, fetchPosts }) => {
  const [numLikes, setNumLikes] = useState(singleMessage.hearts)
  const [liked, setLiked] = useState(false)

  const timeSincePosted = formatDistance(
    new Date(singleMessage.createdAt),
    new Date(),
    { addSuffix: true }
  )

  const onLikeIncrease = () => {
    const options = {
      method: "POST",
    }

    fetch(
      `http://localhost:3000/messages/${singleMessage._id}/like`,
      options
    )
      .then((response) => response.json())
      .then(() => {
        setNumLikes(numLikes + 1) // We post to the API the current number of likes + 1
        setLiked(true) // We set the state liked to true for visual reference only
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