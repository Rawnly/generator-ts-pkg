'use strict';
const Generator = require( 'yeoman-generator' );
const chalk = require( 'chalk' );
const yosay = require( 'yosay' );
const utils = require( './utils' );

module.exports = class extends Generator {
  constructor ( args, opts ) {
    super( args, opts );

    this.argument( 'npm', {
      type: Boolean,
      default: false
    } );

    this.argument( 'eslint', {
      type: Boolean,
      default: false
    } );

    this.argument( 'commitlint', {
      type: Boolean,
      default: false
    } );
  }

  async prompting() {
    this.env.options.nodePackageManager = this.options.npm ? 'npm' : 'yarn';

    this.log(
      yosay(
        `Welcome to the dandy ${chalk.red( 'generator-ts-pkg' )} generator!`
      )
    );

    const username = await this.user.github.username();
    /**
     * @type {Generator.Questions<any>}
     */
    const identityPrompts = [
      {
        type: 'input',
        name: 'username',
        message: 'What\'s your VCS username',
        default: username,
        validate: val => val.length > 0 || 'Invalid username'
      }
    ];

    /**
     * @type {Generator.Questions<any>}
     */
    const pacakgePrompts = [
      {
        type: 'input',
        name: 'pkg.name',
        message: chalk`What is the {underline name} of your package?`,
        validate: val => ( /[\sA-Z0-9]/g.test( val ) || val.length === 0 ) ? 'Invalid name' : true,
        transformer: val => val.replace( /\s+|-{2,}/g, '-' ).toLowerCase()
      },
      {
        type: 'input',
        name: 'pkg.description',
        message: chalk`What is the {underline description} of your package?`,
        vaidate: value => value.length > 0 || 'Invalid description'
      },
    ];

    /**
     * @type {Generator.Questions<any>}
     */
    const conventionalCommitsPrompts = [
      {
        type: 'confirm',
        name: 'commitlint.enabled',
        message: 'Do you use conventional commits?',
        default: true,
      },
      {
        type: 'input',
        name: 'commitlint.issuePrefix',
        message: 'Issue prefix',
        default: '#',
        when: answers => answers.commitlint.enabled,
      }
    ];

    /**
     * @type {Generator.Questions<any>}
     */
    const semanticReleasePrompts = [
      {
        type: 'confirm',
        name: 'autorelease.enabled',
        message: 'Do you want to setup auto-release?',
        default: true,
      },
      {
        type: 'list',
        name: 'autorelease.vcs',
        message: 'Choose a VCS',
        default: 'github',
        choices: ['Github', 'GitLab'],
        when: a => a.autorelease.enabled
      },
      {
        type: 'input',
        name: 'autorelease.url',
        message: 'GitLab URL',
        default: 'https://gitlab.com',
        validate: url => utils.isValidUrl( url ) || 'Invalid URL',
        when: a => a.autorelease.vcs === 'GitLab',
      }
    ];

    if ( this.options.commitlint ) {
      this.props.commitlint = { enabled: true };
      semanticReleasePrompts.shift();
    }

    /**
     * @type {Generator.Questions<any>}
     */
    const testPrompts = [
      {
        type: 'confirm',
        name: 'tests.enabled',
        message: 'Do you want to setup tests?',
        default: true,
      },
    ];

    /**
     * @type {Generator.Questions<any>}
     */
    const eslintPrompts = [
      {
        type: 'confirm',
        name: 'eslint.enabled',
        message: 'Do you want to eslint?',
        default: true,
      },
    ];

    if ( this.options.eslint ) {
      this.props.eslint = { enabled: true };
      eslintPrompts.shift();
    }

    return this.prompt( [
      ...identityPrompts,
      ...pacakgePrompts,
      ...conventionalCommitsPrompts,
      ...semanticReleasePrompts,
      ...testPrompts,
      ...eslintPrompts
    ] ).then( props => {
      this.props = props;
    } );
  }

  writing() {
    this._setupPackageJson();
    this._copyFiles();
  }

  install() {
    switch ( this.env.options.nodePackageManager ) {
      case 'yarn':
        this.spawnCommand( 'yarn', ['init', '-y'] );
        this.yarnInstall();
        break;
      case 'npm':
        this.spawnCommand( 'npm', ['init', '-y'] );
        this.npmInstall();
        break;
    }
  }

  _copyFiles() {
    const files = [
      '.gitignore',
      'tsconfig.json',
      'build.js',
      'README.md',
      'src',
      {
        files: ['CHANGELOG.md'],
        enabled: this.props.autorelease.enabled,
        data: {
          vcs: this.props.autorelease.vcs,
          vcsUrl: this.props.autorelease.url
        }
      },
      {
        files: ['.releaserc-github.js'],
        enabled: this.props.autorelease.enabled && this.props.autorelease.vcs === 'Github',
        data: {
          vcs: this.props.autorelease.vcs,
          vcsUrl: this.props.autorelease.url
        }
      },
      {
        files: ['.releaserc-gitlab.js'],
        enabled: this.props.autorelease.enabled && this.props.autorelease.vcs === 'GitLab',
        data: {
          vcs: this.props.autorelease.vcs,
          vcsUrl: this.props.autorelease.url
        }
      },
      {
        files: ['prettierrc.json', '.eslintrc.json', '.eslintignore'],
        enabled: this.props.eslint.enabled,
        data: {}
      },
      {
        files: ['commitlint.config.js'],
        enabled: this.props.commitlint.enabled,
        data: {
          issuePrefix: this.props.commitlint.issuePrefix
        }
      },
      {
        files: ['jest.config.js', '__tests__'],
        enabled: this.props.tests.enabled,
        data: {}
      }
    ];

    for ( const file of files ) {
      if ( typeof file === 'string' ) {
        this.fs.copy(
          this.templatePath( file ),
          this.destinationPath( file )
        );

        continue;
      }

      if ( file.enabled ) {
        for ( const filename of file.files ) {
          this.fs.copyTpl(
            this.templatePath( filename ),
            this.destinationPath( filename ),
            file.data
          );
        }
      }
    }
  }

  _setupPackageJson() {
    this.fs.copyTpl(
      this.templatePath( 'package.template.json' ),
      this.destinationPath( 'package.json' ),
      this.props.pkg
    );

    if ( this.props.autorelease.enabled ) {
      this.fs.extendJSON(
        this.destinationPath( 'package.json' ),
        utils.semanticRelease( this.props )
      );
    }

    if ( this.props.eslint.enabled ) {
      this.fs.extendJSON(
        this.destinationPath( 'package.json' ),
        utils.eslint( this.props )
      );
    }

    if ( this.props.tests.enabled ) {
      this.fs.extendJSON(
        this.destinationPath( 'package.json' ),
        utils.tests( this.props )
      );
    }

    if ( this.props.commitlint.enabled ) {
      this.fs.extendJSON(
        this.destinationPath( 'package.json' ),
        utils.commitlint( this.props )
      );
    }
  }
};
