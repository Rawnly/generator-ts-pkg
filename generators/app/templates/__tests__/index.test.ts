import { sum } from '@src/index'

describe( 'Sum', () => {
  it( 'Should sum given numbers', () => {
    const numbers: number[] = [1, 2, 3]

    const result: number = sum( ...numbers );
    const expected = 6 // 1 + 2 + 3

    expect( result )
      .toBe<number>( expected )
  } )
} )
