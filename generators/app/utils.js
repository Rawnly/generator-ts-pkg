exports.semanticRelease = ( props ) => ( {
	devDependencies: {
		"@semantic-release/changelog": "^6.0.0",
		"@semantic-release/commit-analyzer": "^9.0.1",
		"@semantic-release/git": "^10.0.0",
		"@semantic-release/release-notes-generator": "^10.0.2",
		"semantic-release": "^18.0.0",
		[`@semantic-release/${props.autorelease.vcs.toLowerCase()}`]: props.autorelease.vcs === 'Github'
			? "^8.0.1"
			: "^7.0.3",
	}
} );

exports.commitlint = ( props ) => ( {
	scripts: {
		"lint-staged": "lint-staged"
	},
	"lint-staged": {
		"*.ts": [
			"ttsc --noEmit",
			props.eslint.enabled && "eslint --fix",
			props.tests.enabled && "jest --bail --findRelatedTests",
		].filter( Boolean )
	},
	devDependencies: {
		"@commitlint/cli": "^13.2.0",
		"@commitlint/config-conventional": "^13.2.0",
		"lint-staged": "^11.1.2",
		"cz-conventional-changelog": "^3.3.0",
		commitizen: "^4.2.4",
		husky: "^7.0.2",
	},
	config: {
		commitizen: {
			path: "./node_modules/cz-conventional-changelog"
		}
	}
} );


exports.tests = ( props ) => ( {
	scripts: {
		test: 'jest',
		'test:watch': 'jest --watchAll',
		'test:coverage': 'jest --coverage',
		...( props.eslint.enabled ? {
			pretest: "eslint --fix src/**/*",
		} : {} )
	},
	devDependencies: {
		"@types/jest": "^26.0.23",
		jest: "^27.0.5",
		"ts-jest": "^27.0.3",
	}
} );


exports.eslint = ( props ) => ( {
	scripts: {
		lint: 'eslint --fix src/**/*',
	},
	devDependencies: {
		eslint: "^7.29.0",
		"eslint-config-prettier": "^8.3.0",
		"eslint-plugin-jest": "^24.3.6",
		"@typescript-eslint/eslint-plugin": "^4.28.1",
		"@typescript-eslint/parser": "^4.28.1",
		"prettier": "^2.2.0",
	}
} );



/**
 *
 * @param {String} url
 * @returns {Boolean}
 */
exports.isValidUrl = url => {
	const urlRegex = /^https?:\/\/[\w-_\.]+\.\w+(\/(\/?[\w-_]+\/?){0,})?$/g;

	return urlRegex.test( url );
};
