const Button = ({ text, ...props }) => {
    return (
        <button
            className="cursor-pointer rounded-full border border-purple-200 px-4 py-1 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700"
            {...props}
        >
            {text}
        </button>
    );
};

export default Button;
