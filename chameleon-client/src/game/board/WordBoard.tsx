import { ChameleonPlayerView, NotChameleonPlayerView } from "../ChameleonGame";
import { isChameleon } from "./StateUtils";

function Card({text, isSelectedWord}: { text: string, isSelectedWord: boolean }) {
    const content = isSelectedWord ? <mark>{text}</mark> : <>{text}</>;

    return <div key={text}
                className="flex justify-center items-center p-2 m-1 rounded-lg border border-black">
        {content}
    </div>
}


export function WordBoard({playerView}: { playerView: ChameleonPlayerView | NotChameleonPlayerView }) {
    return <div>
        <div className="grid grid-cols-[repeat(4,_min-content)]">
            {playerView.words.map((it, index) => <Card
                key={it}
                text={it}
                isSelectedWord={!isChameleon(playerView) && playerView.word_to_describe === index}/>
            )}
        </div>
    </div>;
}
