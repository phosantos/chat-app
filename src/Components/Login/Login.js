import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) navigate('/dashboard');
  }, [navigate, currentUser]);

  return (
    <section className={styles.login}>
      <div>
        <h1>Bem vindo de volta!</h1>
        <p>Entre com sua conta para enviar mensagens!</p>
        <button onClick={() => signInWithGoogle()}>
          Continuar com o <strong>Google</strong>
        </button>
      </div>
    </section>
  );
};

export default Login;
