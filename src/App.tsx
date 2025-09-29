import { Link } from "react-router";

import { FRONTEND_PATHS } from "./constants/frontendPaths";

// import { useHttpService } from "./contexts/HttpServiceContext";

function App() {
  //   const httpService = useHttpService()
  return (
    <div>
      <h1>Here comes our page content.</h1>
      <div className="min-h-screen flex justify-center items-center">
        <Link
          to={FRONTEND_PATHS.MATCH_LIST}
          className="bg-white p-2 rounded-lg"
        >
          List of matches (luego se elimina esto)
        </Link>
      </div>
    </div>
  );
}

export default App;
