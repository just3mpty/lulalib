export class ParseError extends Error {
    constructor(
      message: string,
      readonly position: number,
      readonly notation: "rhythm" | "melody",
    ) {
      super(message);
      this.name = "ParseError";
    }
  }