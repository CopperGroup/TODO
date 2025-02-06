
const VerticalIndicator = ({ beforeId }: { beforeId: string | null } ) => {
    return (
      <div
        data-beforecolumn={beforeId || "-1"}
        data-iscolumn="true" 
        className="mx-0.5 h-full min-w-0.5 max-w-0.5 bg-violet-400 opacity-0">
      </div>
    )
  }
  
  export default VerticalIndicator;