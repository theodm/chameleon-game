export function ButtonWithLabel({disabled, text, label, onClick}: { disabled: boolean, text: string, label: string, onClick: () => void }) {

    const classesDisabled = "bg-blue-400 dark:bg-blue-500 cursor-not-allowed"
    const classesEnabled = "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer"

    return <button type="button"                   className={`${disabled ? classesDisabled : classesEnabled} inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white rounded-lg`} onClick={onClick}>
        {text}
        <span
            className="inline-flex items-center justify-center h-4 ml-2 p-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
        {label}
        </span>
    </button>
}