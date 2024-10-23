import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { mIRC_trivia_quiz_backend } from 'declarations/mIRC-trivia-quiz-backend';

function Register() {

  const navigate = useNavigate();

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

    let result = await mIRC_trivia_quiz_backend.sign_up(uname, passwd);
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
          <h4 className='text-center text-[24px]'>Register</h4>
          <div className='flex flex-row'>
            <label htmlFor='uname' className='w-32 text-right pr-2 content-center'>username:</label>
            <input value={uname} onChange={(e) => setUname(e.target.value)} id='uname' className='w-64 px-3 py-1 border rounded hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700' />
          </div>
          <div className='flex flex-row'>
            <label htmlFor='password' className='w-32 text-right pr-2 content-center'>password: </label>
            <input value={passwd} onChange={(e) => setPasswd(e.target.value)} id='password' className='w-64 px-3 py-1 border rounded hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700' />
          </div>
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