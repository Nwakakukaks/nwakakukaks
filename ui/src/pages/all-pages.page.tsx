import NewReport from "./index.page";
import NewRequest from "./new-request.page";
import Patients from "./patients.page";

export default function AllPages() {
  return (
    <div>
      <NewReport/>
      <NewRequest/>
      <Patients/>
    </div>
  )
}
