import { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return isLogin ? (
    <Login onToggleMode={toggleMode} />
  ) : (
    <SignUp onToggleMode={toggleMode} />
  );
}