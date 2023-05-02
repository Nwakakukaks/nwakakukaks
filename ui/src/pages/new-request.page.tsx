import Sidebar from "@/components/Sidebar";
import { RequirementsFormInput } from "@/util";
import { useState } from "react";

export default function NewRequest({ submitRequest }: { submitRequest: (x: RequirementsFormInput) => void }) {
  let [patientId, setPatientId] = useState("");
  let [verifyTime, setVerifyTime] = useState("");
  let [minBloodPressure, setMinBloodPressure] = useState("");
  let [maxBloodPressure, setMaxBloodPressure] = useState("");
  let [allowConditionA, setAllowConditionA] = useState(false as boolean | string);
  let [allowConditionB, setAllowConditionB] = useState(false as boolean | string);
  let [allowConditionC, setAllowConditionC] = useState(false as boolean | string);

  return (
    <form
      className="main-form"
      onSubmit={(e: any) => {
        submitRequest({
          patientId,
          verifyTime,
          minBloodPressure,
          maxBloodPressure,
          allowConditionA,
          allowConditionB,
          allowConditionC
        })

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
          type="text"
          placeholder="123"
          onChange={(e) => {
            setPatientId(e.target.value);
          }}
        ></input>
      </div>

      <div className="datetime mt-5">
        <h3>Verify Date</h3>
        <input
          className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          placeholder="YYYY-MM-DD"
          onChange={(e) => {
            setVerifyTime(e.target.value);
          }}
        ></input>
      </div>

      <div className="blood-pressure mt-5">
        <h3>Minimum Blood Pressure</h3>
            <input
          className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          placeholder="90"
          onChange={(e) => {
            setMinBloodPressure(e.target.value);
          }}
            ></input>
      </div>


      <div className="blood-pressure mt-5">
        <h3>Maximum Blood Pressure</h3>
            <input
          className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          placeholder="90"
          onChange={(e) => {
            setMaxBloodPressure(e.target.value);
          }}
            ></input>
      </div>

      <div className="coditions mt-5">
        <h3>Allow Condition #1</h3>
            <input
          className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          placeholder="True"
          onChange={(e) => {
            setAllowConditionA(e.target.value);
          }}
            ></input>
      </div>

      <div className="coditions mt-5">
        <h3>Allow Condition #2</h3>
        <input
          className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          placeholder="True"
          onChange={(e) => {
            setAllowConditionB(e.target.value);
          }}
        ></input>
      </div>

      <div className="coditions mt-5">
        <h3>Allow Condition #3</h3>
        <input
          className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          placeholder="True"
          onChange={(e) => {
            setAllowConditionC(e.target.value);
          }}
        ></input>
      </div>
      <div className='mt-16'>
        <button
          className="button-main right hover:bg-blue-800 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Generate Accomodation Proof Request
        </button>
      </div>
    </form>
  );
};
