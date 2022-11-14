import { ChameleonPlayerView, NotChameleonPlayerView } from "../ChameleonGame";
import { isChameleon } from "./StateUtils";

function Card({ text, index, isCorrectWord, isWordSelectedByChameleon, selectable, onSelectWord }: { text: string, index: number, isCorrectWord: boolean, isWordSelectedByChameleon: boolean, selectable: boolean, onSelectWord: (wordIndex: number) => void }) {
    const hoverClasses = selectable ? "hover:shadow-md hover:bg-black hover:text-white hover:cursor-pointer" : "";
    const colorClasses = isCorrectWord && isWordSelectedByChameleon ? "bg-gradient-to-r from-yellow-300 to-green-300" : (isCorrectWord ? "bg-yellow-300" : (isWordSelectedByChameleon ? "bg-red-300" : ""));

    return <div key={text}
        onClick={() => onSelectWord(index)}
        className={`flex justify-center items-center p-2 m-2 w-32 h-16 rounded-lg border border-black transition ${hoverClasses} ${colorClasses}`}>
        {text}
    </div>
}


export function WordBoard({
    playerView,
    selectable,
    onSelectWord
}: { playerView: ChameleonPlayerView | NotChameleonPlayerView, selectable: boolean, onSelectWord: (wordIndex: number) => void }
) {
    return <div>
        <div className="grid grid-cols-4 p-2 rounded-lg border border-black">
            {playerView.words.map((it, index) => <Card
                selectable={selectable}
                key={it}
                index={index}
                text={it}
                isWordSelectedByChameleon={playerView.chameleonChosenWordIndex !== null && playerView.chameleonChosenWordIndex === index}
                isCorrectWord={playerView.word_to_describe !== null && playerView.word_to_describe === index}
                onSelectWord={onSelectWord}
            />
            )}
        </div>
    </div>;
}
