const GameStatus = ({Game}) => {
  return (
    <div>
      <div className={`alignJustCenter bg-error-main m-2 rounded-lg px-10 py-4 text-white`}>{Game?.status}</div>
    </div>
  )
}

export default GameStatus
