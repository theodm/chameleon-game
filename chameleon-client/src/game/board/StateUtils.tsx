import { ChameleonPlayerView, NotChameleonPlayerView } from "../ChameleonGame"

export function isChameleon(playerView: ChameleonPlayerView | NotChameleonPlayerView): playerView is ChameleonPlayerView {
    return playerView.is_chameleon
}

export function isNotChameleon(playerView: ChameleonPlayerView | NotChameleonPlayerView): playerView is NotChameleonPlayerView {
    return !isChameleon(playerView)
}