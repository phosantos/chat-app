import React from 'react';
import { db } from '../../Services/firebase';
import {
  doc,
  getDocs,
  query,
  collection,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  addDoc,
} from 'firebase/firestore';
import styles from './ChatRoom.module.css';

const ChatRoom = ({ groupID, userData }) => {
  const [messages, setMessages] = React.useState(null);
  const [value, setValue] = React.useState('');
  const [chatHeader, setChatHeader] = React.useState(null);
  const [sendingMessage, setSendingMessage] = React.useState(false);
  const messageArea = React.useRef();

  React.useEffect(() => {
    messageArea.current.scroll({
      top: messageArea.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  }, [messages]);

  React.useEffect(() => {
    async function getGroupHeader() {
      const q = query(
        collection(db, 'user'),
        where('groups', 'array-contains', groupID),
      );
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        if (doc.data().uid !== userData.uid) setChatHeader(doc.data());
      });
    }
    getGroupHeader();
  }, [groupID, userData]);

  React.useEffect(() => {
    const q = query(collection(db, 'message'), where('groupid', '==', groupID));

    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setMessages(doc.data().messages);
      });
    });
  }, [groupID]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!value) return;
    const message = {
      message: value,
      sentBy: userData.uid,
      createdAt: new Date().getTime(),
    };
    const messageRef = collection(db, 'message');
    const q = query(collection(db, 'message'), where('groupid', '==', groupID));
    setSendingMessage(true);
    const messagesDoc = await getDocs(q);
    if (messagesDoc.empty) {
      await addDoc(messageRef, {
        groupid: groupID,
        messages: [message],
      });
    } else {
      let messagesRef;
      messagesDoc.forEach((messages) => (messagesRef = messages.ref));
      await updateDoc(messagesRef, {
        messages: arrayUnion(message),
      });
    }
    await updateDoc(doc(db, 'group', groupID), {
      lastMessage: message,
    });
    setSendingMessage(false);
    setValue('');
  }

  return (
    <div className={styles.chatRoom}>
      <div className={styles.chatHeader}>
        <div
          style={{ backgroundImage: `url("${chatHeader?.photoURL}")` }}
        ></div>
        <p>@{chatHeader?.username}</p>
      </div>
      <ul className={styles.messages} ref={messageArea}>
        {messages?.map((message) => (
          <li className={styles.messageContainer} key={message.createdAt}>
            <p
              className={
                message.sentBy === userData.uid
                  ? styles.currUserMessage
                  : styles.friendMessage
              }
            >
              {message.message}
            </p>
          </li>
        ))}
      </ul>
      <form onSubmit={sendMessage} className={styles.sendMessage}>
        <textarea
          name="message"
          id="message"
          type="text"
          placeholder="Mensagem"
          value={value}
          onChange={({ target }) => setValue(target.value)}
        ></textarea>
        <button>{sendingMessage ? 'Enviando...' : 'Enviar'}</button>
      </form>
    </div>
  );
};

export default ChatRoom;
