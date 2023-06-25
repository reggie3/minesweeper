import {
  setNumberColumns,
  setNumberRows,
  setNumberMines,
  askUserToGuess,
} from "./inputUtilities";

const DEBUG = false;

interface Square {
  index: number;
  isExposed: boolean;
  value: "mine" | "." | number;
  isLeftEdge: boolean;
  isRightEdge: boolean;
}

const squares: Square[] = [];

const exposedSquareIndexes = new Set<number>();
let numberMines = 1;
let numberRows = 3;
let numberColumns = 3;
let numberSquares = numberColumns * numberRows;

// game state flags
let shouldShowMines = true;
let hasLost = false;
let hasWon = false;

const createSquares = () => {
  for (let i = 0; i < numberSquares; i++) {
    squares.push({
      index: i,
      value: ".",
      isExposed: false,
      isLeftEdge: i % numberColumns === 0,
      isRightEdge: (i + 1) % numberColumns === 0,
    });
  }
};

// put the mines on the board
const seedMines = () => {
  let numberMinesToLay = numberMines;
  while (numberMinesToLay > 0) {
    const newMineLocation = Math.floor(numberSquares * Math.random());
    try {
      if (squares[newMineLocation].value !== "mine") {
        squares[newMineLocation].value = "mine";
        numberMinesToLay--;
      }
    } catch (error) {
      console.log(error, newMineLocation);
    }
  }
};

// Add the neighboring mine information to the boards
const initializeNeighboringMines = () => {
  for (let i = 0; i < numberSquares; i++) {
    if (squares[i].value !== "mine") {
      const numberNeighboringMines = getNumberNeighboringMines(i);
      squares[i].value = numberNeighboringMines;
    }
  }
};

// convert the board row into the different visual representations
const getRowToPrint = (rowSquares: Square[], rowIndex: number): string[] => {
  let rowToPrint: string[] = [];

  if (DEBUG) {
    rowToPrint = rowSquares.map((square) => {
      const { value } = square;

      return value === "mine" ? "*" : "" + value;
    });
  } else if (shouldShowMines) {
    rowToPrint = rowSquares.map((square) => {
      const { value } = square;

      return value === "mine" ? "*" : "\u25fc";
    });
  } else {
    rowToPrint = rowSquares.map((square) => {
      // only print the square value if the square's has been previously exposed
      if (square.isExposed) {
        const { value } = square;

        return value === "mine" ? "*" : "" + value;
      }

      return "\u25fc";
    });
  }

  return rowToPrint;
};

const printBoard = () => {
  console.log("\n");

  // print the board header
  console.log(`   `, Array.from(Array(numberColumns).keys()).join(" "), "\n");

  for (let i = 0; i < numberRows; i++) {
    const boardRow = squares.slice(
      i * numberColumns,
      i * numberColumns + numberColumns
    );

    const rowToPrint = getRowToPrint(boardRow, i);

    console.log([`${i}  `, ...rowToPrint].join(" "));
  }
  console.log("\n");
};

const getNumberNeighboringMines = (index: number): number => {
  let neighborIndexes = new Set<number>();

  neighborIndexes.add(index - numberColumns); // above
  if (!squares[index].isLeftEdge) {
    neighborIndexes.add(index - numberColumns - 1);
  } // above left
  if (!squares[index].isRightEdge) {
    neighborIndexes.add(index - numberColumns + 1);
  } // above right

  if (!squares[index].isLeftEdge) {
    neighborIndexes.add(index - 1);
  } // left
  if (!squares[index].isRightEdge) {
    neighborIndexes.add(index + 1);
  } // right

  neighborIndexes.add(index + numberColumns); // below
  if (!squares[index].isLeftEdge) {
    neighborIndexes.add(index + numberColumns - 1);
  } // below left
  if (!squares[index].isRightEdge) {
    neighborIndexes.add(index + numberColumns + 1);
  } // below right

  const validNeighborIndexes = new Set(
    [...neighborIndexes].filter(
      (neighborIndex) => neighborIndex >= 0 && neighborIndex < numberSquares
    )
  );

  // console.log("validNeighborIndexes for", index, validNeighborIndexes);
  const numberNeighboringMines = [...validNeighborIndexes].filter(
    (index) => squares[index].value === "mine"
  ).length;

  return numberNeighboringMines;
};

const getRowAndColumnFromGuess = (guess: string): [number, number] => {
  const [row, column] = guess.split(",");
  const rowNum = parseInt(row, 10);
  const columnNum = parseInt(column, 10);

  return [rowNum, columnNum];
};

const getSquareIndexByRowAndColumn = (row: number, column: number) => {
  return row * numberColumns + column;
};

const main = async () => {
  console.log("Welcome to minesweeper!\n");

  do {
    numberColumns = await setNumberColumns();
    numberRows = await setNumberRows();
    numberMines = await setNumberMines();
    numberSquares = numberColumns * numberRows;

    if (numberMines > numberSquares) {
      console.log("\nCan't have more mines than there are squares.\n");
    }
  } while (numberMines > numberSquares);

  // cache the total number of squares for convenience

  createSquares();

  // put the mines on the board
  seedMines();

  // Initialize the board
  initializeNeighboringMines();

  // Initially print the board with the mines exposed
  printBoard();

  // from now on, don't sown the mines when we print them
  shouldShowMines = false;

  // game loop
  do {
    // get the user's guess and determine if they found a mine
    const guess = await askUserToGuess(numberRows, numberColumns);
    const [row, column] = getRowAndColumnFromGuess(guess);
    const squareIndex = getSquareIndexByRowAndColumn(row, column);
    squares[squareIndex].isExposed = true;
    const isGuessAMine = squares[squareIndex].value === "mine";

    if (isGuessAMine) {
      hasLost = true;
    } else {
      exposedSquareIndexes.add(squareIndex);

      if (exposedSquareIndexes.size === numberSquares - numberMines) {
        hasWon = true;
      } else {
        // only print this if the user hasn't won
        console.log("\nYou cleared an area, please continue\n");
      }
    }

    printBoard();
  } while (!hasLost && !hasWon);

  if (hasLost) {
    console.log("You lose, you selected a mine.");
  }

  if (hasWon) {
    console.log("\nYou won!");
  }
};

main();
