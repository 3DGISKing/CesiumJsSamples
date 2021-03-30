const gulp = require('gulp');
const execSync = require('child_process').execSync;
const {watch} = gulp;
const connect = require('gulp-connect');
const browserSync = require('browser-sync').create();

const port = 1239;

// For development, it is now possible to use 'gulp webserver'
// from the command line to start the server (default port is 8080)
gulp.task('webserver', gulp.series(async function() {
	connect.server({
		port: 1239,
		https: false,
		livereload: true,
		root: __dirname,
	});
}));

gulp.task('pack', async function () {
	execSync('rollup -c rollup.config.js');

	gulp.src('tmp/*')
		.pipe(gulp.dest('.'))
		.pipe(connect.reload());
});

gulp.task('default', gulp.series("pack", "webserver", async function() {
	browserSync.init({
		injectChanges: true,
		proxy: "http://localhost:" + port
	});

	let watchlist = [
		'index.html',
		'src/*',
		'src/*.js',
	];

	watch(watchlist, gulp.series("pack"));
}));

let paths = {
	images: [
		"images/*"
	],
	vendor: [
		"vendor/*",
		"vendor/*/*",
		"vendor/*/*/*",
		"vendor/*/*/*/*",
	],
};

gulp.task('build',
	gulp.series(
		async function(done){
			const dotenv = require('dotenv');
			dotenv.config();

			const config = process.env.config;

			const isRelease = config === 'release' || config !== 'debug';

			if(!isRelease){
				console.log("run build after change config into the release in the dot env file");
				process.exit(1);
			}

			execSync('rollup -c');

			gulp.src(paths.images)
				.pipe(gulp.dest('build/images'));

			gulp.src(paths.vendor)
				.pipe(gulp.dest('build/vendor'));

			gulp.src("index.html")
				.pipe(gulp.dest('build'));

			done();
		}
	)
);
