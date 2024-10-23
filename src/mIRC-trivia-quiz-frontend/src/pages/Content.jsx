import { useEffect, useRef, useState } from 'react';
import { mIRC_trivia_quiz_backend } from 'declarations/mIRC-trivia-quiz-backend';
import toast from 'react-hot-toast';
import { storage } from '../utils';

function Content() {

  const [QAs, setQAs] = useState([]);
  const [answer, setAnswer] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [qType, setQType] = useState(0);
  const [quesiton, setQuestion] = useState("");
  const [qAnswer, setQAnswer] = useState("");
  const [hint, setHint] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const contentRef = useRef(null);

  const handleKeyDown = async e => {

    if (!(e.key === "Enter") ||
        !answer ||
        QAs.indexOf(answer) !== -1
    ) return;

    setBlocking(true);
    const userInfo = storage.get();
    let [result, score] = await mIRC_trivia_quiz_backend.check_answer(BigInt(userInfo.id), userInfo.name, answer);
    console.log(result, score);
    
    setAnswer("");
    contentRef.current?.scrollTo(0, contentRef.current?.scrollHeight + 30);
    setBlocking(false);
  }

  const addQA = async () => {
    if (!quesiton || !qAnswer) {
      toast.error("Please fill correctly!");
      return;
    }

    let result = await mIRC_trivia_quiz_backend.add_QA(parseInt(qType), quesiton, qAnswer, hint);
    if (!result) {
      toast.error("Error add QA");
      return;
    }

    toast.success("Success");
    initQA();
  }

  const initQA = () => {
    setQType(0);
    setQuestion("");
    setQAnswer("");
    setHint("");
    setIsOpenModal(false);
  }

  const setInterval = async () => {

    let [currentQA] = await mIRC_trivia_quiz_backend.get_current_QA();
    if (currentQA) {
      let [qTime, logs] = await mIRC_trivia_quiz_backend.get_current_logs();
      let qStartTime = new Date(parseInt(qTime / BigInt(1000000)));
      let newQAs = [];
      newQAs.push({ text: `[${qStartTime.toLocaleTimeString()}] <Server> ${currentQA.question}`, color: 'green' });
      newQAs.push({ text: `[${qStartTime.toLocaleTimeString()}] <Server> Hint: ${currentQA.hint}`, color: 'green' });

      if (logs[0]) {
        for (var i = 0; i < logs[0].length; i++) {
          let time = new Date(parseInt(logs[0][i].logTime / BigInt(1000000)));
          newQAs.push({ text: `[${time.toLocaleTimeString()}] <${logs[0][i].logPlayerName}> ${logs[0][i].logAnswer} (score: ${logs[0][i].logScore})`, color: 'black' });
        }
      }

      setQAs(newQAs);
      setIsStarted(true);
    } else {
      setQAs([]);
      setIsStarted(false);
    }

    setTimeout(setInterval, 100);
  }

  useEffect(() => {
    setInterval();
  }, []);

  return (
    <div className='flex h-dvh justify-center'>
      <div className='flex flex-col-reverse w-9/12 p-5 gap-5'>
        <div className='flex flex-row gap-5'>
          {
            blocking && (
              <svg className="animate-spin absolute h-5 w-5 mt-[10px] ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="gray" strokeWidth="4"></circle>
                <path className="opacity-75" fill="gray" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )
          }
          <input placeholder={isStarted ? 'Please enter your answer.' : 'Quiz game is not started!'} disabled={!isStarted || blocking} onKeyDown={handleKeyDown} onChange={e => setAnswer(e.target.value)} value={answer} className={`w-full px-3 py-1 ${blocking ? 'pl-8' : ''} border rounded border-blue-200 hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700`} />
          <button className='w-32 bg-blue-500 rounded text-white' onClick={() => setIsOpenModal(true)}>Add QA</button>
        </div>
        <div className='overflow-hidden' ref={contentRef}>
          { QAs.map((QA, idx) => <p style={{color: QA.color}} key={idx}>{QA.text}</p>) }
        </div>
      </div>
      {
        isOpenModal && (
          <div className='absolute w-full h-full flex justify-center backdrop-blur-sm'>
            <div className='absolute w-[600px] border border-blue-200 rounded shadow-lg top-20 px-5 py-10 flex flex-col gap-5'>
              <div className='flex flex-col gap-2'>
                <label htmlFor='qtype'>Question Type: </label>
                <select id='qtype' className='w-full px-3 py-2 border rounded border-blue-200 hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700' onChange={e => setQType(e.target.value)}>
                  <option value={0}>Single</option>
                  <option value={1}>Select</option>
                  <option value={2}>Multiple</option>
                </select>
              </div>
              <div className='flex flex-col gap-2'>
                <label htmlFor='question'>Question: </label>
                <input onChange={e => setQuestion(e.target.value)} value={quesiton} id='question' className='w-full px-3 py-1 border rounded border-blue-200 hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700' />
              </div>
              <div className='flex flex-col gap-2'>
                <label htmlFor='qAnswer'>Answer: </label>
                <input onChange={e => setQAnswer(e.target.value)} value={qAnswer} id='qAnswer' className='w-full px-3 py-1 border rounded border-blue-200 hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700'/>
              </div>
              <div className='flex flex-col gap-2'>
                <label htmlFor='hint'>Hint: </label>
                <input onChange={e => setHint(e.target.value)} value={hint} id='hint' className='w-full px-3 py-1 border rounded border-blue-200 hover:border-blue-700 focus:outline-none focus:border-blue-700 active:border-blue-700'/>
              </div>
              <div className='flex flex-row gap-5 justify-end'>
                <button className='bg-blue-500 text-white rounded px-3 py-1 w-32' onClick={addQA}>
                  Add
                </button>
                <button onClick={() => setIsOpenModal(false)} className='bg-blue-500 text-white rounded px-3 py-1 w-32'>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default Content;
