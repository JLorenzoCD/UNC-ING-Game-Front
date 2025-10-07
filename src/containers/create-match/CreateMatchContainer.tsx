import { Link } from "react-router";

import { useHttpService } from "@/contexts/HttpServiceContext";
import { FRONTEND_PATHS } from "@/constants/frontend";

import Button from "@/components/Button";
import CreateMatchForm from "./components/CreateMatchForm/CreateMatchForm";

export default function CreateMatchContainer() {
  const { httpService } = useHttpService();

  return (
    <>
      <Link to={FRONTEND_PATHS.MATCH_LIST} className="block mx-auto w-60 my-5">
        <Button className="w-full">List of matches</Button>
      </Link>

      {httpService != null && (
        <CreateMatchForm handleCreateMatch={httpService.createMatch} />
      )}
    </>
  );
}
