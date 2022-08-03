import React from 'react';
import { db } from '../../Services/firebase';
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from 'firebase/firestore';
import FriendItem from './FriendItem';
import styles from './Friends.module.css';

const Friends = ({ userData, setGroupID, setTabnav }) => {
  const [addFriendsArea, setAddFriendsArea] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [friends, setFriends] = React.useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value) return;
    try {
      setLoading(true);
      //procura pelo username digitado
      const userRef = collection(db, 'user');
      const currUserRef = doc(db, 'user', userData.uid);
      const q = query(userRef, where('username', '==', value.trim()));
      const querySnap = await getDocs(q);
      let newContactID;
      querySnap.forEach((doc) => {
        newContactID = doc.data().uid;
      });

      //adiciona contato no usuario logado
      await updateDoc(currUserRef, {
        friends: arrayUnion(newContactID),
      });

      //adiciona id do usuario logado no novo contato
      const newFriendRef = doc(db, 'user', newContactID);
      await updateDoc(newFriendRef, {
        friends: arrayUnion(userData.uid),
      });
    } catch (err) {
      alert('Usuário não encontrado!');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    //busca todos os usuarios q tem o currUser adicionados
    const userRef = collection(db, 'user');
    const q = query(userRef, where('friends', 'array-contains', userData.uid));
    onSnapshot(q, (querySnapshot) => {
      const friendList = [];
      querySnapshot.forEach((doc) => {
        friendList.push(doc.data());
      });
      setFriends(friendList);
    });
  }, [userData]);

  return (
    <>
      <ul className={styles.menu}>
        <li onClick={() => setAddFriendsArea(false)}>Amigos</li>
        <li onClick={() => setAddFriendsArea(true)}>Adicionar Amigos</li>
      </ul>
      {addFriendsArea ? (
        <div className={styles.addFriendsArea}>
          <h1>Adicionar Contato</h1>
          <p>Adicione contatos usando o nome de usuário</p>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <input
              type="text"
              id="username"
              name="username"
              value={value}
              onChange={({ target }) => setValue(target.value)}
              placeholder="Nome de usuário..."
            />
            <button disabled={loading}>Adicionar Contato</button>
          </form>
        </div>
      ) : (
        <ul className={styles.friendList}>
          {friends &&
            friends.map((friend) => {
              return (
                <FriendItem
                  key={friend.uid}
                  userData={userData}
                  setGroupID={setGroupID}
                  setTabnav={setTabnav}
                  friend={friend}
                  friendID={friend.uid}
                />
              );
            })}
        </ul>
      )}
    </>
  );
};

export default Friends;
