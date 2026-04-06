import { useState } from 'react';

import { Share2 } from 'lucide-react';

import Button from '@/components/ui/button';

import Canvas from '@/components/Canvas/Canvas';
import CursorOverlay from '@/components/Canvas/CursorOverlay';
import ToolsMenu from '@/components/Canvas/ToolMenu';
import ToolSettingMenu from '@/components/Canvas/ToolSettingMenu';
import UtilsMenu from '@/components/Canvas/UtilsMenu';
import ZoomMenu from '@/components/Canvas/ZoomMenu';
import CollabSessionPanel from '@/components/Collaboration/CollabSessionPanel';

export default function Playground() {
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
                variant={'outline'}
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
