import Button from '@/components/ui/button';

import Canvas from '@/components/Canvas/Canvas';
import CursorOverlay from '@/components/Canvas/CursorOverlay';
import ToolsMenu from '@/components/Canvas/ToolMenu';
import ToolSettingMenu from '@/components/Canvas/ToolSettingMenu';
import UtilsMenu from '@/components/Canvas/UtilsMenu';
import ZoomMenu from '@/components/Canvas/ZoomMenu';
import CollaboratorsMenu from '@/components/Collaboration/CollaboratorsMenu';

export default function CollaborativePlayground() {
    return (
        <div className="relative h-screen w-full overflow-hidden">
            <Button
                // onClick={handleOpen}
                variant={'outline'}
                className="absolute top-5 right-5"
            >
                Exit
            </Button>
            <ToolsMenu />
            <Canvas />
            <CollaboratorsMenu />
            <CursorOverlay />
            <ZoomMenu />
            <ToolSettingMenu />
            <UtilsMenu />
        </div>
    );
}
