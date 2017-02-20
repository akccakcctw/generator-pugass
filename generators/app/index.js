'use strict';
const Generator = require('yeoman-generator');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = Generator.extend({

	initializing: function () {
		this.pkg = require('../../package.json');
	},

	prompting: function () {
		if (!this.options['skip-message']) {
			this.log(yosay('嗨～'));
		}

		const prompts = [{
			type: 'input',
			name: 'appname',
			message: 'Your project name',
			default: this.appname, // default to current folder name
		}, {
			type: 'input',
			name: 'author',
			message: 'Author name',
		}, {
			type: 'input',
			name: 'version',
			message: 'Your project version',
			default: '0.1.0',
		}, {
			type: 'input',
			name: 'description',
			message: 'Your project description',
		}, {
			type: 'input',
			name: 'keywords',
			message: 'Your project keyword',
			default: this.appname,
		}, {
			type: 'checkbox',
			name: 'features',
			message: 'Which additional features would you like to include?',
			choices: [{
				name: 'Sass',
				value: 'includeSass',
				checked: true,
			}, {
				name: 'Bootstrap',
				value: 'includeBootstrap',
				checked: false,
			}, {
				name: 'Modernizr',
				value: 'includeModernizr',
				checked: true,
			}]
		}, {
			type: 'list',
			name: 'legacyBootstrap',
			message: 'Which version of Bootstrap would you like to include?',
			choices: [{
				name: 'Bootstrap 3',
				value: true,
			}, {
				name: 'Bootstrap 4',
				value: false,
			}],
			when: (answers) => {
				return answers.features.indexOf('includeBootstrap') !== -1;
			}
		}, {
			type: 'confirm',
			name: 'includeJQuery',
			message: 'Would you like to include jQuery?',
			default: true,
			when: (answers) => {
				return answers.features.indexOf('includeBootstrap') !== -1;
			}
		}];

		return this.prompt(prompts).then(function (answers) {
			const features = answers.features;
			const hasFeature = (feat) => {
				return features && features.indexOf(feat) !== -1;
			};

			this.includeSass = hasFeature('includeSass');
			this.includeBootstrap = hasFeature('includeBootstrap');
			this.includeModernizr = hasFeature('includeModernizr');
			this.legacyBootstrap = answers.legacyBootstrap;
			this.includeJQuery = answers.includeJQuery;

			this.appname = answers.appname;
			this.author = answers.author;
			this.version = answers.version;
			this.description = answers.description;
			this.keywords = answers.keywords;

		}.bind(this));
	},

	writing: {
		gulpfile: function () {
			this.fs.copyTpl(
				this.templatePath('gulpfile.js'),
				this.destinationPath('gulpfile.js'),
				{
					date: (new Date).toISOString().split('T')[0],
					name: this.pkg.name,
					version: this.pkg.version,
					includeSass: this.includeSass,
					includeBootstrap: this.includeBootstrap,
					legacyBootstrap: this.legacyBootstrap,
					includeBabel: this.options['babel']
				}
			);
		},
		packageJSON: function () {
			this.fs.copyTpl(
				this.templatePath('_package.json'),
				this.destinationPath('package.json'),
				{
					appname: this.appname,
					author: this.author,
					version: this.version,
					description: this.description,
					keywords: this.keywords,
					includeSass: this.includeSass,
					includeBabel: this.options['babel'],
					includeJQuery: this.includeJQuery,
				}
			);
		},
		babel: function () {
			this.fs.copy(
				this.templatePath('babelrc'),
				this.destinationPath('.babelrc')
			);
		},
		git: function () {
			this.fs.copy(
				this.templatePath('gitignore'),
				this.destinationPath('.gitignore')
			);
			this.fs.copy(
				this.templatePath('gitattributes'),
				this.destinationPath('.gitattributes')
			);
		},
		styles: function () {
			let css = ['main', '_variable', '_mixin', '_font', '_component', '_base'];
			let s;
			if (this.includeSass) {
				s = 'sass';
				css = css.map((str) => `${str}.scss`);
				this.fs.copy(
					this.templatePath('config.rb'),
					this.destinationPath('config.rb')
				);
			} else {
				s = 'css';
				css = ['main.css'];
			}
			css.forEach((item) => {
				this.fs.copyTpl(
					this.templatePath(`${s}/${item}`),
					this.destinationPath(`src/${s}/${item}`),
					{
						includeBootstrap: this.includeBootstrap,
						legacyBootstrap: this.legacyBootstrap
					}
				);
			});
		},
		scripts: function () {
			this.fs.copyTpl(
				this.templatePath('js/main.js'),
				this.destinationPath('src/js/main.js'),
				{
					appname: this.appname
				}
			);
		},
		views: function () {
			this.fs.copyTpl(
				this.templatePath('pug/index.pug'),
				this.destinationPath('src/views/index.pug'),
				{
					appname: this.appname,
					author: this.author,
					description: this.description,
				}
			);
			this.fs.copyTpl(
				this.templatePath('pug/_head.pug'),
				this.destinationPath('src/views/partial/head.pug'),
				{
					appname: this.appname,
					author: this.author,
					description: this.description,
				}
			);
			this.fs.copyTpl(
				this.templatePath('pug/_footer.pug'),
				this.destinationPath('src/views/partial/footer.pug'),
				{
					appname: this.appname,
					author: this.author,
				}
			);
		},
		html: function () {
			this.fs.copyTpl(
				this.templatePath('index.html'),
				this.destinationPath('index.html'),
				{
					appname: this.appname,
				}
			);
		},
		eslint: function () {
			this.fs.copy(
				this.templatePath('eslintrc.js'),
				this.destinationPath('.eslintrc.js')
			)
		},
		readme: function () {
			this.fs.copyTpl(
				this.templatePath('README.md'),
				this.destinationPath('README.md'),
				{
					appname: this.appname,
					author: this.author,
				}
			);
		},
		misc: function () {
			mkdirp('src/sass/layout');
			mkdirp('dist/assets');
			mkdirp('dist/vendor');
		}

	},


});
