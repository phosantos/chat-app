import React from 'react';
import { db } from '../../Services/firebase';
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';

const FriendItem = ({ userData, setGroupID, setTabnav, friend, friendID }) => {
  async function openChat(event) {
    const currUserRef = doc(db, 'user', userData.uid);

    //procura pelo grupo entre o usuario logado e o contato q foi clicado
    const groupRef = collection(db, 'group');
    const q = query(groupRef, where('members', 'array-contains', userData.uid));
    const querySnap = await getDocs(q);

    //primeiro todos os grupos com o usuario logado e depois um filtro com o id do contato
    let currentGroup = null;
    querySnap.forEach((doc) => {
      if (doc.data().members.includes(friendID)) currentGroup = doc.data();
    });

    // n existe um grupo entre os dois contatos ? entao é criado um novo grupo
    if (!currentGroup) {
      const newGroupRef = await addDoc(collection(db, 'group'), {
        members: [userData.uid, friendID],
        type: 'private',
      });

      await updateDoc(newGroupRef, {
        id: newGroupRef.id,
      });

      await updateDoc(currUserRef, {
        groups: arrayUnion(newGroupRef.id),
      });

      const friendRef = doc(db, 'user', friendID);
      await updateDoc(friendRef, {
        groups: arrayUnion(newGroupRef.id),
      });

      setGroupID(newGroupRef.id);
    } else {
      // existe ? então o id do grupo existente é recuperado
      setGroupID(currentGroup.id);
    }
    setTabnav('chatRoom');
  }

  return (
    <li onClick={openChat}>
      <div
        style={{
          backgroundImage: `url("${friend.photoURL}")`,
        }}
      ></div>
      <div>
        <p>{friend.name}</p>
        <p>@{friend.username}</p>
      </div>
    </li>
  );
};

export default FriendItem;
