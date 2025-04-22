import { ClassInput } from "./components/classInput";
import { PlayerTable } from "./components/playerTable";
import { RoleInput } from "./components/roleInput";
import { PinwheelModal } from "./components/pinwheelModal";
import { usePlayers } from "./lib/usePlayers";
import { RolesTables } from "./components/rolesTables";
import { Button } from "./components/ui/button";

function App() {
  const { addPlayer } = usePlayers();

  return (
    <main>
      <PinwheelModal />
      <div className="w-full p-4">
        <h1 className="text-4xl font-bold">
          <img src="/logo.png" alt="Logo" className="h-16 w-16 inline-block" />
          Dylan's Random WoW Extravaganza
        </h1>

        <section></section>

        <section>
          <h2 className="text-2xl font-semibold">Add a Player</h2>

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
            className="flex flex-row space-x-4 p-4"
          >
            <input type="text" placeholder="Name" name="name" />
            <input type="text" placeholder="Score" name="score" />
            <ClassInput />
            <RoleInput />
            <Button type="submit">Add Player</Button>
          </form>

          <h2 className="text-2xl font-semibold">Players</h2>

          <PlayerTable />
        </section>

        <section className="min-h-screen">
          <h2 className="text-2xl font-semibold">Roles</h2>

          <RolesTables />
        </section>
      </div>
    </main>
  );
}

export default App;
