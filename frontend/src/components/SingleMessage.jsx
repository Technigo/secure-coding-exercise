import { useState } from "react"
import { BASE_URL } from "../api"
import { formatDistance } from "date-fns"

export const SingleMessage = ({ singleMessage, fetchPosts, user, onUnauthorized }) => {
  const [numLikes, setNumLikes] = useState(singleMessage.hearts)
  const [liked, setLiked] = useState(
    user ? singleMessage.likedBy?.includes(user.response.id) : false
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(singleMessage.message)
  const [editError, setEditError] = useState("")

  const isOwner = user && user.response.id === singleMessage.user?._id

  const timeSincePosted = formatDistance(
    new Date(singleMessage.createdAt),
    new Date(),
    { addSuffix: true }
  )

  const onLikeIncrease = () => {
    if (!user) {
      alert("You need to be logged in to like a message")
      return
    }
    const options = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${user?.response?.accessToken}`,
      },
    }

    fetch(
      `${BASE_URL}/messages/${singleMessage._id}/like`,
      options
    )
      .then((response) => {
        if (response.status === 401) { onUnauthorized(); return null }
        return response.json()
      })
      .then((data) => {
        if (!data) return
        setNumLikes(data.hearts)
        setLiked(!liked)
        fetchPosts()
      })
      .catch((error) => console.log(error))
  }

  const onEdit = () => {
    if (editedText.length < 5) {
      setEditError("Message is too short (min 5 characters)")
      return
    }
    if (editedText.length > 140) {
      setEditError("Message is too long (max 140 characters)")
      return
    }
    setEditError("")
    fetch(`${BASE_URL}/messages/${singleMessage._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.response.accessToken}`,
      },
      body: JSON.stringify({ editedMessage: editedText }),
    })
      .then((response) => {
        if (response.status === 401) { onUnauthorized(); return null }
        return response.json()
      })
      .then((data) => {
        if (!data) return
        setIsEditing(false)
        fetchPosts()
      })
      .catch((error) => console.log(error))
  }

  const onDelete = () => {
    fetch(`${BASE_URL}/messages/${singleMessage._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.response.accessToken}`,
      },
    })
      .then((response) => {
        if (response.status === 401) { onUnauthorized(); return }
        fetchPosts()
      })
      .catch((error) => console.log(error))
  }

  return (
    <div className="message">
      <div className="message-header">
        {isEditing ? (
          <div className="edit-wrapper">
            <label>
              <textarea
                value={editedText}
                onChange={(e) => { setEditedText(e.target.value); setEditError("") }}
                rows="3"
                name="editMessage"
                />
              {editError &&
                <p className="error">{editError}</p>
              }
            </label>
            <div className="post-length">
              <p className={`length ${editedText.length >= 140 ? "red" : ""}`}>
                {editedText.length}/140
              </p>
            </div>
          </div>
        ) : (
          <p>{singleMessage.message}</p>
        )}
        <div className="message-actions">
          {isOwner && isEditing ? (
            <>
              <button type="button" onClick={onEdit}>💾</button>
              <button type="button" onClick={() => setIsEditing(false)}>❌</button>
            </>
          ) : (
            <>
              {isOwner && <button type="button" onClick={() => setIsEditing(true)}>✏️</button>}
              <button type="button" onClick={onDelete}>🗑️</button>
            </>
          )}
        </div>
      </div>
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
        <div className="info-time">
          {singleMessage.user?.username}
          <br />
          {timeSincePosted}
        </div>
      </div>
    </div>
  )
}
