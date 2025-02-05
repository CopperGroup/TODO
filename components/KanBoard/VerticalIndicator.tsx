
const VerticalIndicator = ({ beforeId, column }: { beforeId: string | null, column: string} ) => {
    return (
      <div
        data-before-position={beforeId || "-1"}
        data-current-column={column} 
        className="my-0.5 h-full min-w-0.5 bg-violet-400 opacity-0">
      </div>
    )
  }
  
  export default VerticalIndicator;