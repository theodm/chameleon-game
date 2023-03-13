import {useEffect, useState} from "react";

/**
 * Stellt eine Komponente dar, die über den vollen Bildschirm hinweg, dem
 * Benutzer den aktuellen Status anzeigt.
 *
 * Zum Beispiel informiert das Overlay den Benutzer über Folgendes:
 *  - Du bist das Chamäleon.
 *  - Du bist nicht das Chamäleon.
 *  - Die Abstimmungs- und Diskussionsphase beginnt.
 *
 * @param changeKey Wenn sich dieser Schlüssel ändert, erscheint das Overlay erneut.
 * @param children Inhalt des Overlays
 */
export function Overlay({changeKey, children}: { changeKey: string, children: any }) {
    const [overlayIsShown, setOverlayIsShown] = useState(true);

    // Overlay wird automatisch nach 3 Sekunden ausgeblendet.
    useEffect(() => {
        setOverlayIsShown(true);

        let timer = setTimeout(() => setOverlayIsShown(false), 3000);

        return () => {
            clearTimeout(timer)
        };
    }, [changeKey])

    if (!overlayIsShown) {
        return <></>
    }

    return <div className="flex absolute top-0 right-0 left-0 z-50 justify-center items-center h-full">
        <div
            className="flex relative justify-center items-center w-full h-64 text-2xl text-white bg-black/90">
            <div className="absolute top-1 right-5 text-3xl text-white cursor-pointer top"
                 onClick={() => {
                     setOverlayIsShown(false)
                 }}>×
            </div>
            {children}
        </div>
    </div>
}