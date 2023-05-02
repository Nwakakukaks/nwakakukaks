import Sidebar from "@/components/Sidebar";

export default function UserRequest() {
    return (
        <div>
           <Sidebar />
        <div className="generate-keys">
        <h1>Fake Starbucks</h1>
        <p className="secondary">GRIBOgIBAAJBAKj34GkxFhD90vcNLJK</p>

        <form className="main-form" action="" method="get">
            <h2>Request Data</h2>
            <div className="inner-form-container">
                <input
                className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                id="condition-1"
                type="text"
                placeholder="Paste Request Data from Company"
                ></input>
            </div>

            <button
            className="button-main right hover:bg-blue-800 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            type="button"
            >
                Submit
            </button>
        </form>

        <form className="main-form" action="" method="get">
            <h2>Your Requests</h2>

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

    );
};