import { ArrowsPointingInIcon, ArrowsPointingOutIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import React from 'react';
import { useState } from 'react';

function debounce<T extends Function>(cb: T, wait = 20) {
    let h: any = 0;
    let callable = (...args: any) => {
        clearTimeout(h);
        h = setTimeout(() => cb(...args), wait);
    };
    return (callable as any) as T;
}

export function MultiPage({ children }: { children: any }) {
    const [maximizedWindow, setMaximizedWindow] = useState(undefined as undefined | number);
    const [dimensions, setDimensions] = React.useState({
        height: window.innerHeight,
        width: window.innerWidth
    })

    React.useEffect(() => {
        const debouncedHandleResize = debounce(function handleResize() {
            setDimensions({
                height: window.innerHeight,
                width: window.innerWidth
            })
        }, 200)

        window.addEventListener('resize', debouncedHandleResize)

        return ((_: any) => {
            window.removeEventListener('resize', debouncedHandleResize)
        }) as unknown as any;
    });


    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 5x + 3y = vw
    // 50 + 3y = vw
    // 3y = vw - 50
    // y = (vw - 50) / 3
    // x = 10
    // 
    // y / vw

    const lengthOfWindow = Math.ceil((vw - (40)) / 3)
    const zoomFactor = (lengthOfWindow) / vw;
    const heightOfWindow = Math.ceil((zoomFactor) * vh);

    console.log(lengthOfWindow, heightOfWindow)

    function calcTop() {
        return vh / 2 - (zoomFactor * vh / 2)
    }

    function calcLeft(index: number) {
        return (index + 1) * 10 + (index) * lengthOfWindow
    }

    function Window({ element, index, isMaximized, onMaximizeClicked, onMinimizeClicked }: { element: React.ReactElement, index: number, isMaximized: boolean, onMaximizeClicked: (index: number) => void, onMinimizeClicked: (index: number) => void }) {

        const maximizeButtons = <div key={index + "_buttons"} className='flex justify-center mb-1 w-full'>
            <div className="border border-black transition group hover:bg-black hover:cursor-pointer" onClick={() => onMaximizeClicked(index)}>
                <ArrowsPointingOutIcon className="m-1 w-3 h-3 transition group-hover:text-white" />
            </div>
        </div>;

        const minimizeButtons = <div className='absolute z-10 w-full'>
            <div key={index + "_buttons"} className='flex relative justify-center mt-2 w-full'>
                <div className="border border-black transition group hover:bg-black hover:cursor-pointer" onClick={() => onMinimizeClicked(index)}>
                    <ArrowsPointingInIcon className="m-1 w-3 h-3 transition group-hover:text-white" />
                </div>
            </div></div>;

        const contentBorderClasses = isMaximized ? "" : "border border-black shadow-md";

        const left = isMaximized ? 0 : calcLeft(index);
        const top = isMaximized ? 0 : calcTop();
        const zoom = isMaximized ? 1 : zoomFactor;

        const marginLeft = isMaximized ? 0 : ((vw - lengthOfWindow) / -2);
        const marginRight = isMaximized ? 0 : ((vw - lengthOfWindow) / -2);
        const marginTop = isMaximized ? 0 : ((vh - heightOfWindow) / -2);
        const marginBottom = isMaximized ? 0 : ((vh - heightOfWindow) / -2);

        const content = <div key={index + "_content"} className={contentBorderClasses + " z-[5]"} >
            <div className='relative' style={({})}>
                <div className="absolute" style={({ zIndex: "4", "width": lengthOfWindow + "px", "height": heightOfWindow + "px" })}>
                    <div className={"transition"} style={({ "marginLeft": marginLeft + "px", "marginRight": marginRight + "px", "marginTop": marginTop + "px", "marginBottom": marginBottom + "px", "transform": "scale(" + zoom + ")", "transitionProperty": "scale, margin" })}>
                        <div className="w-screen h-screen bg-white" key={index} >
                            {element}
                        </div>
                    </div>
                </div>
            </div>

            <div style={({ "width": lengthOfWindow + "px", "height": heightOfWindow + "px" })}>

            </div>
        </div>

        // Minimierte Ansicht
        return <>
            {isMaximized ? minimizeButtons : <></>}
            
            <div key={index + "_window"} className="absolute transition" style={({ "zIndex": isMaximized ? "6" : "4", "transitionProperty": "top, left, zoom", top: top + "px", left: left + "px" })}>
                {isMaximized ? <></> : maximizeButtons}
                {content}
            </div>
        </>
    }

    return (<div className="overflow-hidden relative w-full h-screen">
        {children.map((it: React.ReactElement, index: number) => {
            return Window({ onMinimizeClicked: (index) => setMaximizedWindow(undefined), onMaximizeClicked: (index) => setMaximizedWindow(index), index: index, element: it, isMaximized: maximizedWindow === index })
        }
        )
        }


    </div>);
}