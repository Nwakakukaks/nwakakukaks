import Link from "next/link";
import { FiUser } from "react-icons/fi";
import { RiHospitalFill } from "react-icons/ri";
import { TbReportMedical } from "react-icons/tb";
import React, { useContext } from 'react';
import UserTypeContext from '../contexts/UserTypeContext';
import { FaUser, FaBuilding, FaStethoscope } from 'react-icons/fa';

const NavigationBar = () => {
  const { userRole } = useContext(UserTypeContext);
  return (
    <div className="sidenav flex-col flex w-48">
      <div><img id="logo" src="/assets/cc-logo.svg"></img></div>
      <div className="links-container ml-10">

        <div>
            <button id="doctorBtn" className="circular-button">
                <FaUser />
            </button>
            <button id="employerBtn" className="circular-button">
                <FaBuilding />
            </button>
            <button id="patientBtn" className="circular-button">
                <FaStethoscope />
            </button>
        </div>

        {userRole === 'doctor' && <Link className="nav-item mt-5" href="/patients">
          <button className="btn-col-main hover:bg-blue-700 text-white py-2 px-4 rounded">
            <RiHospitalFill /> Patients
          </button>
        </Link>}

        {userRole === 'company' && <Link className="nav-item mt-5" href="/new-request">
          <button className="btn-col-main hover:bg-blue-700 text-white py-2 px-4 rounded">
            <TbReportMedical /> New Request
          </button>
        </Link>}

        {userRole === 'user' && <Link className="nav-item mt-5" href="/user-request">
          <button className="btn-col-main hover:bg-blue-700 text-white py-2 px-4 rounded">
            <TbReportMedical /> Requests
          </button>
        </Link>}

        <Link className="nav-item mt-5" href="/profiles">
          <button className="bg-white text-black py-2 px-4 rounded">
            <FiUser /> Profile
          </button>
        </Link>
      </div>
    </div>
  );
}

const Header = () => {
  const { userRole } = useContext(UserTypeContext);
  return (
    <div className="heading-container bg-main">
      {userRole === 'doctor' && <div className="profile-info text-lg large-font heading-font shrink-0 mx-5 mt-2 ">
        <h3>Hospital</h3>
        <p>MIIBOgIBAAJBAKj34GkxFhD90vcNLYL</p>
      </div>}

      {userRole === 'user' && <div className="profile-info text-lg large-font heading-font shrink-0 mx-5 mt-2 ">
        <h3>Ruby Adelmund</h3>
        <p>hdI4yZ5ew18JH4JW9jbhUFrviQzM7</p>
      </div>}

      {userRole === 'company' && <div className="profile-info text-lg large-font heading-font shrink-0 mx-5 mt-2 ">
        <h3>Fake Starbucks</h3>
        <p>GRIBOgIBAAJBAKj34GkxFhD90vcNLJK</p>
      </div>}
      <NavigationBar />
    </div>
  );
}

export default Header
