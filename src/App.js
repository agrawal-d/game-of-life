import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import shapes from './interestingShapes.png'

function App () {
  const [generation, setGeneration] = useState(0)
  const [baseDim, setBaseDim] = useState(700)
  const [isPaused, setIsPaused] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const [updateSpeed, setUpdateSpeed] = useState(1000)
  const [gridSize, setGridSize] = useState({ x: 10, y: 10 })
  const [cellColor, setCellColor] = useState('#7ADC1D')
  const [totalAlive, setTotalAlive] = useState(0)
  const [processTime, setProcessTime] = useState(0)
  const [grid, setGrid] = useState(
    new Array(10).fill(0).map(() => new Array(10).fill(false))
  )

  useEffect(() => {
    if (window.screen.availWidth < 800) {
      setBaseDim(window.screen.availWidth - 100)
    }
  }, [])

  const handleCellClick = useCallback((x, y) => {
    const newGrid = [...grid]
    newGrid[x][y] = !grid[x][y]
    setTotalAlive(totalAlive + (grid[x][y] ? 1 : -1))
    setGrid(newGrid)
  }, [totalAlive, grid])

  const resetGrid = useCallback(() => {
    const newGrid = new Array(gridSize.x).fill(0).map(() => new Array(gridSize.y).fill(false))
    setGrid(newGrid)
    setGeneration(0)
    setTotalTime(0)
  }, [gridSize])

  useEffect(() => {
    const processGeneration = () => {
      const init = Date.now()
      let newTotalAlive = 0
      const newGrid = new Array(gridSize.x).fill(0).map(() => new Array(gridSize.y).fill(false))
      for (let x = 0; x < gridSize.x; x++) {
        for (let y = 0; y < gridSize.y; y++) {
          newGrid[x][y] = grid[x][y]
        }
      }
      for (let x = 0; x < gridSize.x; x++) {
        for (let y = 0; y < gridSize.y; y++) {
          let numNeighbours = 0
          if (x - 1 >= 0) {
            numNeighbours += grid[x - 1][y] | 0
          }
          if (y - 1 >= 0) {
            numNeighbours += grid[x][y - 1] | 0
          }
          if (x + 1 < gridSize.x) {
            numNeighbours += grid[x + 1][y] | 0
          }
          if (y + 1 < gridSize.y) {
            numNeighbours += grid[x][y + 1] | 0
          }
          if (x - 1 >= 0 && y - 1 >= 0) {
            numNeighbours += grid[x - 1][y - 1] | 0
          }
          if (x - 1 >= 0 && y + 1 < gridSize.y) {
            numNeighbours += grid[x - 1][y + 1] | 0
          }
          if (x + 1 < gridSize.x && y - 1 >= 0) {
            numNeighbours += grid[x + 1][y - 1] | 0
          }
          if (x + 1 < gridSize.x && y + 1 < gridSize.y) {
            numNeighbours += grid[x + 1][y + 1] | 0
          }
          if (x === 1 && y === 0) {
            console.log(grid[x][y], numNeighbours)
          }
          if (grid[x][y] && (numNeighbours === 2 || numNeighbours === 3)) {
            newGrid[x][y] = true
            newTotalAlive++
          } else if (!grid[x][y] && numNeighbours === 3) {
            newGrid[x][y] = true
            newTotalAlive++
          } else {
            // console.log('cell ', x, y, 'died as it has', numNeighbours, 'neighbours')
            newGrid[x][y] = false
          }
        }
      }
      setGrid(newGrid)
      setTotalAlive(newTotalAlive)
      const end = Date.now()
      setProcessTime(end - init)
    }

    let generationTimer
    if (!isPaused) {
      generationTimer = setInterval(() => {
        processGeneration()
        setGeneration(generation + 1)
        setTotalTime(totalTime + updateSpeed)
      }, updateSpeed)
    }
    return () => {
      clearInterval(generationTimer)
    }
  }, [generation, grid, gridSize.x, gridSize.y, isPaused, totalTime, updateSpeed])

  const cellDim = baseDim / gridSize.x
  const renderedGrid = []
  for (let x = 0; x < gridSize.x; x++) {
    let count = 0
    const renderedRow = []
    for (const cell of grid[x]) {
      const currentCount = count
      if (cell) {
        renderedRow.push(<div className="cell cell-alive" key={'cell' + x + currentCount} style={{ width: cellDim + 'px', height: cellDim + 'px', backgroundColor: cellColor }} onClick={() => { handleCellClick(x, currentCount) }}></div>)
      } else {
        renderedRow.push(<div className="cell cell-dead" key={'cell' + x + currentCount} style={{ width: cellDim + 'px', height: cellDim + 'px' }} onClick={() => { handleCellClick(x, currentCount) }}></div>)
      }
      count++
    }
    renderedGrid.push(<div className="cell-row" key={'row' + x} style={{ height: cellDim + 'px' }}>{renderedRow}</div>)
  }

  const handleColor = (e) => {
    setCellColor(e.target.value)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleGridSize = (e) => {
    setBaseDim(parseInt(e.target.value) || 100)
  }

  const handleUpdateSpeed = (e) => {
    setUpdateSpeed(parseInt(e.target.value) || 1)
  }

  const handleGridX = (e) => {
    const x = Math.max(parseInt(e.target.value), 1) || 1
    const newGrid = new Array(x).fill(0).map(() => new Array(x).fill(false))
    setGrid(newGrid)
    setGridSize({ y: x, x: x })
  }

  const handleGridY = (e) => {
    const y = Math.max(parseInt(e.target.value), 1) || 1
    const newGrid = new Array(y).fill(0).map(() => new Array(y).fill(false))
    setGrid(newGrid)
    setGridSize({ x: y, y: y })
  }

  return (
    <div className="container">
      <h1>Conway&apos;s Game of Life</h1>
      <b>Rules</b>
      <ol>

        <li>
          Any live cell with fewer than two live neighbours dies, as if by underpopulation.
        </li>
        <li>
          Any live cell with two or three live neighbours lives on to the next generation.
        </li>
        <li>
          Any live cell with more than three live neighbours dies, as if by overpopulation.
        </li>
        <li>
          Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        </li>
      </ol>
      <div className="app">
        <div className="game" style={{ width: baseDim + 'px' }}>
          <div className="cell-grid">{renderedGrid}</div>
        </div>
      </div>

      <div className="settings">
        <h2>Settings</h2>
        <p>Click on a cell to toggle its state (alive/dead).</p>
        <fieldset>
          <legend>General settings</legend>
          <p>Toggle game</p>
          <button onClick={handlePause}>{isPaused ? '▶ Start' : '■  Stop'}</button>
          <p>Alive cell color</p>
          <input type="color" value={cellColor} onChange={handleColor} />
          <p>Update speed (ms)</p>
          <input value={updateSpeed} type="number" onChange={handleUpdateSpeed} />
          <p>Grid display dimensions (px)</p>
          <input value={baseDim} type="number" onChange={handleGridSize} min={1} />
        </fieldset>
        <fieldset>
          <legend>Base settings</legend>
          <p className="warn">Warning: Changing the base settings will reset the grid.</p>
          <p className="warn">Warning: Large grid sizes can cause the app to become unresponsive. Sizes smaller than 100&times;100 are safer.</p>

          <p>Grid Dimensions</p>
          <input className="dim" value={gridSize.x} type="number" onChange={handleGridX} />
          &times;
          < input className="dim" value={gridSize.y} type="number" onChange={handleGridY} />
          <p>Reset cells</p>
          <button onClick={resetGrid}>Reset</button>
        </fieldset>
        <p>Created by By <a href="agrawal-d.github.io/">agrawal-d</a></p>
        <p><a href="https://github.com/agrawal-d/game-of-life/blob/master/src/App.js">Source Code</a></p>

      </div>
      <div className="clearfix"></div>
      <div className="stats">
        <h2>Stats</h2>
        <p>Generation count: {generation}</p>
        <p>Total Runtime: {totalTime / 1000}s</p>
        <p>Last generation processing time: {processTime}ms</p>

        <p>Total cells: {gridSize.x * gridSize.y}</p>
        <p>Total alive cells: {totalAlive}</p>
        <p>Total dead cells: {gridSize.x * gridSize.y - totalAlive}</p>
        <p>For more information, see <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life">https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life</a></p>

        <h2>Interesting Shapes</h2>
        <img src={shapes} alt="Interesting shapes" style={{ width: '100%', maxWidth: '500px' }} />
      </div>
    </div>
  )
}

export default App
