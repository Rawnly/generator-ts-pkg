const cowsay = require( 'cowsay' );
const chalk = require( 'chalk' );
const { build } = require( 'esbuild' );
const { nodeExternalsPlugin } = require( 'esbuild-node-externals' );
const { Generator } = require( 'npm-dts' );



const getFlags = () => {
	const args = process.argv.slice( 1 )
		.filter( arg => arg.startsWith( '--' ) );

	return args.reduce( ( flags, arg ) => ( {
		...flags,
		[arg.replace( /^-+/g, '' ).trim()]: true
	} ), {} );
};

const isDev = process.env.NODE_ENV !== 'production';
const isWatching = getFlags().watch === true;
const isProductionBuild = !isWatching && !isDev;

const sharedConfiguration = {
	entryPoints: ['./src/index.ts'],
	bundle: true,
	sourcemap: true,
	color: true,
	minify: true,
	platform: 'node',
	target: 'node14',
	watch: isWatching,
	plugins: [nodeExternalsPlugin()],
};


async function main() {
	console.time( 'Built in' );

	if ( isWatching ) {
		console.log( chalk.bold( `Watching...` ) );
	}

	if ( !isProductionBuild ) {
		console.log( chalk.bold.yellow( '[Dev Mode: ON]' ) );
	} else {
		console.log( chalk.bgGreen.black.bold( 'Production Build' ) );
	}

	const generator = new Generator( {
		entry: 'src/index.ts',
		output: 'dist/index.d.ts'
	} );


	try {
		console.log( chalk.black.bgYellow( '>> Building...' ) );
		await build( {
			...sharedConfiguration,
			outfile: 'dist/index.js',
			incremental: isWatching
		} );

		if ( isProductionBuild ) {
			console.log( chalk.black.bgYellow( '>> Building ESM...' ) );
			await build( {
				...sharedConfiguration,
				outfile: 'dist/index.esm.js',
				format: 'esm'
			} );

			console.log( chalk.yellow( 'Generating DTS' ) );
			await generator.generate();
		}
	} catch ( error ) {
		console.error( error );
	} finally {
		console.timeEnd( 'Built in' );
	}
}

main();
