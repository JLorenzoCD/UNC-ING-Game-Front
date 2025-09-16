import { useEffect, useMemo } from 'react'
import { createHttpService } from './services/httpService';

function App() {
  const httpService = useMemo(() => createHttpService(), []);

  useEffect(() => {
    if (!httpService) return;

    console.log("HTTP Service initialized:", httpService);
  }, [httpService]);

  return (
    <div>Here comes our page content.</div>
  )
}

export default App
