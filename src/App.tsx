import Canvas from "@/components/Canvas";
import UtilsMenu from "@/components/UtilsMenu";
import ToolsMenu from "@/components/ToolMenu";
import CursorOverlay from "@/components/CursorOverlay";
import ToolSettingMenu from "@/components/ToolSettingMenu";

function App() {
  return (
    <div className="h-screen w-full">
      <ToolsMenu />
      <Canvas />
      <CursorOverlay />
      <ToolSettingMenu />
      <UtilsMenu />
    </div>
  );
}

export default App;
