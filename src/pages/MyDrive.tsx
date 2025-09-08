import { GoogleDriveLayout } from "@/components/GoogleDriveLayout";
import { useParams } from "react-router-dom";

const MyDrive = () => {
  const { folderId } = useParams();
  return <GoogleDriveLayout currentFolderId={folderId} />;
};

export default MyDrive;