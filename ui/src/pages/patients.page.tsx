import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default function Patients() {
  let patients = [
    {
      name: "Samantha Hopkins",
      num_past_reports: 0,
      last_report_date: "1/1/2000",
      accommodations: "None",
      public_key: "abc",
    },
    {
      name: "Jonathan Hsieh",
      num_past_reports: 2,
      last_report_date: "3/3/1999",
      accommodations: "None",
      public_key: "abc",
    },
    
    {
      name: "Jessica Langdon",
      num_past_reports: 0,
      last_report_date: "12/19/1978",
      accommodations: "None",
      public_key: "abc",
    }
  ];
  return (
    <div>
        <Sidebar />
        <div className="patients bg-gray-100 w-{100rem} generate-keys">
      <h1>Patients</h1>
      <form className="main-form" action="" method="get">
        {patients.map(({ name, num_past_reports, last_report_date, accommodations, public_key }) => (
          <SinglePatientBlock
            key={name}
            name={name}
            accommodations={accommodations}
            num_past_reports={num_past_reports}
            last_report_date={last_report_date}
            public_key={public_key}
          />
        ))}
      </form>
    </div>

    </div>
    );
};

function SinglePatientBlock ({name, num_past_reports, last_report_date, accommodations, public_key} : { name: string, num_past_reports: number, last_report_date: string, accommodations: string, public_key: string}) {
    return (
      <div className='single-patient-block box w-{95rem}'>
        <div className="tertiary-group">
          <h4>{name}</h4>
          <p>Past Reports: <span>{num_past_reports}</span></p>
          <p>Last Report Date: <span>{last_report_date}</span></p>
          <p>Accommodations: <span>{accommodations}</span></p>
          <p>Public Key: <span>{public_key}</span></p>
  
          <Link href="/new-report">
            <button
            className="button-main middle right hover:bg-blue-800 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            type="button"
            >
              Request New Report
            </button>
          </Link>
        </div>
      </div>
    )
  }
  