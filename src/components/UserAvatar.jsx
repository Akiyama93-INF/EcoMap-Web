import React from 'react'
import '../styles/components/UserAvatar.css'

function UserAvatar({ name = '', size = 32 }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className="user-avatar"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.45}px`
      }}
    >
      {initial}
    </div>
  )
}

export default UserAvatar