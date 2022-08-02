import React from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../Services/firebase';
import { useAuth } from '../../Contexts/AuthContext';
import styles from './Dashboard.module.css';
import Friends from './Friends';
import ChatRoom from './ChatRoom';
import ChatItem from './ChatItem';

const Dashboard = () => {
  const { currentUser, userSignOut } = useAuth();
  const [tabnav, setTabnav] = React.useState('friends');
  const [groupID, setGroupID] = React.useState(null);
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [openChats, setOpenChats] = React.useState(false);

  React.useState(() => {
    async function getUserDataFromDB() {
      try {
        setLoading(true);
        const userRef = doc(db, 'user', currentUser.uid);
        const userSnap = await getDoc(userRef);
        setUserData(userSnap.data());
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
    getUserDataFromDB();
  }, []);

  React.useEffect(() => {
    const q = query(
      collection(db, 'group'),
      where('members', 'array-contains', currentUser.uid),
    );
    onSnapshot(q, (querySnapchot) => {
      setOpenChats(querySnapchot.docs.map((doc) => doc.data()));
    });
  }, [currentUser]);

  if (loading) return <div className={styles.loading}></div>;
  if (userData)
    return (
      <section className={styles.dashboard}>
        <div className={styles.controls}>
          <div className={styles.profile}>
            <div
              className={styles.profileImg}
              style={{ backgroundImage: `url('${userData.photoURL}')` }}
            ></div>
            <div>
              <p>{userData.name}</p>
              <p className={styles.username}>@{userData.username}</p>
            </div>
            <button onClick={userSignOut}>Sair</button>
          </div>

          <div className={styles.friendsButton}>
            <p onClick={() => setTabnav('friends')}>Amigos</p>
          </div>

          <div className={styles.openChats}>
            <h3>Conversas</h3>
            <ul className={styles.scroll}>
              {openChats?.map((chat) => {
                return (
                  <ChatItem
                    key={chat.id}
                    chatID={chat.id}
                    setGroupID={setGroupID}
                    setTabnav={setTabnav}
                    lastMessage={chat.lastMessage}
                    friendID={chat.members.find(
                      (member) => member !== userData.uid,
                    )}
                  />
                );
              })}
            </ul>
          </div>
        </div>
        <div className={styles.column2}>
          {tabnav === 'friends' && (
            <Friends
              userData={userData}
              setGroupID={setGroupID}
              setTabnav={setTabnav}
            />
          )}
          {tabnav === 'chatRoom' && (
            <ChatRoom groupID={groupID} userData={userData} />
          )}
        </div>
      </section>
    );

  return null;
};

export default Dashboard;
