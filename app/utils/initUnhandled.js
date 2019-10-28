const unhandled = require('electron-unhandled');
const {openNewGitHubIssue, debugInfo} = require('electron-util');


unhandled({
  showDialog: true,
	reportButton: error => {
		openNewGitHubIssue({
			user: 'project-ecc',
			repo: 'sapphire',
			body: `Sapphire Auto generated github issue.\n\nSTACK TRACE:\n\n${error.stack}\n\n\nNode Environment: ${process.env.NODE_ENV}\n\nRunning Environments: \n${debugInfo()}\n`
		});
	},
	logger: error => {
  		console.log(error);
  	}
});

