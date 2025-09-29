import { useParams } from "react-router";

function LobbyPage() {
  const { matchId } = useParams();

  return <div>LobbyPage of matchId: {matchId}</div>;
}

export default LobbyPage;
