import { useState } from "react";

import { Share2 } from "lucide-react";

import Canvas from "@/components/Canvas";
import CollabSessionPanel from "@/components/CollabSessionPanel";
import CursorOverlay from "@/components/CursorOverlay";
import ToolsMenu from "@/components/ToolMenu";
import ToolSettingMenu from "@/components/ToolSettingMenu";
import Button from "@/components/ui/button";
import UtilsMenu from "@/components/UtilsMenu";
import ZoomMenu from "@/components/ZoomMenu";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClose = () => {
    setIsMenuOpen(false);
  };

  const handleOpen = () => {
    setIsMenuOpen(true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Button
        onClick={handleOpen}
        variant={"outline"}
        className="absolute top-5 right-5"
      >
        <Share2 className="size-4" />
      </Button>

      <ToolsMenu />
      <Canvas />
      <CollabSessionPanel isOpen={isMenuOpen} handleClose={handleClose} />
      <CursorOverlay />
      <ZoomMenu />
      <ToolSettingMenu />
      <UtilsMenu />
    </div>
  );
}

export default App;
