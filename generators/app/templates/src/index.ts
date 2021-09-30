export const sum = ( ...numbers: number[] ): number =>
  numbers.reduce( ( a, b ) => a + b, 0 )

export const multiply = ( ...numbers: number[] ): number =>
  numbers.reduce( ( a, b ) => a * b, 1 )
