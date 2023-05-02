import Sidebar from "@/components/Sidebar";
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Mina,
  isReady,
  PublicKey,
  fetchAccount,
  Field,
  Bool,
  Poseidon,
} from 'snarkyjs';
import ZkappWorkerClient from './zkappWorkerClient';
import { Report, Requirements } from '../../../contracts/src/ConcealedCare';
import { ReportFormInput, RequirementsFormInput, buildReportFromFormInput, buildRequirementsFromFormInput, reportFromJson, requirementsFromJson } from "@/util";
import NewRequest from "./new-request.page";
import AccomProof from "./accom-proof.page";
import VerifyAccomProof from "./verify-accom-proof.page";

let transactionFee = 0.1;


export default function NewReport() {
  let [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentNum: null as null | Field,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
    hash: ""
  });

  let [form1output, setForm1output] = useState("")
  let [form2output, setForm2output] = useState("")
  let [form3output, setForm3output] = useState("")
  let [form4output, setForm4output] = useState("")

  async function publishReport(report: Report) {
    doShowOverlay()

    myLog('Publishing medical report hash...');

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });


    myLog('creating transaction...');
    await state.zkappWorkerClient!.createPublishReportTransaction(report);

    myLog('creating proof...');
    await state.zkappWorkerClient!.proveTransaction();

    myLog('getting transaction JSON...');
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

    myLog('requesting send transaction...');
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: '',
      },
    });

    myLog(
      'See transaction at https://berkeley.minaexplorer.com/transaction/' + hash
    );
    doHideOverlay()


    setState({ ...state, creatingTransaction: false, hash: hash });
    setForm1output(JSON.stringify(report, null, 2))
  }

  async function publishAccomProof(report: Report, requirements: Requirements) {
    doShowOverlay()

    myLog('Publishing accommodation proof...');

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });

    try {

      myLog('creating transaction...');
      await state.zkappWorkerClient!.createPublishAccomProofTransaction(report, requirements);

      myLog('creating proof...');
      await state.zkappWorkerClient!.proveTransaction();

      myLog('getting transaction JSON...');
      const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

      myLog('requesting send transaction...');
      var { hash } = await (window as any).mina.sendTransaction({
        transaction: transactionJSON,
        feePayer: {
          fee: transactionFee,
          memo: '',
        },
      });

    } catch (e) {
      alert('failed to generate proof: ' + e)
    }

    myLog(
      'See transaction at https://berkeley.minaexplorer.com/transaction/' + hash
    );
    doHideOverlay()


    setState({ ...state, creatingTransaction: false, hash: hash });
    setForm3output("ok")
  }

  async function publishVerifyAccomProof(requirements: Requirements) {
    doShowOverlay()

    myLog('Verifying accommodation proof...');

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });

    try {
      const curRequirementsHash = await state.zkappWorkerClient!.getRequirementsHash()
      const expectedRequirementsHash = Poseidon.hash([
        new Field(requirements.patientIdHash),
        new Field(requirements.verifyTime),
        new Field(requirements.minBloodPressure),
        new Field(requirements.maxBloodPressure),
        new Bool(requirements.allowConditionA).toField(),
        new Bool(requirements.allowConditionB).toField(),
        new Bool(requirements.allowConditionC).toField(),
      ])

      if (JSON.stringify(curRequirementsHash) != JSON.stringify(expectedRequirementsHash)) {
        alert('FAILED TO VERIFY!')
      } else {
        myLog('Requirements verified!')
        await new Promise(r => setTimeout(r, 2000));
      }



      // await state.zkappWorkerClient!.createVerifyAccomProofTransaction(requirements);

      // await state.zkappWorkerClient!.proveTransaction();

      // myLog('getting transaction JSON...');
      // const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

      // myLog('requesting send transaction...');
      // var { hash } = await (window as any).mina.sendTransaction({
      //   transaction: transactionJSON,
      //   feePayer: {
      //     fee: transactionFee,
      //     memo: '',
      //   },
      // });

    } catch (e) {
      alert('failed to verify proof: ' + e)
    }

    // myLog(
    //   'See transaction at https://berkeley.minaexplorer.com/transaction/' + hash
    // );
    doHideOverlay()


    // setState({ ...state, creatingTransaction: false, hash: hash });
    setForm4output("ok")
  }

  useEffect(() => {

    const showDoctorBtn = document.getElementById('patientBtn');
    const showEmployerBtn = document.getElementById('employerBtn');
    const showPatientBtn = document.getElementById('doctorBtn');

    showDoctorBtn.addEventListener('click', () => {
      toggleVisibility('.doctor');
    });

    showEmployerBtn.addEventListener('click', () => {
      toggleVisibility('.employer');
    });

    showPatientBtn.addEventListener('click', () => {
      toggleVisibility('.patient');
    });

    (async () => {
      await isReady;
      doShowOverlay()

      if (!state.hasBeenSetup) {
        const zkappWorkerClient = new ZkappWorkerClient();

        myLog('Loading SnarkyJS...');
        await zkappWorkerClient.loadSnarkyJS();
        myLog('done');

        await zkappWorkerClient.setActiveInstanceToBerkeley();

        const mina = (window as any).mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }
        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        myLog('public key: ', publicKey.toBase58());

        myLog('checking if account exists...');
        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });
        const accountExists = res.error == null;

        await zkappWorkerClient.loadContract();

        myLog('compiling zkApp');
        await zkappWorkerClient.compileContract();
        myLog('zkApp compiled');

        const zkappPublicKey = PublicKey.fromBase58(
          'B62qmYXReS5MVF5fZzR8pEtPwjA4zFkzMZJ5N4pmFsEEBS8RbGbAoLZ'
        );

        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        myLog('getting zkApp state...');
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        myLog('READY!')
        doHideOverlay()
        // const currentNum = await zkappWorkerClient.getNum();
        // myLog('current state:', currentNum.toString());

        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
          // currentNum,
        });

      }


    })();
  }, []);

  const toggleVisibility = (visibleClass) => {
    const doctorDiv = document.querySelector('.doctor');
    const employerDiv = document.querySelector('.employer');
    const patientDiv = document.querySelector('.patient');

    doctorDiv.classList.remove('visible');
    employerDiv.classList.remove('visible');
    patientDiv.classList.remove('visible');

    document.querySelector(visibleClass).classList.add('visible');
  };


  const [patientID, setPatientID] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [condition_1, setCondition_1] = useState("");
  const [condition_2, setCondition_2] = useState("");
  const [condition_3, setCondition_3] = useState("");

  const [showOverlay, setShowOverlay] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  function doShowOverlay() {
    setLogs([])
    setShowOverlay(true)
  }

  function doHideOverlay() {
    setShowOverlay(false)
  }

  const myLog = (...message: any) => {
    console.log(...message)
    setLogs((prevLogs) => [...(prevLogs || []), message]);
  };


  function submitRequest(requirementsInput: RequirementsFormInput) {
    const req = buildRequirementsFromFormInput(requirementsInput)
    setForm2output(JSON.stringify(req, null, 2))
  }

  function submitAccomProof(reportJsonString: string, requirementsJsonString: string) {
    publishAccomProof(reportFromJson(reportJsonString), requirementsFromJson(requirementsJsonString))
  }

  function submitVerifyAccomProof(requirementsJsonString: string) {
    publishVerifyAccomProof(requirementsFromJson(requirementsJsonString))
  }

  return (
    <div className="App bg-white-50 dark:bg-zinc-900">
      {showOverlay && (
        <div className="overlay">
          <button onClick={doHideOverlay}>Hide</button>
          <div className="overlay-content">
            <ul ><code className="mt-5">
              {logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </code></ul>
          </div>
        </div>
      )}
      <Sidebar />
      <div className="generate-keys">
        <div className="doctor">
        <h1>Doctor - Report Patient Medical Conditions</h1>

        <form
          className="main-form"
          onSubmit={(e: any) => {
            publishReport(buildReportFromFormInput({
              patientId: patientID,
              validUntil,
              bloodPressure,
              hasConditionA: condition_1,
              hasConditionB: condition_2,
              hasConditionC: condition_3,
            }));


            e.preventDefault();
          }}
        >
          {/* <h2>Christian Adelmund</h2>
          <p className="secondary">hdI4yZ5ew18JH4JW9jbhUFrviQzM7</p> */}
          {/*
          <div className="top-right">
            <button className="secondary">Import</button>
          </div> */}

          <div className="patient-id mt-5">
            <h3>Patient ID</h3>
            <input
              className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              id="condition-1"
              type="text"
              placeholder="123"
              onChange={(e) => {
                setPatientID(e.target.value);
              }}
            ></input>
          </div>

          <div className="datetime mt-5">
            <h3>Valid Until</h3>
            <input
              className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              id="condition-1"
              type="text"
              placeholder="YYYY-MM-DD"
              onChange={(e) => {
                setValidUntil(e.target.value);
              }}
            ></input>
          </div>

          <div className="blood-pressure mt-5">
            <h3>Blood Pressure</h3>
            <input
              className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              id="condition-1"
              type="text"
              placeholder="90"
              onChange={(e) => {
                setBloodPressure(e.target.value);
              }}
            ></input>
          </div>

          <div className="coditions mt-5">
            <h3>Condition #1</h3>
            <input
              className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              id="condition-1"
              type="text"
              placeholder="True"
              onChange={(e) => {
                setCondition_1(e.target.value);
              }}
            ></input>
          </div>

          <div className="coditions mt-5">
            <h3>Condition #2</h3>
            <input
              className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              id="condition-1"
              type="text"
              placeholder="True"
              onChange={(e) => {
                setCondition_2(e.target.value);
              }}
            ></input>
          </div>

          <div className="coditions mt-5">
            <h3>Condition #3</h3>
            <input
              className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              id="condition-1"
              type="text"
              placeholder="True"
              onChange={(e) => {
                setCondition_3(e.target.value);
              }}
            ></input>
          </div>
          <div className='mt-16'>
            <button
              className="button-main right hover:bg-blue-800 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Generate medical report
            </button>
          </div>
        </form>
        {form1output && (<>
          <h1>Medical report for patient</h1>
          <a className="my-5" href={'https://berkeley.minaexplorer.com/transaction/' + state.hash}><code>{state.hash}</code></a>
          <pre className="bg-gray-100 text-gray-800 p-4 rounded-md overflow-auto shadow-md">
            <code>{form1output}</code>
          </pre>
        </>)}
        </div>

        <div className="employer">
        <h1>Employer - Request Accomodation Proof from Patient</h1>
        <NewRequest submitRequest={submitRequest} />
        {form2output && (<>
          <h1>Requirements request for patient</h1>
          <pre className="bg-gray-100 text-gray-800 p-4 rounded-md overflow-auto shadow-md">
            <code>{form2output}</code>
          </pre>
        </>)}
        
        <h1>Employer - Verify Accomodation Proof</h1>
        <VerifyAccomProof submitVerifyAccomProof={submitVerifyAccomProof} />
        {form4output && (<>
          <h1>Accomodation proof verified!</h1>
          {/* <a className="my-5" href={'https://berkeley.minaexplorer.com/transaction/' + state.hash}><code>{state.hash}</code></a> */}
        </>)}

        </div>

        <div className="patient">
        <h1>Patient - Submit Accommodation Proof</h1>
        <AccomProof submitAccomProof={submitAccomProof} />
        {form3output && (<>
          <h1>Accomodation proof submitted!</h1>
          <a className="my-5" href={'https://berkeley.minaexplorer.com/transaction/' + state.hash}><code>{state.hash}</code></a>
        </>)}

        <form className="main-form" action="" method="get">
            <h2>Employer Requests</h2>

            <div className="tertiary-group">
                <h4 className="green">PASS</h4>
                <p>Company Name: <span>Fake Starbucks</span></p>
                <p>Accommodations: <span>Reserved Parking</span></p>
                <p>Status: <span className="orange">Not Sent</span></p>

                <button
                className="button-main middle right hover:bg-blue-800 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                type="button"
                >
                    ENCRYPT AND PUBLISH
                </button>
            </div>

            <div className="tertiary-group">
                <h4 className="red">NOT PASS</h4>
                <p>Company Name: <span>Fake Starbucks</span></p>
                <p>Accommodations: <span>Flexible Work Hours</span></p>
                <p>Status: <span className="orange">Not Sent</span></p>

                <button
                className="button-main middle right hover:bg-blue-800 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                type="button"
                >
                    ENCRYPT AND PUBLISH
                </button>
            </div>
        </form>

        </div>

        </div>
      </div>


  );

};
