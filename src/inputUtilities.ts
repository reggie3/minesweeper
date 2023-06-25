import { input } from "@inquirer/prompts";

const INVALID_SETUP_NUMBER_TEXT = "Please enter a number.";
const INVALID_FORMAT_TEXT =
  "Invalid format, please enter two comma separated numbers like this '4, 2'.";

// When the game starts ask the user to specify the following for the game:
// The number of rows
export const setNumberRows = async () => {
  const response = await input({
    message: "How many rows?",
    validate: async (input) => {
      if (isNaN(parseInt(input, 10))) {
        return INVALID_SETUP_NUMBER_TEXT;
      }
      return true;
    },
  });
  return parseInt(response, 10);
};

// The number of columns
export const setNumberColumns = async () => {
  const response = await input({
    message: "How Many Columns?",
    validate: async (input) => {
      if (isNaN(parseInt(input, 10))) {
        return INVALID_SETUP_NUMBER_TEXT;
      }
      return true;
    },
  });
  return parseInt(response, 10);
};

// The number of mines
export const setNumberMines = async () => {
  const response = await input({
    message: "How Many Mines?",
    validate: async (input) => {
      if (isNaN(parseInt(input, 10))) {
        return INVALID_SETUP_NUMBER_TEXT;
      }
      return true;
    },
  });
  return parseInt(response, 10);
};

export const askUserToGuess = async (
  numberRows: number,
  numberColumns: number
) => {
  const response = await input({
    message: "Please guess a square ('row' number,'column number')?",
    validate: async (input) => {
      // ensure there are two comma separated values
      const tokens = input.split(",");
      if (tokens.length !== 2) {
        return INVALID_FORMAT_TEXT;
      }

      // ensure we are getting two numbers
      const [row, column] = tokens;
      const rowNum = parseInt(row, 10);
      const columnNum = parseInt(column, 10);
      if (isNaN(rowNum) || isNaN(columnNum)) {
        return INVALID_FORMAT_TEXT;
      }

      // ensure the numbers are in range
      if (rowNum < 0 || rowNum > numberRows - 1) {
        console.log("Please enter a valid row number.");
      }
      if (columnNum < 0 || columnNum > numberColumns - 1) {
        console.log("Please enter a valid column number.");
      }

      return true;
    },
  });
  return response;
};
