interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ children, onClick }: ButtonProps) {
  return (
    <button className="button" type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
