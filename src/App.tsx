import { ClassInput } from "./components/classInput";
import { PlayerTable } from "./components/playerTable";
import { RoleInput } from "./components/rolInput";
import { usePlayers } from "./lib/usePlayers";

function App() {
  const { addPlayer } = usePlayers();

  return (
    <main>
      <h1>Dylan's Random WoW Extravaganza</h1>

      <section>
        <h2>Players</h2>

        <PlayerTable />
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
            const main = formData.get("class") as string;
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
          <ClassInput />
          <RoleInput />
          <button type="submit">Add Player</button>
        </form>
      </section>
    </main>
  );
}

export default App;
