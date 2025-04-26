import { ClassInput } from "./components/classInput";
import { PinwheelModal } from "./components/pinwheelModal";
import { PlayerTable } from "./components/playerTable";
import { RoleInput } from "./components/roleInput";
import { TeamTable } from "./components/teamTable";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { useDarkMode } from "./lib/useDarkmode";
import { usePlayers } from "./lib/usePlayers";

function App() {
  const { addPlayer } = usePlayers();
  const { isDarkMode, setDarkMode } = useDarkMode();

  return (
    <main>
      <PinwheelModal />
      <div className="w-full p-4 space-y-12">
        <div className="flex flex-row items-center space-x-4">
          <img src="/logo.png" alt="Logo" className="h-16 w-16 inline-block" />
          <h1 className="text-4xl font-bold grow">
            First Seasonal Tito and Dom's M+ Adventure
          </h1>
          <div className="flex flex-row items-center space-x-2">
            <Label>Dark Mode</Label>
            <Switch
              name="darkmode"
              id="darkmode"
              onCheckedChange={(v) => setDarkMode(v)}
              checked={isDarkMode}
            />
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-semibold">Add a Player</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get("name") as string;
              const main = formData.get("class") as string;
              const role = formData.get("role") as string;
              const team = formData.get("team") as string;

              addPlayer({
                name,
                main,
                role,
                team,
              });
            }}
            className="flex flex-row space-x-4 p-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input type="text" placeholder="Name" name="name" id="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Normal Class</Label>
              <ClassInput />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Assigned Role</Label>
              <RoleInput />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Input placeholder="Team" name="team" id="team" />
            </div>
            <Button type="submit">Add Player</Button>
          </form>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Players</h2>

          <PlayerTable />
        </section>

        {/* <section className="min-h-[95vh]">
          <h2 className="text-2xl font-semibold">Roles</h2>

          <RolesTables />
        </section> */}

        <section className="min-h-[95vh]">
          <h2 className="text-2xl font-semibold">Teams</h2>

          <TeamTable />
        </section>
      </div>
    </main>
  );
}

export default App;
