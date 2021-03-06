module.exports = {
	"branches": [
		"master",
		{
			name: '^release\/*',
			prerelease: true,
			channel: 'rc'
		},
		{
			"name": "develop",
			"prerelease": "beta",
			"channel": "beta"
		},
		{
			"name": "^(feature|hotfix)/*",
			"prerelease": "alpha",
			"channel": "alpha"
		}
	],
	"plugins": [
		[
			"@semantic-release/commit-analyzer",
			{
				"preset": "conventionalcommits",
				"releaseRules": [
					{
						"type": "docs",
						"scope": "README",
						"release": "patch"
					},
					{
						"type": "refactor",
						"release": "patch"
					},
					{
						"type": "style",
						"release": "patch"
					}
				]
			}
		],
		[
			"@semantic-release/release-notes-generator",
			{
				"preset": "conventionalcommits",
				"parserOpts": {
					"noteKeywords": [
						"BREAKING CHANGE",
						"BREAKING CHANGES",
						"BREAKING"
					],
					"writerOpts": {
						"commitsSort": [
							"subject",
							"scope"
						]
					}
				}
			}
		],
		[
			"@semantic-release/changelog",
			{
				"changelogFile": "CHANGELOG.md"
			}
		],
		[
			"@semantic-release/git",
			{
				"message": "${nextRelease.version} CHANGELOG [skip ci]",
				"assets": [
					"CHANGELOG.md"
				]
			}
		],
		"@semantic-release/github",
		[
			"@semantic-release/git",
			{
				"assets": [
					"CHANGELOG.md"
				]
			}
		]
	]
};
