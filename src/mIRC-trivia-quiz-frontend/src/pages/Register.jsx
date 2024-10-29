import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { mIRC_trivia_quiz_backend } from 'declarations/mIRC-trivia-quiz-backend';
import { useIdentityKit } from '@nfid/identitykit/react';
import { formatPrincipal } from '../utils';

function Register() {

  const navigate = useNavigate();
  const { user, connect, disconnect } = useIdentityKit();

  const [uname, setUname] = useState("");
  const [passwd, setPasswd] = useState("");

  const register = async () => {
    if (!uname) {
      toast.error("Please enter new user name!");
      return;
    }

    if (!passwd) {
      toast.error("Please enter password correctly!");
      return;
    }

    if (!user) {
      toast.error("Please select wallet!");
      return;
    }

    let result = await mIRC_trivia_quiz_backend.sign_up(uname, passwd, user.principal.toText());
    if (!result) {
      toast.error("Error!");
      return;
    }

    navigate("/login");
  }

  return (
    <>
      <div className='flex flex-col items-center justify-center h-dvh'>
        <div className='flex flex-col w-96 gap-5'>
          <h4 className='text-center text-[24px]'>Register Page</h4>
          <div className='flex flex-row'>
            <label htmlFor='uname' className='w-32 text-right pr-2 content-center'>username:</label>
            <input value={uname} onChange={(e) => setUname(e.target.value)} id='uname' className='w-64 px-3 py-1 border rounded hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700' />
          </div>
          <div className='flex flex-row'>
            <label htmlFor='password' className='w-32 text-right pr-2 content-center'>password: </label>
            <input type='password' value={passwd} onChange={(e) => setPasswd(e.target.value)} id='password' className='w-64 px-3 py-1 border rounded hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700' />
          </div>
          {
            user ? 
            (
              <button className='bg-green-700 rounded px-4 py-2 text-white w-full' onClick={() => disconnect()}>{formatPrincipal(user.principal)} | Disconnect</button>
            ) : 
            (
              <button className='bg-green-700 rounded px-4 py-2 text-white w-full' onClick={() => connect()}>Connect Wallet</button>
            )
          }
          <div className='flex flex-row justify-between text-right'>
            <button className="bg-blue-700 rounded px-4 py-2 text-white w-40" onClick={register}>
              Register
            </button>
            <button className="bg-blue-700 rounded px-4 py-2 text-white w-40" onClick={() => navigate("/login")}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;