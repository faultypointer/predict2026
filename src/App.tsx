import MatchCard from "./components/fixtures/MatchCard"
import { matches } from "./data/matches"

function App() {
  return (
    <MatchCard match={matches.at(0) !!} />
  )
}

export default App
