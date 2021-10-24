type Props = {
  children: JSX.Element[];
  columns: number;
};

export function Grid({ children, columns }: Props) {
  return (
    <div
      className="sponsors-grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridGap: 10,
        padding: 10,
      }}
    >
      {children}
    </div>
  );
}
