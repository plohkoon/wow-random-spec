import { PlayerTable } from "./components/playerTable";
import { usePlayers } from "./lib/usePlayers";

function App() {
  const { players, setPlayers, updatePlayer, deletePlayer, addPlayer } =
    usePlayers();

  return (
    <main>
      <h1>Dylan's Random WoW Extravaganza</h1>

      <section>
        <h2>Players</h2>

        <PlayerTable players={players} />
      </section>

      <section>
        <h2>Roles</h2>
      </section>

      <section>
        <h2>Add a Player</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name") as string;
            const score = parseInt(formData.get("score") as string);
            const main = formData.get("main") as string;
            const role = formData.get("role") as string;

            addPlayer({
              name,
              score,
              main,
              role,
            });
          }}
        >
          <input type="text" placeholder="Name" name="name" />
          <input type="text" placeholder="Score" name="score" />
          <input type="text" placeholder="Main" name="main" />
          <input type="text" placeholder="Role" name="role" />
          <button type="submit">Add Player</button>
        </form>
      </section>
    </main>
  );
}

export default App;
