import { doc, getDoc } from 'firebase/firestore';
import React from 'react';
import { db } from '../../Services/firebase';

const ChatItem = ({ chatID, friendID, lastMessage, setGroupID, setTabnav }) => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    async function getFriendData() {
      const friendRef = doc(db, 'user', friendID);
      const friendDocSnap = await getDoc(friendRef);
      setData(friendDocSnap.data());
    }
    getFriendData();
  }, [friendID]);

  function openChatRoom(event) {
    setGroupID(chatID);
    setTabnav('chatRoom');
  }

  if (data)
    return (
      <li onClick={openChatRoom}>
        <div
          style={{
            backgroundImage: `url("${data.photoURL}")`,
          }}
        ></div>
        <div>
          <p>@{data.username}</p>
          <p>
            {lastMessage?.message.length > 15
              ? lastMessage.message.substring(0, 15) + '...'
              : lastMessage.message}
          </p>
        </div>
      </li>
    );

  return null;
};

export default ChatItem;
