import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { mIRC_trivia_quiz_backend } from 'declarations/mIRC-trivia-quiz-backend';
import { storage } from '../utils';
import toast from "react-hot-toast";
import Identity from './Identity';
import { useIdentityKit } from '@nfid/identitykit/react';

function Login() {

  const navigate = useNavigate();
  const { user } = useIdentityKit();

  const [uname, setUname] = useState("");
  const [passwd, setPasswd] = useState("");

  useEffect(() => {
    if (storage.get()) navigate('/content');
  }, []);

  const signInWithCredential = async () => {
    if (!uname) {
      toast.error("Please enter user name!");
      return;
    }

    if (!passwd) {
      toast.error("Please enter password correctly!");
      return;
    }

    let [status, userInfo] = await mIRC_trivia_quiz_backend.sign_in(uname, passwd);
    if (!status) {
      toast.error("Login fail!");
      return;
    }

    console.log(userInfo[0].id);

    storage.save(userInfo[0]);
    navigate('/content');
  };

  const signInWithWallet = async () => {
    // console.log(user.principal.toText());
    if (!user) {
      toast.error("Please select wallet!");
      return;
    }

    let [userInfo] = await mIRC_trivia_quiz_backend.sign_in_with_wallet(user.principal.toText());
    
    storage.save(userInfo[0]);
    navigate('/content');
  }


  return (
    <>
      <div className='flex flex-col items-center justify-center h-dvh'>
        <div className='flex flex-col w-96 gap-5'>
          <h4 className='text-center text-[24px]'>Login Page</h4>
          <a className='text-[14px] text-center underline active:text-blue-700 hover:text-blue-700 cursor-pointer' onClick={() => navigate("/register")}>Click here to register new user</a>
          {
            !user && (
              <div className='flex flex-col gap-5'>
                <div className='flex flex-row'>
                  <label htmlFor='uname' className='w-32 text-right pr-2 content-center'>username:</label>
                  <input id='uname' onChange={(e) => setUname(e.target.value)} value={uname} className='w-64 px-3 py-1 border rounded hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700'/>
                </div>
                <div className='flex flex-row'>
                  <label htmlFor='password' className='w-32 text-right pr-2 content-center'>password: </label>
                  <input type='password' id='password' onChange={(e) => setPasswd(e.target.value)} value={passwd} className='w-64 px-3 py-1 border rounded hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700' />
                </div>
                <button className="bg-blue-700 rounded px-4 py-2 text-white w-full" onClick={signInWithCredential}>
                  Login With Credential
                </button>
              </div>
            )
          }
          <Identity user={user} signInWithWallet={signInWithWallet}/>
        </div>
      </div>
    </>
  );
}

export default Login;